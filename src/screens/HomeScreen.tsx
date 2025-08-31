import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');

const CalorieProgressBar = ({ current, target }: { current: number; target: number }) => {
  const percentage = Math.min((current / target) * 100, 100);
  
  // Dynamic color based on progress
  const getColor = (percentage: number) => {
    if (percentage < 50) return COLORS.sage;      // Green for low
    if (percentage < 80) return COLORS.mustard;   // Yellow for medium
    if (percentage < 100) return COLORS.orange;   // Orange for high
    return COLORS.coral;                          // Red for over target
  };

  return (
    <View style={styles.calorieBarContainer}>
      <Text style={styles.calorieBarTitle}>Daily Calories</Text>
      <View style={styles.calorieBar}>
        <View 
          style={[
            styles.calorieBarFill,
            {
              width: `${percentage}%`,
              backgroundColor: getColor(percentage),
            }
          ]} 
        />
        <Text style={styles.calorieBarText}>
          {Math.round(current)} / {target}
        </Text>
      </View>
    </View>
  );
};

const MacroRing = ({ label, current, target, color }: any) => {
  const percentage = (current / target) * 100;
  
  return (
    <View style={styles.macroRing}>
      <View style={[styles.ringContainer, { borderColor: color }]}>
        <Text style={styles.macroValue}>{current}g</Text>
      </View>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroTarget}>/ {target}g</Text>
    </View>
  );
};


const HomeScreen = () => {
  const { dailyTotals, nutritionGoals, todaysMeals, loadMealsFromSupabase } = useAppStore();
  
  // Load meals from Supabase when app starts
  useEffect(() => {
    loadMealsFromSupabase('demo-user');
  }, [loadMealsFromSupabase]);
  
  const macroData = {
    protein: { current: dailyTotals.protein, target: nutritionGoals.protein, color: COLORS.teal },
    carbs: { current: dailyTotals.carbs, target: nutritionGoals.carbs, color: COLORS.orange },
    fat: { current: dailyTotals.fat, target: nutritionGoals.fat, color: COLORS.sage },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.subtitle}>Let's plan your nutrition today</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={32} color={COLORS.teal} />
          </TouchableOpacity>
        </View>

        {/* Nutrition Progress */}
        <View style={styles.macroContainer}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          
          {/* Calorie Progress Bar */}
          <CalorieProgressBar 
            current={dailyTotals.calories} 
            target={nutritionGoals.calories} 
          />
          
          {/* Macro Rings */}
          <View style={styles.macroRings}>
            {Object.entries(macroData).map(([key, macro]) => (
              <MacroRing
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                current={macro.current}
                target={macro.target}
                color={macro.color}
              />
            ))}
          </View>
        </View>

        {/* Today's Meals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {todaysMeals.length > 0 ? (
            todaysMeals.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.meal_name}</Text>
                  <Text style={styles.mealTime}>
                    {new Date(meal.logged_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} • {meal.meal_type}
                  </Text>
                </View>
                <Text style={styles.mealCalories}>{meal.calories} cal</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyMeals}>
              <Text style={styles.emptyMealsText}>No meals logged yet today</Text>
              <Text style={styles.emptyMealsSubtext}>Chat with NutriCoach to start logging!</Text>
            </View>
          )}
        </View>

        {/* Tonight's Plan - Placeholder for future meal planning feature */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Suggestions</Text>
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionInfo}>
              <Text style={styles.suggestionText}>💬 Chat with NutriCoach</Text>
              <Text style={styles.suggestionSubtext}>Get personalized meal suggestions</Text>
            </View>
            <TouchableOpacity style={styles.chatButton}>
              <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-circle" size={24} color={COLORS.teal} />
              <Text style={styles.actionText}>Log Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="location" size={24} color={COLORS.orange} />
              <Text style={styles.actionText}>Find Food</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar" size={24} color={COLORS.sage} />
              <Text style={styles.actionText}>Plan Week</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
  },
  greeting: {
    fontSize: SIZES.title2,
    fontWeight: 'bold',
    color: COLORS.teal,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  macroContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  calorieBarContainer: {
    marginTop: SIZES.margin,
    marginBottom: SIZES.margin,
  },
  calorieBarTitle: {
    fontSize: SIZES.callout,
    fontWeight: '600',
    color: COLORS.teal,
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  calorieBar: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  calorieBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: SIZES.radius,
  },
  calorieBarText: {
    fontSize: SIZES.callout,
    fontWeight: '600',
    color: COLORS.teal,
    zIndex: 2,
  },
  macroRings: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SIZES.margin,
  },
  macroRing: {
    alignItems: 'center',
  },
  ringContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  macroValue: {
    fontSize: SIZES.headline,
    fontWeight: 'bold',
    color: COLORS.teal,
  },
  macroLabel: {
    fontSize: SIZES.callout,
    fontWeight: '600',
    color: COLORS.teal,
    marginTop: 8,
  },
  macroTarget: {
    fontSize: SIZES.caption1,
    color: COLORS.gray,
  },
  section: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.margin * 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  sectionTitle: {
    fontSize: SIZES.title3,
    fontWeight: 'bold',
    color: COLORS.teal,
  },
  seeAll: {
    fontSize: SIZES.callout,
    color: COLORS.orange,
    fontWeight: '600',
  },
  mealCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
    ...SHADOWS.light,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: SIZES.callout,
    fontWeight: '600',
    color: COLORS.teal,
  },
  mealTime: {
    fontSize: SIZES.caption1,
    color: COLORS.gray,
    marginTop: 2,
  },
  mealCalories: {
    fontSize: SIZES.callout,
    fontWeight: '600',
    color: COLORS.sage,
  },
  emptyMeals: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  emptyMealsText: {
    fontSize: SIZES.callout,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 4,
  },
  emptyMealsSubtext: {
    fontSize: SIZES.caption1,
    color: COLORS.gray,
  },
  suggestionCard: {
    backgroundColor: COLORS.teal,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionText: {
    fontSize: SIZES.callout,
    fontWeight: '600',
    color: COLORS.white,
  },
  suggestionSubtext: {
    fontSize: SIZES.caption1,
    color: COLORS.cream,
    marginTop: 2,
  },
  chatButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SIZES.margin,
  },
  actionButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    width: (width - SIZES.padding * 2 - 32) / 3,
    ...SHADOWS.light,
  },
  actionText: {
    fontSize: SIZES.caption1,
    color: COLORS.teal,
    fontWeight: '600',
    marginTop: 8,
  },
});

export default HomeScreen;