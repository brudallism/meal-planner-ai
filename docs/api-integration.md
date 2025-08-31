# API Integration Plan
*Meal Master AI - Hybrid API Architecture*

## Overview

Meal Master AI implements a hybrid 3-API approach for comprehensive nutrition intelligence, balancing cost efficiency with data accuracy during the bootstrap phase.

## API Services Integration

### 1. Open Food Facts API (Free)
**Purpose**: Core nutrition data, barcode scanning, food product database

**Endpoints Used**:
```
- Product Search: GET /api/v2/search?categories_tags=en:food&fields=product_name,nutriments,ingredients_text
- Barcode Lookup: GET /api/v2/product/{barcode}.json
- Ingredient Analysis: GET /cgi/ingredients.pl
```

**Authentication**: None required (public API)

**Rate Limiting**: 
- No official limits (respect fair use)
- Recommended: Max 10 requests/second
- Implement exponential backoff for 429 responses

**Data Transformation**:
```javascript
const transformOpenFoodFacts = (product) => ({
  name: product.product_name,
  calories: product.nutriments['energy-kcal_100g'],
  protein: product.nutriments.proteins_100g,
  carbs: product.nutriments.carbohydrates_100g,
  fat: product.nutriments.fat_100g,
  fiber: product.nutriments.fiber_100g,
  sugar: product.nutriments.sugars_100g,
  sodium: product.nutriments.sodium_100g,
  ingredients: product.ingredients_text,
  confidence: 'barcode_verified'
});
```

### 2. Spoonacular API ($10/month Bootstrap Plan)
**Purpose**: Meal planning, recipes, intelligent food ontology

**Endpoints Used**:
```
- Recipe Search: GET /recipes/complexSearch
- Recipe Information: GET /recipes/{id}/information
- Meal Planning: POST /mealplanner/{username}/generate
- Ingredient Search: GET /food/ingredients/search
- Recipe Nutrition: GET /recipes/{id}/nutritionWidget.json
- Similar Recipes: GET /recipes/{id}/similar
- Recipe Instructions: GET /recipes/{id}/analyzedInstructions
```

**Authentication**: 
```
Headers: {
  'X-RapidAPI-Key': process.env.SPOONACULAR_API_KEY,
  'Content-Type': 'application/json'
}
```

**Rate Limiting**:
- Bootstrap Plan: 500 requests/day, 5 requests/second
- Monitor usage with request tracking
- Implement request queuing for burst protection

**Data Transformation**:
```javascript
const transformSpoonacularRecipe = (recipe) => ({
  id: recipe.id,
  title: recipe.title,
  image: recipe.image,
  cookingTime: recipe.readyInMinutes,
  servings: recipe.servings,
  nutrition: {
    calories: recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount,
    protein: recipe.nutrition.nutrients.find(n => n.name === 'Protein')?.amount,
    carbs: recipe.nutrition.nutrients.find(n => n.name === 'Carbohydrates')?.amount,
    fat: recipe.nutrition.nutrients.find(n => n.name === 'Fat')?.amount
  },
  instructions: recipe.analyzedInstructions,
  ingredients: recipe.extendedIngredients,
  diets: recipe.diets,
  confidence: 'recipe_verified'
});
```

### 3. USDA FoodData Central API (Free)
**Purpose**: Government nutritional data for accuracy validation

**Endpoints Used**:
```
- Food Search: GET /v1/foods/search
- Food Details: GET /v1/food/{fdcId}
- Food List: GET /v1/foods/list
- Nutrients: GET /v1/nutrients
```

**Authentication**:
```
Headers: {
  'X-Api-Key': process.env.USDA_API_KEY // Optional but recommended
}
```

**Rate Limiting**:
- 1000 requests/hour (3600 seconds)
- Implement request throttling: max 1 request/4 seconds
- Cache USDA data for 30 days to minimize requests

**Data Transformation**:
```javascript
const transformUSDAFood = (food) => ({
  fdcId: food.fdcId,
  description: food.description,
  nutrients: food.foodNutrients.reduce((acc, nutrient) => {
    const name = nutrient.nutrient.name.toLowerCase();
    if (name.includes('energy')) acc.calories = nutrient.amount;
    if (name.includes('protein')) acc.protein = nutrient.amount;
    if (name.includes('carbohydrate')) acc.carbs = nutrient.amount;
    if (name.includes('total lipid')) acc.fat = nutrient.amount;
    return acc;
  }, {}),
  dataType: food.dataType,
  confidence: 'government_verified'
});
```

## Error Handling & Fallback Strategies

### API Failure Flow Chart

```
User Request → Primary API → Success? → Response
     ↓              ↓         ↓
   Cache?     → Fallback API → Success? → Response  
     ↓              ↓         ↓
   Default    → Cache Check → Found? → Cached Response
     ↓                        ↓
User Prompt ← Graceful Error ← Not Found
```

### Specific Fallback Strategies

**1. Barcode Scanning Flow**:
```javascript
async function handleBarcodeScanning(barcode) {
  try {
    // Primary: Open Food Facts
    const product = await openFoodFacts.getProduct(barcode);
    if (product) return transformOpenFoodFacts(product);
  } catch (error) {
    logAPIError('OpenFoodFacts', error);
  }
  
  // Fallback: Manual input prompt
  return {
    type: 'manual_input_required',
    message: "I couldn't find that barcode. Can you tell me what food you're scanning?",
    prompt: "Please describe the food item with brand and type (e.g., 'Chobani Greek Yogurt, vanilla')"
  };
}
```

**2. Recipe Search Flow**:
```javascript
async function handleRecipeSearch(query, dietary_restrictions) {
  try {
    // Primary: Spoonacular
    const recipes = await spoonacular.searchRecipes(query, dietary_restrictions);
    if (recipes.length > 0) {
      // Cross-reference with USDA for accuracy
      const enrichedRecipes = await enrichWithUSDA(recipes);
      return enrichedRecipes;
    }
  } catch (error) {
    logAPIError('Spoonacular', error);
  }
  
  try {
    // Fallback: Cached recipes + USDA nutrition
    const cachedRecipes = await getCachedRecipes(query);
    const nutritionData = await usda.searchFoods(query);
    return combineRecipeAndNutrition(cachedRecipes, nutritionData);
  } catch (error) {
    logAPIError('Cache+USDA', error);
  }
  
  // Final fallback: Generic suggestions
  return generateGenericSuggestions(query, dietary_restrictions);
}
```

**3. Nutrition Accuracy Flow**:
```javascript
async function validateNutrition(foodItem, spoonacularData) {
  try {
    // Cross-reference with USDA for accuracy
    const usdaData = await usda.searchFoods(foodItem);
    const usdaMatch = findBestMatch(foodItem, usdaData);
    
    if (usdaMatch && isNutritionSimilar(spoonacularData, usdaMatch)) {
      return {
        ...spoonacularData,
        nutrition: usdaMatch.nutrition,
        confidence: 'cross_verified',
        source: 'usda_verified'
      };
    }
    
    return {
      ...spoonacularData,
      confidence: 'single_source',
      source: 'spoonacular_only'
    };
  } catch (error) {
    return spoonacularData; // Use original data if validation fails
  }
}
```

## Caching & Performance Optimization

### Cache Strategy by Data Type

**Redis Cache Implementation**:
```javascript
const cacheConfig = {
  // High-frequency, static data
  usda_foods: { ttl: 2592000 }, // 30 days
  open_food_facts_products: { ttl: 604800 }, // 7 days
  
  // Medium-frequency, semi-static data  
  spoonacular_recipes: { ttl: 604800 }, // 7 days
  restaurant_menus: { ttl: 86400 }, // 24 hours
  
  // Dynamic, user-specific data
  user_preferences: { ttl: 0 }, // No expiry (update on change)
  meal_plans: { ttl: 86400 }, // 24 hours
  conversation_context: { ttl: 3600 } // 1 hour
};
```

**Parallel API Calls**:
```javascript
async function getComprehensiveMealData(mealQuery) {
  const [
    spoonacularResults,
    usdaNutrition,
    userPreferences
  ] = await Promise.allSettled([
    spoonacular.searchRecipes(mealQuery),
    usda.searchFoods(mealQuery),
    supabase.getUserPreferences(userId)
  ]);
  
  return synthesizeResults(spoonacularResults, usdaNutrition, userPreferences);
}
```

## Monitoring & Analytics

### API Usage Tracking

```javascript
const apiMetrics = {
  spoonacular: {
    requestsToday: 0,
    requestsPerSecond: 0,
    failureRate: 0,
    averageResponseTime: 0
  },
  openFoodFacts: {
    requestsToday: 0,
    failureRate: 0,
    averageResponseTime: 0
  },
  usda: {
    requestsThisHour: 0,
    failureRate: 0,
    averageResponseTime: 0
  }
};

// Real-time monitoring dashboard metrics
const trackAPICall = (service, endpoint, responseTime, success) => {
  // Update metrics
  // Alert if approaching rate limits
  // Log failures for analysis
};
```

### Cost Monitoring

```javascript
const costTracking = {
  spoonacular: {
    monthlyBudget: 10, // $10/month
    currentSpend: 0,
    requestCost: 0.02, // Estimate per request
    projectedMonthlySpend: 0
  }
};
```

## Data Synchronization

### User Data Pipeline

```
Supabase (Source of Truth)
    ↓
API Enrichment Layer
    ↓
Response Synthesis
    ↓
Client Cache Update
    ↓
UI Real-time Update
```

### Conversation State Management

```javascript
const conversationState = {
  userId: string,
  sessionId: string,
  context: {
    currentMealPlan: object,
    recentQueries: array,
    preferences: object,
    nutritionGoals: object
  },
  apiHistory: {
    lastSpoonacularCall: timestamp,
    lastUSDACall: timestamp,
    lastOpenFoodFactsCall: timestamp
  }
};
```

## Implementation Checklist

### Phase 1: Core Integration
- [ ] Set up API authentication for all 3 services
- [ ] Implement basic API calling functions with error handling
- [ ] Create data transformation utilities
- [ ] Set up Redis caching layer
- [ ] Implement rate limiting and request queuing

### Phase 2: Fallback System
- [ ] Create fallback decision tree logic
- [ ] Implement cache-first strategies for non-critical requests  
- [ ] Add graceful error messages for users
- [ ] Test failure scenarios and recovery paths

### Phase 3: Performance Optimization
- [ ] Implement parallel API calls where possible
- [ ] Add request deduplication for similar queries
- [ ] Optimize cache hit ratios
- [ ] Monitor and tune rate limiting strategies

### Phase 4: Monitoring & Analytics
- [ ] Set up API usage dashboards
- [ ] Implement cost tracking and alerts
- [ ] Add performance metrics collection
- [ ] Create failure analysis and alerting

## Security Considerations

### API Key Management
```javascript
// Environment variables (never commit to repo)
SPOONACULAR_API_KEY=your_key_here
USDA_API_KEY=your_key_here  
OPEN_FOOD_FACTS_API_URL=https://world.openfoodfacts.org/api/v2/

// Runtime key rotation support
const apiKeys = {
  spoonacular: {
    primary: process.env.SPOONACULAR_API_KEY,
    backup: process.env.SPOONACULAR_API_KEY_BACKUP
  }
};
```

### Request Sanitization
- Sanitize all user inputs before API calls
- Validate response data structure before processing
- Implement request signing for sensitive endpoints
- Rate limit per user to prevent abuse

## Success Metrics

### API Performance Targets
- **Response Time**: 95% of requests under 2 seconds
- **Success Rate**: 99.5% uptime across all APIs combined
- **Cache Hit Rate**: 60-80% for common queries
- **Cost Efficiency**: Stay under $15/month during bootstrap phase

### User Experience Metrics  
- **Query Resolution**: 95% of user food queries successfully answered
- **Accuracy**: 90%+ nutritional accuracy (cross-verified with USDA)
- **Conversation Flow**: Users complete multi-step conversations without errors
- **Fallback Success**: When APIs fail, 95% of users still get helpful responses