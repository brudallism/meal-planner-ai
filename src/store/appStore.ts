import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, MealLog, PantryItem, supabaseService } from '../services/supabase';
import { NutritionData } from '../types/nutrition';

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
  allMeals: MealLog[];
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
  loadMealsFromSupabase: (userId: string) => Promise<void>;
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

// Check if a date string is today
const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Filter meals for today only
const getTodaysMeals = (allMeals: MealLog[]): MealLog[] => {
  return allMeals.filter(meal => isToday(meal.logged_at || meal.created_at));
};

// Calculate daily nutrition totals
const calculateDailyTotals = (meals: MealLog[]): NutritionData => {
  const todaysMeals = getTodaysMeals(meals);
  return todaysMeals.reduce(
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
  allMeals: [],
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
          const updatedAllMeals = [...state.allMeals, meal];
          const todaysMeals = getTodaysMeals(updatedAllMeals);
          return {
            allMeals: updatedAllMeals,
            todaysMeals: todaysMeals,
            dailyTotals: calculateDailyTotals(updatedAllMeals),
          };
        }),

      loadMealsFromSupabase: async (userId: string) => {
        try {
          console.log('🔄 Loading meals from Supabase for user:', userId);
          const meals = await supabaseService.getMealLogs(userId);
          console.log('📊 Loaded', meals.length, 'meals from database');
          
          set((state) => {
            const todaysMeals = getTodaysMeals(meals);
            return {
              allMeals: meals,
              todaysMeals: todaysMeals,
              dailyTotals: calculateDailyTotals(meals),
            };
          });
        } catch (error) {
          console.error('❌ Error loading meals from Supabase:', error);
        }
      },

      updateDailyTotals: () =>
        set((state) => ({
          todaysMeals: getTodaysMeals(state.allMeals),
          dailyTotals: calculateDailyTotals(state.allMeals),
        })),

      setNutritionGoals: (goals) => set({ nutritionGoals: goals }),

      setTodaysMeals: (meals) =>
        set(() => ({
          allMeals: meals, // Assuming these are all meals, not just today's
          todaysMeals: getTodaysMeals(meals),
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
        
        // Persist meal data for local tracking
        allMeals: state.allMeals,
        
        // Don't persist temporary/computed data
        // todaysMeals, dailyTotals will be computed from allMeals
        // messages will be cleared on restart
      }),
      
      // Recompute derived values when loading from storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          const todaysMeals = getTodaysMeals(state.allMeals || []);
          state.todaysMeals = todaysMeals;
          state.dailyTotals = calculateDailyTotals(state.allMeals || []);
          console.log('🔄 Store rehydrated with', state.allMeals?.length || 0, 'total meals,', todaysMeals.length, 'today');
        }
      },
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