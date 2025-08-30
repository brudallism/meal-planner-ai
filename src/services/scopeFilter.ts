// Comprehensive nutrition scope filtering
export interface ScopeAnalysis {
  isNutritionRelated: boolean;
  confidence: number;
  detectedTopics: string[];
  redirectionNeeded: boolean;
}

// Nutrition-related keywords and patterns
const NUTRITION_KEYWORDS = [
  // Core nutrition
  'nutrition', 'macro', 'macros', 'micro', 'micronutrient', 'calorie', 'calories', 'protein', 'carb', 'carbs', 'carbohydrate', 'fat', 'fiber', 'sugar', 'sodium', 'cholesterol',
  
  // Food and meals
  'food', 'meal', 'eat', 'eating', 'ate', 'breakfast', 'lunch', 'dinner', 'snack', 'recipe', 'ingredient', 'cook', 'cooking', 'bake', 'baking', 'prep', 'portion',
  
  // Meal planning
  'plan', 'planning', 'meal plan', 'grocery', 'shopping', 'pantry', 'kitchen', 'menu', 'weekly meals',
  
  // Diet and health conditions
  'diet', 'dietary', 'pcos', 'hashimoto', 'hashimotos', 'gluten', 'lactose', 'intolerance', 'allergy', 'allergic', 'celiac', 'keto', 'paleo', 'vegan', 'vegetarian',
  
  // Nutritional aspects
  'vitamin', 'mineral', 'supplement', 'hydration', 'water', 'intake', 'deficiency', 'balanced', 'healthy eating', 'metabolism',
  
  // Food preparation
  'restaurant', 'dining', 'takeout', 'delivery', 'fresh', 'organic', 'processed', 'whole food'
];

// Topics that should trigger redirection (non-nutrition)
const NON_NUTRITION_PATTERNS = [
  // Fitness and exercise
  /\b(workout|exercise|gym|fitness|training|cardio|weights|running|jogging|yoga|pilates|sports|athletic)\b/i,
  
  // Medical (beyond diet-related conditions)
  /\b(doctor|medicine|medication|surgery|hospital|treatment|therapy|diagnosis|symptoms|disease|illness)\b/i,
  
  // Technology
  /\b(computer|software|app|technology|programming|coding|internet|website|phone|device)\b/i,
  
  // Travel and lifestyle
  /\b(travel|vacation|work|job|career|relationship|dating|family|school|education|hobby)\b/i,
  
  // Entertainment
  /\b(movie|music|tv|show|game|entertainment|celebrity|news|politics|weather)\b/i,
  
  // General conversation
  /\b(how are you|what's up|tell me about|what do you think|opinion|advice|help with)\b/i,
  
  // Shopping (non-food)
  /\b(clothes|clothing|shoes|electronics|car|house|furniture)\b/i
];

export const analyzeMessageScope = (message: string): ScopeAnalysis => {
  const lowerMessage = message.toLowerCase();
  
  // Check for nutrition-related keywords
  const nutritionMatches = NUTRITION_KEYWORDS.filter(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  // Check for non-nutrition patterns
  const nonNutritionMatches = NON_NUTRITION_PATTERNS.filter(pattern => 
    pattern.test(lowerMessage)
  );
  
  // Food-specific context analysis (more sophisticated)
  const hasFoodContext = /\b(had|have|having|ate|eating|drink|drinking|taste|tasty|delicious|hungry|full)\b/i.test(lowerMessage);
  const hasMealTiming = /\b(morning|afternoon|evening|today|yesterday|tonight|earlier|later|before|after)\b/i.test(lowerMessage);
  
  // Calculate confidence scores
  const nutritionScore = nutritionMatches.length + (hasFoodContext ? 2 : 0) + (hasMealTiming ? 1 : 0);
  const nonNutritionScore = nonNutritionMatches.length;
  
  const isNutritionRelated = nutritionScore > 0 && nonNutritionScore === 0;
  const confidence = Math.min(nutritionScore / (nutritionScore + nonNutritionScore + 1), 0.95);
  
  // Only redirect if confidence is ABOVE 80% that it's non-nutrition
  const redirectionNeeded = !isNutritionRelated && confidence > 0.8;
  
  return {
    isNutritionRelated,
    confidence,
    detectedTopics: nonNutritionMatches.map(pattern => pattern.source),
    redirectionNeeded
  };
};

export const generateRedirectionResponse = (analysis: ScopeAnalysis): string => {
  const responses = [
    "I'm your dedicated nutrition coach! 🥗 I'm here specifically to help with your food, meals, and nutrition goals. What can I help you with regarding your eating today?",
    
    "Hey there! I focus exclusively on nutrition and meal planning 🍎 Let's talk about your food journey - what's on your plate today?",
    
    "I'm all about that nutrition life! 💪 I'm designed to help with meals, macros, and healthy eating. What would you like to know about your food choices?",
    
    "My expertise is in nutrition and meal planning! 🥑 I'd love to help you with anything food-related - what are you curious about regarding your eating habits?",
    
    "I'm your nutrition-focused buddy! 🌟 Let's keep our chat centered on food, meals, and your health goals. What nutritional topic can I help you with?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};