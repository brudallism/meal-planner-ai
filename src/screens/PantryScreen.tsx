import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

// Mock data - will be replaced with real data from Supabase
const mockPantryItems = [
  { id: 1, name: 'Chicken Breast', quantity: '2 lbs', freshness: 'fresh', expires: '3 days' },
  { id: 2, name: 'Greek Yogurt', quantity: '1 container', freshness: 'fresh', expires: '5 days' },
  { id: 3, name: 'Spinach', quantity: '1 bag', freshness: 'warning', expires: '2 days' },
  { id: 4, name: 'Quinoa', quantity: '1 cup', freshness: 'fresh', expires: '30 days' },
  { id: 5, name: 'Bell Peppers', quantity: '3 pieces', freshness: 'warning', expires: '1 day' },
  { id: 6, name: 'Olive Oil', quantity: '500ml', freshness: 'fresh', expires: '90 days' },
];

const mockWeeklyPlan = [
  { day: 'Mon', meal: 'Chicken Quinoa Bowl', planned: true },
  { day: 'Tue', meal: 'Greek Yogurt Parfait', planned: true },
  { day: 'Wed', meal: 'Spinach Salad', planned: true },
  { day: 'Thu', meal: 'Suggest a meal', planned: false },
  { day: 'Fri', meal: 'Suggest a meal', planned: false },
  { day: 'Sat', meal: 'Suggest a meal', planned: false },
  { day: 'Sun', meal: 'Suggest a meal', planned: false },
];

const PantryItem = ({ item }: any) => {
  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'fresh': return COLORS.sage;
      case 'warning': return COLORS.mustard;
      case 'expired': return COLORS.orange;
      default: return COLORS.gray;
    }
  };

  const getFreshnessIcon = (freshness: string) => {
    switch (freshness) {
      case 'fresh': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'expired': return 'close-circle';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.pantryItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
        <Text style={styles.itemExpires}>Expires in {item.expires}</Text>
      </View>
      <View style={styles.freshnessContainer}>
        <Ionicons 
          name={getFreshnessIcon(item.freshness)} 
          size={24} 
          color={getFreshnessColor(item.freshness)} 
        />
      </View>
    </View>
  );
};

const WeeklyPlanItem = ({ item }: any) => (
  <View style={styles.planItem}>
    <View style={styles.dayContainer}>
      <Text style={styles.dayText}>{item.day}</Text>
    </View>
    <View style={[styles.mealContainer, !item.planned && styles.unplannedMeal]}>
      <Text style={[styles.mealText, !item.planned && styles.unplannedMealText]}>
        {item.meal}
      </Text>
      {!item.planned && (
        <TouchableOpacity style={styles.suggestButton}>
          <Ionicons name="add" size={16} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const PantryScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Pantry</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockPantryItems.length}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.mustard }]}>
              {mockPantryItems.filter(item => item.freshness === 'warning').length}
            </Text>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.sage }]}>3</Text>
            <Text style={styles.statLabel}>Meals Planned</Text>
          </View>
        </View>

        {/* Pantry Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Inventory</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Scan item</Text>
            </TouchableOpacity>
          </View>
          {mockPantryItems.map((item) => (
            <PantryItem key={item.id} item={item} />
          ))}
        </View>

        {/* Weekly Meal Plan */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Week's Plan</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Generate plan</Text>
            </TouchableOpacity>
          </View>
          {mockWeeklyPlan.map((item, index) => (
            <WeeklyPlanItem key={index} item={item} />
          ))}
        </View>

        {/* Shopping List Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shopping List</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View full list</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.shoppingPreview}>
            <Text style={styles.shoppingText}>• Broccoli (2 heads)</Text>
            <Text style={styles.shoppingText}>• Sweet Potato (3 pieces)</Text>
            <Text style={styles.shoppingText}>• Salmon (1 lb)</Text>
            <Text style={styles.shoppingMore}>+ 5 more items</Text>
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
  title: {
    fontSize: SIZES.title2,
    fontWeight: 'bold',
    color: COLORS.teal,
  },
  addButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  statItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    minWidth: 80,
    ...SHADOWS.light,
  },
  statNumber: {
    fontSize: SIZES.title3,
    fontWeight: 'bold',
    color: COLORS.teal,
  },
  statLabel: {
    fontSize: SIZES.caption1,
    color: COLORS.gray,
    marginTop: 4,
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
  pantryItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
    ...SHADOWS.light,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: SIZES.callout,
    fontWeight: '600',
    color: COLORS.teal,
  },
  itemQuantity: {
    fontSize: SIZES.caption1,
    color: COLORS.gray,
    marginTop: 2,
  },
  itemExpires: {
    fontSize: SIZES.caption2,
    color: COLORS.mustard,
    marginTop: 2,
  },
  freshnessContainer: {
    padding: 8,
  },
  planItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
    ...SHADOWS.light,
  },
  dayContainer: {
    width: 50,
    alignItems: 'center',
  },
  dayText: {
    fontSize: SIZES.callout,
    fontWeight: 'bold',
    color: COLORS.teal,
  },
  mealContainer: {
    flex: 1,
    backgroundColor: COLORS.sage + '20',
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    marginLeft: SIZES.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unplannedMeal: {
    backgroundColor: COLORS.lightGray,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  mealText: {
    fontSize: SIZES.callout,
    color: COLORS.teal,
    fontWeight: '500',
  },
  unplannedMealText: {
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  suggestButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shoppingPreview: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.light,
  },
  shoppingText: {
    fontSize: SIZES.callout,
    color: COLORS.teal,
    marginBottom: 4,
  },
  shoppingMore: {
    fontSize: SIZES.caption1,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default PantryScreen;