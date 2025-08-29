import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, MealLog, PantryItem } from '../services/supabase';
import { NutritionData } from '../services/openai';

// Store interfaces
interface User {
  id: string;
  email: string;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface ChatState {
  messages: any[];
  isTyping: boolean;
  currentConversationId: string | null;
}

interface NutritionState {
  todaysMeals: MealLog[];
  dailyTotals: NutritionData;
  weeklyProgress: any[];
  nutritionGoals: NutritionData;
}

interface PantryState {
  items: PantryItem[];
  weeklyMealPlan: any[];
  shoppingList: any[];
}

interface AppState extends User, ChatState, NutritionState, PantryState {
  // User actions
  setUser: (user: Partial<User>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  logout: () => void;

  // Chat actions
  addMessage: (message: any) => void;
  setTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
  startNewConversation: () => void;

  // Nutrition actions
  addMeal: (meal: MealLog) => void;
  updateDailyTotals: () => void;
  setNutritionGoals: (goals: NutritionData) => void;
  setTodaysMeals: (meals: MealLog[]) => void;

  // Pantry actions
  setPantryItems: (items: PantryItem[]) => void;
  addPantryItem: (item: PantryItem) => void;
  updatePantryItem: (itemId: string, updates: Partial<PantryItem>) => void;
  removePantryItem: (itemId: string) => void;
  setWeeklyMealPlan: (plan: any[]) => void;
  setShoppingList: (list: any[]) => void;

  // Utility actions
  resetStore: () => void;
}

// Calculate daily nutrition totals
const calculateDailyTotals = (meals: MealLog[]): NutritionData => {
  return meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + (meal.calories || 0),
      protein: totals.protein + (meal.protein || 0),
      carbs: totals.carbs + (meal.carbs || 0),
      fat: totals.fat + (meal.fat || 0),
      fiber: (totals.fiber || 0) + (meal.fiber || 0),
      sugar: (totals.sugar || 0) + (meal.sugar || 0),
      sodium: (totals.sodium || 0) + (meal.sodium || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  );
};

// Initial state
const initialState = {
  // User state
  id: '',
  email: '',
  profile: null,
  isAuthenticated: false,
  isLoading: false,

  // Chat state
  messages: [],
  isTyping: false,
  currentConversationId: null,

  // Nutrition state
  todaysMeals: [],
  dailyTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  weeklyProgress: [],
  nutritionGoals: { calories: 2000, protein: 150, carbs: 250, fat: 65 },

  // Pantry state
  items: [],
  weeklyMealPlan: [],
  shoppingList: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // User actions
      setUser: (user) =>
        set((state) => ({
          ...state,
          ...user,
        })),

      updateProfile: (profile) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...profile } : profile as UserProfile,
        })),

      logout: () =>
        set(() => ({
          ...initialState,
          messages: [], // Clear messages on logout
        })),

      // Chat actions
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      setTyping: (isTyping) => set({ isTyping }),

      clearMessages: () => set({ messages: [] }),

      startNewConversation: () =>
        set({
          currentConversationId: Date.now().toString(),
          messages: [],
        }),

      // Nutrition actions
      addMeal: (meal) =>
        set((state) => {
          const updatedMeals = [...state.todaysMeals, meal];
          return {
            todaysMeals: updatedMeals,
            dailyTotals: calculateDailyTotals(updatedMeals),
          };
        }),

      updateDailyTotals: () =>
        set((state) => ({
          dailyTotals: calculateDailyTotals(state.todaysMeals),
        })),

      setNutritionGoals: (goals) => set({ nutritionGoals: goals }),

      setTodaysMeals: (meals) =>
        set(() => ({
          todaysMeals: meals,
          dailyTotals: calculateDailyTotals(meals),
        })),

      // Pantry actions
      setPantryItems: (items) => set({ items }),

      addPantryItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),

      updatePantryItem: (itemId, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        })),

      removePantryItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),

      setWeeklyMealPlan: (plan) => set({ weeklyMealPlan: plan }),

      setShoppingList: (list) => set({ shoppingList: list }),

      // Utility actions
      resetStore: () => set(initialState),
    }),
    {
      name: 'ai-nutrition-assistant-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain parts of the state
      partialize: (state) => ({
        // User data
        id: state.id,
        email: state.email,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        
        // Nutrition goals and preferences
        nutritionGoals: state.nutritionGoals,
        
        // Don't persist sensitive or temporary data
        // messages, todaysMeals, pantry items will be fetched fresh
      }),
    }
  )
);

// Selectors for computed values
export const useNutritionProgress = () => {
  const { dailyTotals, nutritionGoals } = useAppStore();
  
  return {
    calories: {
      current: dailyTotals.calories,
      target: nutritionGoals.calories,
      percentage: (dailyTotals.calories / nutritionGoals.calories) * 100,
    },
    protein: {
      current: dailyTotals.protein,
      target: nutritionGoals.protein,
      percentage: (dailyTotals.protein / nutritionGoals.protein) * 100,
    },
    carbs: {
      current: dailyTotals.carbs,
      target: nutritionGoals.carbs,
      percentage: (dailyTotals.carbs / nutritionGoals.carbs) * 100,
    },
    fat: {
      current: dailyTotals.fat,
      target: nutritionGoals.fat,
      percentage: (dailyTotals.fat / nutritionGoals.fat) * 100,
    },
  };
};

export const usePantryStats = () => {
  const { items } = useAppStore();
  
  return {
    totalItems: items.length,
    expiringSoon: items.filter(item => item.freshness_status === 'warning').length,
    expired: items.filter(item => item.freshness_status === 'expired').length,
    fresh: items.filter(item => item.freshness_status === 'fresh').length,
  };
};