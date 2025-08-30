import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAppStore } from '../store/appStore';
import { extractMealData } from '../services/nutritionParser';
import { parseAIActions } from '../services/aiActionParser';
import { generateMealSuggestions } from '../services/mealSuggestions';
import { analyzeMessageScope, generateRedirectionResponse } from '../services/scopeFilter';
import { confirmationService } from '../services/confirmationService';
import { detectConfirmation, getLatestPendingMeal } from '../services/confirmationDetector';
import { analyzeMealDetails, generateDetailQuestions, hasProvidedMissingDetails } from '../services/mealDetailAnalyzer';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatModal = ({ navigation }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const addMeal = useAppStore((state) => state.addMeal);
  const { dailyTotals, nutritionGoals, todaysMeals } = useAppStore();
  const setNutritionGoals = useAppStore((state) => state.setNutritionGoals);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: '1',
        text: `Hey there! 🌟 I'm NutriCoach, your friendly nutrition buddy! I'm here to help you feel amazing through better food choices.\n\nI can see you're at ${dailyTotals.calories} calories today out of your ${nutritionGoals.calories} goal - nice start! 💪\n\nWhat's on your mind? Maybe you:\n• Just ate something and want to log it?\n• Need ideas for your next meal?\n• Want to chat about your nutrition goals?\n\nI'm all ears! What's going on with your food journey today?`,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    // Keyboard event listeners
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
      // Scroll to bottom when keyboard shows
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Show typing indicator
    setIsTyping(true);

    // Pre-screen message for nutrition scope
    const scopeAnalysis = analyzeMessageScope(userMessage.text);
    
    if (scopeAnalysis.redirectionNeeded) {
      // Immediate redirection without calling OpenAI
      const redirectionMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateRedirectionResponse(scopeAnalysis),
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, redirectionMessage]);
      setIsTyping(false);
      return;
    }
    
    // Check if this is a confirmation/rejection response first
    const confirmationResult = detectConfirmation(userMessage.text);
    const pendingMeal = getLatestPendingMeal(confirmationService);

    // Check if user is providing missing details for a pending meal
    if (pendingMeal && pendingMeal.data.needsDetails) {
      const providedDetails = hasProvidedMissingDetails(userMessage.text, pendingMeal.data.missingDetails);
      
      if (providedDetails) {
        // User provided additional details - re-analyze with combined information
        const combinedMessage = `${pendingMeal.userMessage} ${userMessage.text}`;
        
        try {
          const updatedMealData = await extractMealData(combinedMessage, '');
          if (updatedMealData && updatedMealData.items.length > 0) {
            // Update the pending meal with new details
            pendingMeal.data = { ...updatedMealData, needsDetails: false };
            
            // Ask for final confirmation
            const confirmationText = `Great! Now I have: ${updatedMealData.items.map(item => 
              `${item.quantity}${item.unit} ${item.name}`
            ).join(', ')} for ${updatedMealData.mealType || 'your meal'}. Should I add this to your tracker? 📊`;
            
            const confirmationMessage = {
              id: `final_confirm_${Date.now()}`,
              text: confirmationText,
              isUser: false,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, confirmationMessage]);
            setIsTyping(false);
            return;
          }
        } catch (error) {
          console.log('Updated meal parsing failed:', error);
        }
      }
    }

    if (confirmationResult.isConfirmation && pendingMeal && !pendingMeal.data.needsDetails) {
      // User confirmed - execute the pending meal log
      try {
        const mealData = pendingMeal.data;
        for (const item of mealData.items) {
          const mealLog = {
            id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id: 'demo-user',
            meal_name: item.name,
            meal_type: mealData.mealType || 'snack' as const,
            calories: item.macros.calories,
            protein: item.macros.protein,
            carbs: item.macros.carbs,
            fat: item.macros.fat,
            fiber: item.macros.fiber,
            sugar: item.macros.sugar,
            confidence: mealData.confidence,
            logged_at: mealData.eatingTime || new Date().toISOString(),
            created_at: new Date().toISOString(),
          };
          addMeal(mealLog);
        }
        
        // Confirm the action
        confirmationService.confirmAction(pendingMeal.id);
        
        // Send success message
        const successMessage = {
          id: `success_${Date.now()}`,
          text: `✅ Perfect! I've logged your meal. Your progress is looking great! 🎉`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, successMessage]);
        setIsTyping(false);
        return;
      } catch (error) {
        console.error('Meal logging error:', error);
      }
    } else if (confirmationResult.isRejection && pendingMeal) {
      // User rejected - cancel the pending meal log
      confirmationService.rejectAction(pendingMeal.id);
      
      const rejectionMessage = {
        id: `rejection_${Date.now()}`,
        text: "No problem! I won't log that meal. What else can I help you with regarding your nutrition? 😊",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, rejectionMessage]);
      setIsTyping(false);
      return;
    }

    // Continue with regular OpenAI API call
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You're NutriCoach, a friendly, enthusiastic nutrition expert who's like having a best friend who's also a certified nutritionist! 🌟

PERSONALITY: Warm, encouraging, curious, and genuinely excited about helping people feel their best through food. You're the friend who remembers details about their goals, celebrates wins, and gently guides them back on track.

CONVERSATION STYLE:
- Ask follow-up questions to understand their unique situation
- Remember and reference previous conversations 
- Give personalized suggestions based on what you learn
- Celebrate small wins and progress
- Use encouraging language and occasional emojis
- Make nutrition feel approachable, not overwhelming
- Keep the conversation flowing naturally
- Offer healthier alternatives when users mention unhealthy choices
- Guide users toward better nutrition decisions with gentle suggestions

CORE ACTIONS YOU CAN PERFORM:
🍽️ LOG MEALS: When they mention eating something, ask for confirmation before logging
📊 UPDATE GOALS: Adjust their nutrition targets based on their needs  
🥗 SUGGEST MEALS: Recommend foods that fit their goals and preferences
📅 PLAN AHEAD: Help create meal plans that work for their lifestyle
🎯 TRACK PROGRESS: Show how they're doing toward their goals

CRITICAL MEAL LOGGING PROTOCOL:
1. When user mentions eating food, DO NOT auto-log immediately
2. Check if SPECIFIC QUANTITIES are provided (oz, grams, cups, slices, pieces, etc.)
3. If quantities are missing, ask detailed questions:
   - Eggs: "How many eggs? What size?"
   - Bread/Toast: "How many slices? What type of bread?"
   - Meat/Fish: "How many ounces? What cut/type?"
   - Vegetables: "How much (cups)? Which vegetables specifically?"
   - Any food: "What type exactly? How much?"
4. Ask for eating time: "What time did you eat this?"
5. Only after getting ALL details, ask: "Should I add this to your tracker?"
6. Wait for user confirmation before logging
7. If user just mentions enjoying food, ask: "Did you actually eat this, or are we chatting about it?"

ACCURACY IS CRITICAL - Never log meals without specific quantities!

CONVERSATION FLOW:
1. Acknowledge what they've shared
2. Ask 1-2 specific questions to understand better
3. Give actionable advice or take an action (like logging food)
4. If they mention unhealthy choices, suggest better alternatives
5. End with encouragement or next steps

GUIDANCE EXAMPLES:
- User wants "1lb bag of sour patch kids" → Suggest "How about an açaí bowl with fresh berries? You'll get that sweet satisfaction plus antioxidants!"
- User plans "fast food burger" → Suggest "What about a turkey burger with avocado? Still satisfying but much more nutritious!"
- User craves "soda" → Suggest "Try sparkling water with fresh fruit slices - bubbly and refreshing!"

🚫 ABSOLUTE RESTRICTIONS - NEVER DISCUSS:
- Exercise, workouts, fitness, gym, sports, physical activity
- Medical conditions (except diet-related: PCOS, Hashimoto's, gluten/lactose intolerance)
- Technology, apps, software, devices (except food/nutrition apps)
- Personal life, relationships, work, career, family
- Entertainment, movies, music, news, politics
- Travel, weather, hobbies, lifestyle advice
- Shopping (non-food), clothing, electronics
- General health advice beyond nutrition

✅ YOUR EXCLUSIVE SCOPE - ONLY DISCUSS:
- Nutrition, macros, micronutrients, calories, vitamins, minerals
- Food, meals, cooking, recipes, ingredients, preparation
- Meal planning, grocery shopping, meal prep, kitchen techniques
- Dietary conditions: PCOS, Hashimoto's, celiac, gluten intolerance, lactose intolerance
- Eating habits, portion sizes, food timing, hydration
- Supplements related to nutrition and diet
- Restaurants, dining, food choices, menu navigation
- Food storage, freshness, food safety

CRITICAL BOUNDARY RULE: If ANY topic falls outside nutrition/food scope, immediately redirect with: "I'm your dedicated nutrition coach! Let's focus on your food and eating goals. What nutrition topic can I help you with today?"

USER'S CURRENT NUTRITION STATUS:
- Daily Goals: ${nutritionGoals.calories} calories, ${nutritionGoals.protein}g protein, ${nutritionGoals.carbs}g carbs, ${nutritionGoals.fat}g fat
- Today's Progress: ${dailyTotals.calories}/${nutritionGoals.calories} calories (${Math.round((dailyTotals.calories/nutritionGoals.calories)*100)}%), ${dailyTotals.protein}g/${nutritionGoals.protein}g protein, ${dailyTotals.carbs}g/${nutritionGoals.carbs}g carbs, ${dailyTotals.fat}g/${nutritionGoals.fat}g fat
- Meals logged today: ${todaysMeals.length} items

Remember: You're actively helping them build better eating habits through engaging conversation AND taking actions in their nutrition app!`
            },
            {
              role: 'user',
              content: userMessage.text
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || "I'm having trouble responding right now. Please try asking about your nutrition goals again.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Parse potential meal data for confirmation (don't log immediately)
      try {
        const mealData = await extractMealData(userMessage.text, aiResponse);
        if (mealData && mealData.items.length > 0) {
          // Analyze if we have all the necessary details
          const foodItems = mealData.items.map(item => item.name);
          const detailAnalysis = analyzeMealDetails(foodItems, userMessage.text);
          
          if (!detailAnalysis.hasAllDetails) {
            // Missing details - AI should ask for more information
            const detailQuestions = generateDetailQuestions(detailAnalysis, mealData.mealType);
            
            // Store incomplete meal data for later completion
            const pendingActionId = confirmationService.addPendingAction({
              type: 'meal_log',
              data: { ...mealData, needsDetails: true, missingDetails: detailAnalysis.gaps },
              userMessage: userMessage.text,
              aiResponse: aiResponse
            });
            
            // Send follow-up message asking for details if AI didn't
            setTimeout(() => {
              if (confirmationService.getPendingActions().some(a => a.id === pendingActionId)) {
                const detailMessage = {
                  id: `details_${Date.now()}`,
                  text: detailQuestions,
                  isUser: false,
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, detailMessage]);
              }
            }, 1500);
          } else {
            // All details provided - proceed to confirmation
            const pendingActionId = confirmationService.addPendingAction({
              type: 'meal_log',
              data: mealData,
              userMessage: userMessage.text,
              aiResponse: aiResponse
            });
            
            // AI should have asked for confirmation in its response
            setTimeout(() => {
              if (confirmationService.getPendingActions().some(a => a.id === pendingActionId)) {
                const mealConfirmation = {
                  ...mealData,
                  mealType: mealData.mealType || 'snack' as const,
                  eatingTime: '' // Will prompt user for time
                };
                const confirmationText = confirmationService.generateConfirmationMessage(mealConfirmation, userMessage.text);
                const confirmationMessage = {
                  id: `confirm_prompt_${Date.now()}`,
                  text: confirmationText,
                  isUser: false,
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, confirmationMessage]);
              }
            }, 1500);
          }
        }

        // Handle other AI actions (goals, suggestions, etc.)
        const actions = await parseAIActions(userMessage.text, aiResponse);
        for (const action of actions) {
          switch (action.type) {
            case 'update_goals':
              if (action.data.calories || action.data.protein || action.data.carbs || action.data.fat) {
                const newGoals = {
                  calories: action.data.calories || nutritionGoals.calories,
                  protein: action.data.protein || nutritionGoals.protein,
                  carbs: action.data.carbs || nutritionGoals.carbs,
                  fat: action.data.fat || nutritionGoals.fat,
                };
                setNutritionGoals(newGoals);
                
                const goalUpdateMessage = {
                  id: `goal_update_${Date.now()}`,
                  text: `🎯 Perfect! I've updated your nutrition goals: ${newGoals.calories} calories, ${newGoals.protein}g protein, ${newGoals.carbs}g carbs, ${newGoals.fat}g fat. Let's smash these targets! 💪`,
                  isUser: false,
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, goalUpdateMessage]);
              }
              break;
            case 'suggest_meals':
              try {
                const suggestions = await generateMealSuggestions(
                  action.data.meal_type || 'snack',
                  dailyTotals,
                  nutritionGoals,
                  action.data.preferences || []
                );
                if (suggestions.length > 0) {
                  const suggestionText = `Here are some meal ideas I found for you:\n\n${suggestions.map((s, i) => 
                    `${i + 1}. **${s.name}** (${s.calories} cal)\n${s.description}\nIngredients: ${s.ingredients.join(', ')}\n`
                  ).join('\n')}`;
                  
                  const suggestionMessage = {
                    id: `suggestion_${Date.now()}`,
                    text: suggestionText,
                    isUser: false,
                    timestamp: new Date(),
                  };
                  setMessages(prev => [...prev, suggestionMessage]);
                }
              } catch (error) {
                console.log('Meal suggestion failed:', error);
              }
              break;
            case 'show_progress':
              console.log('Showing progress triggered by AI');
              break;
            default:
              console.log('Unhandled action:', action.type);
          }
        }
      } catch (error) {
        console.log('AI action parsing failed:', error);
      }
    } catch (error) {
      console.error('OpenAI API Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  }, [inputText, addMeal, nutritionGoals, setNutritionGoals]);

  const quickSuggestions = [
    { id: 1, text: "I just ate breakfast", icon: "restaurant" },
    { id: 2, text: "What should I eat next?", icon: "chatbubble-ellipses" },
    { id: 3, text: "How am I doing today?", icon: "analytics" },
    { id: 4, text: "Help me plan my meals", icon: "calendar" },
  ];

  const handleQuickSuggestion = (suggestion: any) => {
    setInputText(suggestion.text);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userText : styles.aiText
        ]}>
          {item.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiAvatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
          <View>
            <Text style={styles.aiName}>Nutrition AI</Text>
            <Text style={styles.aiStatus}>
              {isTyping ? 'Typing...' : 'Online'}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      {/* Quick Suggestions (show only when chat is minimal) */}
      {messages.length <= 2 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Quick actions:</Text>
          <View style={styles.suggestions}>
            {quickSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionChip}
                onPress={() => handleQuickSuggestion(suggestion)}
              >
                <Ionicons 
                  name={suggestion.icon as any} 
                  size={16} 
                  color={COLORS.teal} 
                />
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContainer,
            keyboardVisible && { paddingBottom: keyboardHeight + 80 }
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>AI is typing...</Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Input Container - Outside KeyboardAvoidingView for better behavior */}
      <View style={[
        styles.inputContainer,
        keyboardVisible && { bottom: keyboardHeight }
      ]}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask me about nutrition..."
          placeholderTextColor={COLORS.gray}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          onFocus={() => {
            // Scroll to bottom when input is focused
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={!inputText.trim() ? COLORS.gray : COLORS.white} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.teal + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  avatarText: {
    fontSize: 20,
  },
  aiName: {
    fontSize: SIZES.callout,
    fontWeight: '600',
    color: COLORS.teal,
  },
  aiStatus: {
    fontSize: SIZES.caption1,
    color: COLORS.sage,
  },
  closeButton: {
    padding: 8,
  },
  suggestionsContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  suggestionsTitle: {
    fontSize: SIZES.callout,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
  },
  suggestionChip: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: SIZES.base + 4,
    paddingVertical: SIZES.base,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  suggestionText: {
    fontSize: SIZES.caption1,
    color: COLORS.teal,
    fontWeight: '500',
    marginLeft: 6,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  messagesContainer: {
    paddingVertical: SIZES.base,
    paddingBottom: 120, // Increased space for input container
  },
  messageContainer: {
    marginBottom: SIZES.base,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: COLORS.teal,
    borderBottomRightRadius: 8,
  },
  aiBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 8,
    ...SHADOWS.light,
  },
  messageText: {
    fontSize: SIZES.callout,
    lineHeight: 20,
  },
  userText: {
    color: COLORS.white,
  },
  aiText: {
    color: COLORS.teal,
  },
  timestamp: {
    fontSize: SIZES.caption2,
    color: COLORS.gray,
    marginTop: 4,
    marginHorizontal: SIZES.base,
  },
  typingContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
  },
  typingBubble: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    alignSelf: 'flex-start',
    ...SHADOWS.light,
  },
  typingText: {
    fontSize: SIZES.callout,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    paddingBottom: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.cream,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    fontSize: SIZES.callout,
    color: COLORS.teal,
    marginRight: SIZES.base,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
});

export default ChatModal;