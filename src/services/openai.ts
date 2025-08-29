import { OPENAI_API_KEY, OPENAI_MODEL } from '../constants/config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface MealLogEntry {
  id: string;
  name: string;
  timestamp: Date;
  nutrition: NutritionData;
  confidence: number;
}

export interface MealPlan {
  id: string;
  date: string;
  meals: {
    breakfast?: MealLogEntry;
    lunch?: MealLogEntry;
    dinner?: MealLogEntry;
    snacks?: MealLogEntry[];
  };
  totalNutrition: NutritionData;
}

class OpenAIService {
  private apiKey: string;
  private model: string;
  private baseURL = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = OPENAI_API_KEY || '';
    this.model = OPENAI_MODEL || 'gpt-4o-mini';
  }

  private getSystemPrompt(): string {
    return `You are an expert AI nutrition assistant and registered dietitian. Your role is to:

CONTEXT: You help users log meals, plan nutrition, find healthy food options, and provide personalized dietary guidance.

STYLE: 
- Be conversational, friendly, and encouraging like a supportive friend
- Use simple language, avoid jargon
- Be concise but helpful
- Show empathy for dietary challenges

TONE: Warm, non-judgmental, motivational. Never shame users for food choices.

AUDIENCE: Health-conscious individuals seeking flexible nutrition guidance

RESPONSE FORMAT: When logging food, always provide structured nutrition data in JSON format:
{
  "message": "Your conversational response",
  "action": "log_meal" | "plan_meals" | "find_restaurants" | "general_advice",
  "data": {
    "meal": {
      "name": "Food name",
      "nutrition": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "sodium": number
      },
      "confidence": 0.0-1.0
    }
  }
}

IMPORTANT: Always provide nutritional estimates even if incomplete information is given. Use your knowledge of typical serving sizes and food composition.`;
  }

  async sendMessage(messages: ChatMessage[], userContext?: any): Promise<any> {
    try {
      const systemMessage: ChatMessage = {
        role: 'system',
        content: this.getSystemPrompt()
      };

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [systemMessage, ...messages],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      // Parse JSON response
      try {
        return JSON.parse(content);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          message: content,
          action: 'general_advice',
          data: null
        };
      }
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      throw error;
    }
  }

  async logMeal(foodDescription: string, userContext?: any): Promise<MealLogEntry> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `I ate: ${foodDescription}. Please log this meal and provide nutrition information.`
      }
    ];

    const response = await this.sendMessage(messages, userContext);
    
    if (response.action === 'log_meal' && response.data?.meal) {
      return {
        id: Date.now().toString(),
        name: response.data.meal.name,
        timestamp: new Date(),
        nutrition: response.data.meal.nutrition,
        confidence: response.data.meal.confidence || 0.8
      };
    }

    throw new Error('Failed to parse meal data from AI response');
  }

  async generateMealPlan(preferences: any, restrictions: any): Promise<MealPlan[]> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Please generate a weekly meal plan based on my preferences: ${JSON.stringify(preferences)} and restrictions: ${JSON.stringify(restrictions)}`
      }
    ];

    const response = await this.sendMessage(messages);
    
    // This would need more sophisticated parsing for meal plans
    // For now, return a placeholder structure
    return [];
  }

  async findRestaurantOptions(location: string, macroTargets: any): Promise<any[]> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `I'm at ${location} and need food options that fit my macro targets: ${JSON.stringify(macroTargets)}`
      }
    ];

    const response = await this.sendMessage(messages);
    return response.data?.restaurants || [];
  }

  // Health check method
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }
}

export const openAIService = new OpenAIService();