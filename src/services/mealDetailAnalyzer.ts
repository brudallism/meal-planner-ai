export interface MealDetailGap {
  foodItem: string;
  missingDetails: string[];
  suggestedQuestions: string[];
}

export interface DetailAnalysis {
  hasAllDetails: boolean;
  gaps: MealDetailGap[];
  confidence: number;
}

// Common foods that need specific quantity questions
const QUANTITY_PATTERNS = {
  eggs: {
    keywords: ['egg', 'eggs', 'scrambled', 'fried', 'boiled', 'poached'],
    questions: ['How many eggs?', 'What size eggs (large, medium, small)?']
  },
  bread: {
    keywords: ['toast', 'bread', 'slice', 'slices', 'bagel', 'muffin'],
    questions: ['How many slices?', 'What type of bread?', 'What size (regular, thick cut)?']
  },
  meat: {
    keywords: ['chicken', 'beef', 'pork', 'turkey', 'salmon', 'fish', 'steak'],
    questions: ['How many ounces/grams?', 'What cut/type?', 'How was it prepared?']
  },
  dairy: {
    keywords: ['milk', 'yogurt', 'cheese', 'cream'],
    questions: ['How much (cups/oz)?', 'What type (whole, skim, etc.)?']
  },
  vegetables: {
    keywords: ['vegetables', 'veggies', 'salad', 'broccoli', 'carrots', 'spinach'],
    questions: ['How much (cups/servings)?', 'Raw or cooked?', 'What vegetables specifically?']
  },
  grains: {
    keywords: ['rice', 'pasta', 'quinoa', 'oats', 'cereal'],
    questions: ['How much (cups cooked)?', 'What type?']
  },
  nuts: {
    keywords: ['nuts', 'almonds', 'peanuts', 'walnuts', 'seeds'],
    questions: ['How much (oz/handful/tablespoons)?', 'What type of nuts?']
  },
  fruits: {
    keywords: ['fruit', 'apple', 'banana', 'orange', 'berries', 'grapes'],
    questions: ['How many pieces?', 'What size?', 'What type of fruit?']
  },
  beverages: {
    keywords: ['coffee', 'juice', 'soda', 'smoothie', 'water', 'tea'],
    questions: ['How much (oz/cups)?', 'What type?', 'Any additions (milk, sugar)?']
  },
  snacks: {
    keywords: ['chips', 'crackers', 'cookies', 'chocolate', 'candy'],
    questions: ['How much (oz/pieces/servings)?', 'What brand/type?']
  }
};

// Words that indicate specific quantities are already provided
const QUANTITY_INDICATORS = [
  /\b\d+\s*(oz|ounces|grams?|g|lbs?|pounds?|cups?|tbsp|tablespoons?|tsp|teaspoons?)\b/i,
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s*(pieces?|slices?|eggs?|cups?)\b/i,
  /\b(small|medium|large|extra\s*large)\s*(serving|portion|size)\b/i,
  /\b(handful|pinch|dash|splash)\b/i,
  /\b\d+\/\d+\s*(cup|oz)\b/i, // fractions like 1/2 cup
];

export const analyzeMealDetails = (foodItems: string[], userMessage: string): DetailAnalysis => {
  const gaps: MealDetailGap[] = [];
  const lowerMessage = userMessage.toLowerCase();
  
  // Check if message already contains quantity indicators
  const hasQuantityIndicators = QUANTITY_INDICATORS.some(pattern => pattern.test(lowerMessage));
  
  for (const item of foodItems) {
    const lowerItem = item.toLowerCase();
    const missingDetails: string[] = [];
    const suggestedQuestions: string[] = [];
    
    // Check each quantity pattern category
    for (const [category, config] of Object.entries(QUANTITY_PATTERNS)) {
      const matchesCategory = config.keywords.some(keyword => 
        lowerItem.includes(keyword) || lowerMessage.includes(keyword)
      );
      
      if (matchesCategory) {
        // If no quantity indicators found, this item needs details
        if (!hasQuantityIndicators) {
          missingDetails.push('quantity');
          suggestedQuestions.push(...config.questions);
        }
        
        // Check for specific detail gaps based on category
        switch (category) {
          case 'meat':
            if (!lowerMessage.includes('oz') && !lowerMessage.includes('gram') && !lowerMessage.includes('pound')) {
              missingDetails.push('weight');
            }
            break;
          case 'bread':
            if (!lowerMessage.includes('slice') && !lowerMessage.includes('piece')) {
              missingDetails.push('count');
            }
            break;
          case 'eggs':
            if (!lowerMessage.match(/\b(one|two|three|four|five|six|\d+)\s*eggs?\b/)) {
              missingDetails.push('count');
            }
            break;
        }
        break; // Only match one category per item
      }
    }
    
    // If we found missing details, add to gaps
    if (missingDetails.length > 0) {
      gaps.push({
        foodItem: item,
        missingDetails,
        suggestedQuestions: [...new Set(suggestedQuestions)] // Remove duplicates
      });
    }
  }
  
  const confidence = gaps.length === 0 ? 0.9 : Math.max(0.1, 0.8 - (gaps.length * 0.2));
  
  return {
    hasAllDetails: gaps.length === 0,
    gaps,
    confidence
  };
};

export const generateDetailQuestions = (analysis: DetailAnalysis, mealType?: string): string => {
  if (analysis.hasAllDetails) {
    return '';
  }
  
  const questions: string[] = [];
  const timeQuestion = "What time did you eat this?";
  
  // Group questions by food item
  for (const gap of analysis.gaps) {
    if (gap.suggestedQuestions.length > 0) {
      // Take the most relevant questions (max 2 per item to avoid overwhelming)
      const relevantQuestions = gap.suggestedQuestions.slice(0, 2);
      questions.push(...relevantQuestions);
    }
  }
  
  // Remove duplicates and limit total questions
  const uniqueQuestions = [...new Set(questions)].slice(0, 4);
  
  const questionText = uniqueQuestions.length > 0 
    ? `${uniqueQuestions.join(' ')} ${timeQuestion}`
    : timeQuestion;
  
  return `Let me get some more details for accurate tracking: ${questionText} Then I can add this to your nutrition tracker! 📊`;
};

// Check if a user response provides the missing details
export const hasProvidedMissingDetails = (userResponse: string, previousGaps: MealDetailGap[]): boolean => {
  const lowerResponse = userResponse.toLowerCase();
  
  // Look for quantity indicators in the response
  const providedQuantities = QUANTITY_INDICATORS.some(pattern => pattern.test(lowerResponse));
  
  // Look for specific numbers or quantities
  const hasNumbers = /\b\d+/.test(userResponse);
  const hasQuantityWords = /\b(one|two|three|four|five|six|small|medium|large|cup|oz|slice|piece)\b/i.test(userResponse);
  
  return providedQuantities || hasNumbers || hasQuantityWords;
};