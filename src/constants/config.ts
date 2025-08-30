// Environment configuration
export const APP_ENV = process.env.APP_ENV || 'development';

// OpenAI Configuration
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
export const OPENAI_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini';

// Supabase Configuration
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Google Services
export const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// Nutritional Data APIs
export const USDA_API_KEY = process.env.USDA_API_KEY || '';
export const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID || '';
export const NUTRITIONIX_API_KEY = process.env.NUTRITIONIX_API_KEY || '';

// Food Recognition APIs
export const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY || '';

// App Configuration
export const API_BASE_URL = process.env.API_BASE_URL || 'https://api.yourdomain.com';
export const SENTRY_DSN = process.env.SENTRY_DSN || '';

// Stripe (for payments)
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';

// App Constants
export const APP_CONFIG = {
  MAX_MESSAGE_HISTORY: 10,
  AI_RESPONSE_TIMEOUT: 30000, // 30 seconds
  CACHE_DURATION: 3600000, // 1 hour
  FREE_TIER_DAILY_LIMIT: 10,
  PREMIUM_TIER_DAILY_LIMIT: 1000,
  DEFAULT_NUTRITION_GOALS: {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  },
};

// Validation helpers
export const isConfigurationValid = () => {
  const required = [
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  ];
  
  const optional = [
    OPENAI_API_KEY,
    GOOGLE_PLACES_API_KEY,
  ];

  const missingRequired = required.filter(config => !config || config.length === 0);
  const missingOptional = optional.filter(config => !config || config.length === 0);

  return {
    isValid: missingRequired.length === 0,
    missingRequired,
    missingOptional,
  };
};