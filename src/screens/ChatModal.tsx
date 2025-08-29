import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GiftedChat, IMessage, InputToolbar, Composer, Send } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const ChatModal = ({ navigation }: any) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        _id: 1,
        text: "Hi! I'm your AI nutrition assistant. I'm here to help you log meals, plan your nutrition, and find healthy options. What would you like to do today?",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Nutrition AI',
          avatar: '🤖',
        },
      },
    ]);
  }, []);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    // Add user message immediately
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate AI response (replace with actual OpenAI API call)
    setTimeout(() => {
      const userMessage = newMessages[0].text.toLowerCase();
      let aiResponse = "I understand you want help with nutrition. Let me assist you with that!";
      
      // Simple response logic (will be replaced with OpenAI)
      if (userMessage.includes('meal') || userMessage.includes('food')) {
        aiResponse = "Great! I can help you log meals and track your nutrition. What did you eat?";
      } else if (userMessage.includes('plan')) {
        aiResponse = "I'd love to help you plan your meals! What are your nutrition goals?";
      } else if (userMessage.includes('restaurant') || userMessage.includes('eating out')) {
        aiResponse = "I can help you find healthy options nearby! Would you like me to suggest some restaurants?";
      }

      const aiMessage: IMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: aiResponse,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Nutrition AI',
          avatar: '🤖',
        },
      };

      setMessages(previousMessages => GiftedChat.append(previousMessages, [aiMessage]));
      setIsTyping(false);
    }, 1500);
  }, []);

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };

  const renderComposer = (props: any) => {
    return (
      <Composer
        {...props}
        textInputStyle={styles.composer}
        placeholder="Ask me about nutrition..."
        placeholderTextColor={COLORS.gray}
      />
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props} containerStyle={styles.sendContainer}>
        <View style={styles.sendButton}>
          <Ionicons name="send" size={20} color={COLORS.white} />
        </View>
      </Send>
    );
  };

  const quickSuggestions = [
    { id: 1, text: "Log my breakfast", icon: "restaurant" },
    { id: 2, text: "Find food near me", icon: "location" },
    { id: 3, text: "Plan this week", icon: "calendar" },
    { id: 4, text: "Check my macros", icon: "analytics" },
  ];

  const handleQuickSuggestion = (suggestion: any) => {
    const message: IMessage = {
      _id: Math.round(Math.random() * 1000000),
      text: suggestion.text,
      createdAt: new Date(),
      user: {
        _id: 1,
        name: 'You',
      },
    };
    onSend([message]);
  };

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

      {/* Quick Suggestions (show only when chat is empty or minimal) */}
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

      {/* Chat */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{
            _id: 1,
            name: 'You',
          }}
          renderInputToolbar={renderInputToolbar}
          renderComposer={renderComposer}
          renderSend={renderSend}
          isTyping={isTyping}
          messagesContainerStyle={styles.messagesContainer}
          minInputToolbarHeight={60}
          bottomOffset={Platform.OS === 'ios' ? 0 : 0}
          renderAvatar={null}
          showUserAvatar={false}
          showAvatarForEveryMessage={false}
        />
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
  messagesContainer: {
    backgroundColor: COLORS.cream,
  },
  inputToolbar: {
    backgroundColor: COLORS.cream,
    borderTopColor: COLORS.lightGray,
    borderTopWidth: 1,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base,
  },
  inputPrimary: {
    alignItems: 'center',
  },
  composer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingHorizontal: SIZES.padding,
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: Platform.OS === 'ios' ? 8 : 6,
    fontSize: SIZES.callout,
    color: COLORS.teal,
    marginRight: SIZES.base,
    maxHeight: 100,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
    marginBottom: 4,
  },
  sendButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatModal;