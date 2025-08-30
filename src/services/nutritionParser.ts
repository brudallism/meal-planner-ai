export interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface MealItem {
  name: string;
  quantity: string;
  unit: string;
  macros: MacroData;
}

export interface ParsedMeal {
  items: MealItem[];
  totalMacros: MacroData;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  confidence: number;
}

export const extractMealData = async (userMessage: string, aiResponse: string): Promise<ParsedMeal | null> => {
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
            content: `You are a nutrition data extraction specialist. Extract structured meal and macro information from conversations.

TASK: Parse the user's message and AI response to extract meal logging data in JSON format.

RULES:
- Only extract if the conversation involves actual food items being logged/tracked
- Estimate realistic macro values based on typical portions
- Return null if no meal logging is detected
- Be conservative with confidence scores

RESPONSE FORMAT (JSON only):
{
  "items": [
    {
      "name": "string",
      "quantity": "string", 
      "unit": "string",
      "macros": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number
      }
    }
  ],
  "totalMacros": {
    "calories": number,
    "protein": number, 
    "carbs": number,
    "fat": number
  },
  "mealType": "breakfast|lunch|dinner|snack",
  "confidence": 0.0-1.0
}

Return only valid JSON or null if no meal data detected.`
          },
          {
            role: 'user',
            content: `User: "${userMessage}"\nAI: "${aiResponse}"`
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content || content.toLowerCase().includes('null')) {
      return null;
    }

    try {
      const parsed = JSON.parse(content);
      return parsed.confidence > 0.6 ? parsed : null;
    } catch {
      return null;
    }
  } catch (error) {
    console.error('Nutrition parsing error:', error);
    return null;
  }
};