import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants/config';

// Type definitions for Supabase tables
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  nutrition_goals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  dietary_restrictions?: string[];
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  created_at: string;
  updated_at: string;
}

export interface MealLog {
  id: string;
  user_id: string;
  meal_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  confidence: number;
  logged_at: string;
  created_at: string;
}

export interface PantryItem {
  id: string;
  user_id: string;
  item_name: string;
  quantity: string;
  unit: string;
  expiry_date?: string;
  freshness_status: 'fresh' | 'warning' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface WeeklyMealPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  meals: {
    monday: any;
    tuesday: any;
    wednesday: any;
    thursday: any;
    friday: any;
    saturday: any;
    sunday: any;
  };
  created_at: string;
  updated_at: string;
}

class SupabaseService {
  private supabase;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    });
  }

  // Authentication methods
  async signUp(email: string, password: string, userData?: Partial<UserProfile>) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getCurrentSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  // User profile methods
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Meal logging methods
  async logMeal(mealData: Omit<MealLog, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('meal_logs')
      .insert([mealData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMealLogs(userId: string, startDate?: string, endDate?: string): Promise<MealLog[]> {
    let query = this.supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });

    if (startDate) {
      query = query.gte('logged_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('logged_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching meal logs:', error);
      return [];
    }

    return data || [];
  }

  async getTodaysMeals(userId: string): Promise<MealLog[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getMealLogs(userId, today);
  }

  async updateMealLog(mealId: string, updates: Partial<MealLog>): Promise<MealLog> {
    const { data, error } = await this.supabase
      .from('meal_logs')
      .update(updates)
      .eq('id', mealId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMealLog(mealId: string): Promise<void> {
    const { error } = await this.supabase
      .from('meal_logs')
      .delete()
      .eq('id', mealId);

    if (error) throw error;
  }

  async getMealById(mealId: string): Promise<MealLog | null> {
    const { data, error } = await this.supabase
      .from('meal_logs')
      .select('*')
      .eq('id', mealId)
      .single();

    if (error) {
      console.error('Error fetching meal by ID:', error);
      return null;
    }

    return data;
  }

  // Pantry management methods
  async getPantryItems(userId: string): Promise<PantryItem[]> {
    const { data, error } = await this.supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pantry items:', error);
      return [];
    }

    return data || [];
  }

  async addPantryItem(itemData: Omit<PantryItem, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('pantry_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePantryItem(itemId: string, updates: Partial<PantryItem>) {
    const { data, error } = await this.supabase
      .from('pantry_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePantryItem(itemId: string) {
    const { error } = await this.supabase
      .from('pantry_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  }

  // Meal planning methods
  async saveMealPlan(planData: Omit<WeeklyMealPlan, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('weekly_meal_plans')
      .insert([planData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMealPlan(userId: string, weekStartDate: string): Promise<WeeklyMealPlan | null> {
    const { data, error } = await this.supabase
      .from('weekly_meal_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStartDate)
      .single();

    if (error) {
      console.error('Error fetching meal plan:', error);
      return null;
    }

    return data;
  }

  // Real-time subscriptions
  subscribeToMealLogs(userId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`meal_logs:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_logs',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToPantryItems(userId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`pantry_items:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pantry_items',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  // Health check method
  isConfigured(): boolean {
    return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
  }
}

export const supabaseService = new SupabaseService();