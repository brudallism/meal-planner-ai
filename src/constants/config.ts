// Environment configuration
export const APP_ENV = process.env.APP_ENV || 'development';

// OpenAI Configuration
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
export const OPENAI_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini';

// Supabase Configuration
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

// Hybrid API Configuration
export const SPOONACULAR_API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY || '';
export const USDA_API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY || ''; // Optional but recommended
export const OPEN_FOOD_FACTS_API_URL = process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_API_URL || 'https://world.openfoodfacts.org/api/v2/';

// API Rate Limiting Configuration
export const API_RATE_LIMITS = {
  SPOONACULAR: {
    REQUESTS_PER_SECOND: 5,
    REQUESTS_PER_DAY: 500
  },
  USDA: {
    REQUESTS_PER_HOUR: 1000
  },
  OPEN_FOOD_FACTS: {
    REQUESTS_PER_SECOND: 10 // Self-imposed fair use limit
  }
};

// App Configuration
export const API_BASE_URL = process.env.API_BASE_URL || 'https://api.yourdomain.com';


