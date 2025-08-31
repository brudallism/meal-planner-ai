export interface AIAction {
  type: 'log_meal' | 'update_goals' | 'suggest_meals' | 'show_progress' | 'plan_meal' | 'edit_meal' | 'delete_meal' | 'calculate_remaining';
  data: any;
  confidence: number;
}

export const parseAIActions = async (userMessage: string, aiResponse: string): Promise<AIAction[]> => {
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
            content: `You are an AI action parser. Analyze conversations between a user and NutriCoach to detect specific actions that should be performed in the nutrition app.

DETECT THESE ACTIONS:

1. LOG_MEAL: When user mentions eating/drinking something specific
   Format: {
     "type": "log_meal",
     "data": {
       "food": "food name",
       "quantity": "amount",
       "meal_type": "breakfast|lunch|dinner|snack"
     },
     "confidence": 0.0-1.0
   }

2. UPDATE_GOALS: When discussing changing nutrition targets
   Format: {
     "type": "update_goals", 
     "data": {
       "calories": number,
       "protein": number,
       "carbs": number,
       "fat": number
     },
     "confidence": 0.0-1.0
   }

3. SUGGEST_MEALS: When asking for meal recommendations
   Format: {
     "type": "suggest_meals",
     "data": {
       "meal_type": "breakfast|lunch|dinner|snack",
       "preferences": ["dietary preferences"],
       "calorie_range": [min, max]
     },
     "confidence": 0.0-1.0
   }

4. SHOW_PROGRESS: When asking about current nutrition status
   Format: {
     "type": "show_progress",
     "data": {},
     "confidence": 0.0-1.0
   }

5. EDIT_MEAL: When user wants to modify a logged meal
   Format: {
     "type": "edit_meal",
     "data": {
       "meal_identifier": "description of which meal to edit",
       "changes": "what to change about it"
     },
     "confidence": 0.0-1.0
   }

6. DELETE_MEAL: When user wants to remove a logged meal
   Format: {
     "type": "delete_meal", 
     "data": {
       "meal_identifier": "description of which meal to delete"
     },
     "confidence": 0.0-1.0
   }

7. CALCULATE_REMAINING: When asking how much more they need to reach goals
   Format: {
     "type": "calculate_remaining",
     "data": {
       "macro": "protein|calories|carbs|fat|all"
     },
     "confidence": 0.0-1.0
   }

RULES:
- Only return actions with confidence > 0.7
- Return empty array if no clear actions detected
- Be conservative - better to miss an action than create wrong one

Return valid JSON array or empty array []`
          },
          {
            role: 'user',
            content: `User: "${userMessage}"\nAI: "${aiResponse}"`
          }
        ],
        max_tokens: 400,
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return [];

    try {
      const actions = JSON.parse(content);
      return Array.isArray(actions) ? actions.filter(a => a.confidence > 0.7) : [];
    } catch {
      return [];
    }
  } catch (error) {
    console.error('AI action parsing error:', error);
    return [];
  }
};