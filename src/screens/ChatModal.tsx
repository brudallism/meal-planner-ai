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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAppStore } from '../store/appStore';
import { extractMealData } from '../services/nutritionParser';
import { parseAIActions } from '../services/aiActionParser';
import { generateMealSuggestions } from '../services/mealSuggestions';

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
    
    // OpenAI API call
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

CORE ACTIONS YOU CAN PERFORM:
🍽️ LOG MEALS: When they mention eating something, automatically log it with macros
📊 UPDATE GOALS: Adjust their nutrition targets based on their needs
🥗 SUGGEST MEALS: Recommend foods that fit their goals and preferences
📅 PLAN AHEAD: Help create meal plans that work for their lifestyle
🎯 TRACK PROGRESS: Show how they're doing toward their goals

CONVERSATION FLOW:
1. Acknowledge what they've shared
2. Ask 1-2 specific questions to understand better
3. Give actionable advice or take an action (like logging food)
4. End with encouragement or next steps

BOUNDARIES: Only discuss nutrition, food, health, and wellness. If they ask about other topics, redirect warmly: "I'm all about helping you with your nutrition journey! What can I help you with food-wise today?"

USER'S CURRENT STATUS:
- Daily Goals: ${nutritionGoals.calories} calories, ${nutritionGoals.protein}g protein, ${nutritionGoals.carbs}g carbs, ${nutritionGoals.fat}g fat
- Today's Progress: ${dailyTotals.calories}/${nutritionGoals.calories} calories (${Math.round((dailyTotals.calories/nutritionGoals.calories)*100)}%), ${dailyTotals.protein}g/${nutritionGoals.protein}g protein, ${dailyTotals.carbs}g/${nutritionGoals.carbs}g carbs, ${dailyTotals.fat}g/${nutritionGoals.fat}g fat
- Meals logged today: ${todaysMeals.length} items

Remember: You're not just answering questions - you're actively helping them build better eating habits through conversation and actions!`
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

      // Parse and execute AI actions
      try {
        // First try the detailed meal parsing
        const mealData = await extractMealData(userMessage.text, aiResponse);
        if (mealData && mealData.items.length > 0) {
          // Create meal logs from parsed data
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
              logged_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            };
            addMeal(mealLog);
          }
          
          // Send a confirmation message that meals were logged
          const confirmationMessage = {
            id: `confirm_${Date.now()}`,
            text: `✅ Awesome! I've logged ${mealData.items.length} item${mealData.items.length > 1 ? 's' : ''} for you. Your updated totals: ${dailyTotals.calories + mealData.totalMacros.calories} calories, ${dailyTotals.protein + mealData.totalMacros.protein}g protein! 🎉`,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, confirmationMessage]);
        }

        // Then parse other AI actions
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
                
                // Send confirmation that goals were updated
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
              // Could trigger a visual progress indicator or update
              console.log('Showing progress triggered by AI');
              break;
            default:
              console.log('Unhandled action:', action.type);
          }
        }
      } catch (error) {
        console.log('AI action parsing failed:', error);
        // Silent fail - don't disrupt the chat experience
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
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>AI is typing...</Text>
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask me about nutrition..."
            placeholderTextColor={COLORS.gray}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
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
      </KeyboardAvoidingView>
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
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.cream,
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