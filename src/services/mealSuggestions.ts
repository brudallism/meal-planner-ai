interface MealSuggestion {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  ingredients: string[];
}

interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const generateMealSuggestions = async (
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  currentMacros: MacroTarget,
  targetMacros: MacroTarget,
  preferences: string[] = []
): Promise<MealSuggestion[]> => {
  
  const remainingMacros = {
    calories: Math.max(0, targetMacros.calories - currentMacros.calories),
    protein: Math.max(0, targetMacros.protein - currentMacros.protein),
    carbs: Math.max(0, targetMacros.carbs - currentMacros.carbs),
    fat: Math.max(0, targetMacros.fat - currentMacros.fat),
  };

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
            content: `You are a nutrition-focused meal suggestion expert. Generate 3 meal suggestions that fit the user's remaining macro needs.

REQUIREMENTS:
- Suggest realistic, practical meals for ${mealType}
- Target the remaining macros: ${remainingMacros.calories} calories, ${remainingMacros.protein}g protein, ${remainingMacros.carbs}g carbs, ${remainingMacros.fat}g fat
- Consider preferences: ${preferences.join(', ') || 'none specified'}
- Each suggestion should be achievable and tasty

RESPONSE FORMAT (JSON only):
[
  {
    "name": "Meal Name",
    "calories": 450,
    "protein": 25,
    "carbs": 35,
    "fat": 18,
    "description": "Brief appealing description",
    "ingredients": ["ingredient1", "ingredient2", "ingredient3"]
  }
]

Return exactly 3 suggestions in valid JSON format.`
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return [];

    try {
      const suggestions = JSON.parse(content);
      return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [];
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Meal suggestion error:', error);
    return [];
  }
};