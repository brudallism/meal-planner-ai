// Navigation types
export type RootStackParamList = {
  Main: undefined;
  ChatModal: undefined;
  Onboarding: undefined;
  Auth: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Chat: undefined;
  Pantry: undefined;
  Settings: undefined;
};

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Nutrition types
export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MicroNutrients {
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  vitaminC?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  nutrition: NutritionInfo;
  barcode?: string;
  category: FoodCategory;
}

export interface NutritionInfo extends MacroTargets, MicroNutrients {
  servingSize: string;
  servings?: number;
}

export type FoodCategory = 
  | 'protein'
  | 'carbs'
  | 'fats'
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'grains'
  | 'beverages'
  | 'snacks'
  | 'condiments';

// User types
export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  dislikedFoods: string[];
  preferredCuisines: string[];
  mealTimings: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

export interface HealthMetrics {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  activityLevel: ActivityLevel;
  goals: HealthGoal[];
}

export type ActivityLevel = 
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

export type HealthGoal = 
  | 'weight_loss'
  | 'weight_gain'
  | 'muscle_gain'
  | 'maintenance'
  | 'athletic_performance'
  | 'general_health';

// Chat types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    action?: string;
    data?: any;
    confidence?: number;
  };
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  userPreferences: UserPreferences;
  healthMetrics: HealthMetrics;
  recentMeals: MealLogEntry[];
  currentLocation?: Location;
}

export interface AIResponse {
  message: string;
  action: AIActionType;
  data?: any;
  confidence?: number;
  suggestedActions?: string[];
}

export type AIActionType = 
  | 'log_meal'
  | 'plan_meals'
  | 'find_restaurants'
  | 'update_pantry'
  | 'general_advice'
  | 'nutrition_analysis'
  | 'recipe_suggestion';

// Location types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location: Location;
  cuisine: string[];
  rating?: number;
  priceLevel?: number;
  healthyOptions?: FoodItem[];
  distance?: number;
}

// Meal planning types
export interface MealLogEntry {
  id: string;
  userId: string;
  name: string;
  type: MealType;
  nutrition: NutritionInfo;
  timestamp: Date;
  confidence: number;
  source: 'manual' | 'ai_suggested' | 'photo_recognition' | 'voice_input';
  photos?: string[];
  notes?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface DailyMealPlan {
  date: string;
  meals: {
    breakfast?: MealLogEntry[];
    lunch?: MealLogEntry[];
    dinner?: MealLogEntry[];
    snacks?: MealLogEntry[];
  };
  totalNutrition: NutritionInfo;
  adherenceScore: number;
}

export interface WeeklyMealPlan {
  weekStartDate: string;
  days: DailyMealPlan[];
  shoppingList: ShoppingListItem[];
  estimatedCost?: number;
}

// Shopping and Pantry types
export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  purchaseDate?: Date;
  expiryDate?: Date;
  freshness: FreshnessStatus;
  category: FoodCategory;
  estimatedCost?: number;
}

export type FreshnessStatus = 'fresh' | 'good' | 'warning' | 'expired';

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: FoodCategory;
  priority: 'low' | 'medium' | 'high';
  estimatedCost?: number;
  purchased: boolean;
  notes?: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Form types
export interface OnboardingData {
  personalInfo: {
    name: string;
    email: string;
    dateOfBirth: Date;
  };
  healthMetrics: HealthMetrics;
  preferences: UserPreferences;
  nutritionGoals: MacroTargets;
}

// Analytics types
export interface UserAnalytics {
  dailyAverages: NutritionInfo;
  weeklyTrends: any[];
  adherenceRate: number;
  favoriteFood: string[];
  improvementAreas: string[];
}

// Subscription types
export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    dailyAIInteractions: number;
    photoRecognitions: number;
    mealPlans: number;
  };
}