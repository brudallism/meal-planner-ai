import React from 'react';
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

const { width } = Dimensions.get('window');

// Mock data - will be replaced with real data from Supabase
const mockData = {
  macros: {
    protein: { current: 45, target: 120, color: COLORS.teal },
    carbs: { current: 89, target: 200, color: COLORS.orange },
    fat: { current: 32, target: 65, color: COLORS.sage },
  },
  todaysMeals: [
    { id: 1, name: 'Greek Yogurt Bowl', time: '8:30 AM', calories: 320 },
    { id: 2, name: 'Grilled Chicken Salad', time: '1:15 PM', calories: 450 },
  ],
  tonightsMeal: {
    name: 'Salmon with Quinoa',
    time: '7:00 PM',
    prepTime: '25 min',
  },
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

const MealCard = ({ meal }: any) => (
  <View style={styles.mealCard}>
    <View style={styles.mealInfo}>
      <Text style={styles.mealName}>{meal.name}</Text>
      <Text style={styles.mealTime}>{meal.time}</Text>
    </View>
    <Text style={styles.mealCalories}>{meal.calories} cal</Text>
  </View>
);

const HomeScreen = () => {
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

        {/* Macro Rings */}
        <View style={styles.macroContainer}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.macroRings}>
            {Object.entries(mockData.macros).map(([key, macro]) => (
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
          {mockData.todaysMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </View>

        {/* Tonight's Meal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tonight's Plan</Text>
          <View style={styles.tonightCard}>
            <View style={styles.tonightInfo}>
              <Text style={styles.tonightMeal}>{mockData.tonightsMeal.name}</Text>
              <Text style={styles.tonightTime}>
                {mockData.tonightsMeal.time} • {mockData.tonightsMeal.prepTime}
              </Text>
            </View>
            <TouchableOpacity style={styles.cookButton}>
              <Ionicons name="restaurant" size={20} color={COLORS.white} />
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
  tonightCard: {
    backgroundColor: COLORS.teal,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  tonightInfo: {
    flex: 1,
  },
  tonightMeal: {
    fontSize: SIZES.callout,
    fontWeight: '600',
    color: COLORS.white,
  },
  tonightTime: {
    fontSize: SIZES.caption1,
    color: COLORS.cream,
    marginTop: 2,
  },
  cookButton: {
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