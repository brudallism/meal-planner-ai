import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const SettingsScreen = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [locationServices, setLocationServices] = React.useState(true);
  const [biometricAuth, setBiometricAuth] = React.useState(false);

  const settingsOptions = [
    {
      title: 'Profile',
      items: [
        { label: 'Personal Information', icon: 'person-outline', action: () => {} },
        { label: 'Nutrition Goals', icon: 'target-outline', action: () => {} },
        { label: 'Dietary Restrictions', icon: 'restaurant-outline', action: () => {} },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { 
          label: 'Push Notifications', 
          icon: 'notifications-outline',
          toggle: true,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          label: 'Location Services',
          icon: 'location-outline',
          toggle: true,
          value: locationServices,
          onToggle: setLocationServices,
        },
        {
          label: 'Biometric Authentication',
          icon: 'finger-print-outline',
          toggle: true,
          value: biometricAuth,
          onToggle: setBiometricAuth,
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        { label: 'Export Data', icon: 'download-outline', action: () => {} },
        { label: 'Privacy Policy', icon: 'shield-outline', action: () => {} },
        { label: 'Delete Account', icon: 'trash-outline', action: () => {}, danger: true },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', icon: 'help-circle-outline', action: () => {} },
        { label: 'Contact Us', icon: 'mail-outline', action: () => {} },
        { label: 'Rate App', icon: 'star-outline', action: () => {} },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.label}
      style={styles.settingItem}
      onPress={item.action}
      disabled={item.toggle}
    >
      <View style={styles.settingLeft}>
        <Ionicons
          name={item.icon}
          size={22}
          color={item.danger ? COLORS.orange : COLORS.teal}
        />
        <Text style={[
          styles.settingLabel,
          item.danger && { color: COLORS.orange }
        ]}>
          {item.label}
        </Text>
      </View>
      {item.toggle ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: COLORS.lightGray, true: COLORS.sage + '80' }}
          thumbColor={item.value ? COLORS.sage : COLORS.gray}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={COLORS.gray}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarInitial}>D</Text>
            </View>
            <View>
              <Text style={styles.profileName}>Dallas Thompson</Text>
              <Text style={styles.profileEmail}>dallas@example.com</Text>
              <Text style={styles.profilePlan}>Premium Plan</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color={COLORS.orange} />
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        {settingsOptions.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.versionSubtext}>AI Nutrition Assistant</Text>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.orange} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
  },
  title: {
    fontSize: SIZES.title2,
    fontWeight: 'bold',
    color: COLORS.teal,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    margin: SIZES.padding,
    padding: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  avatarInitial: {
    fontSize: SIZES.title2,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileName: {
    fontSize: SIZES.headline,
    fontWeight: '600',
    color: COLORS.teal,
  },
  profileEmail: {
    fontSize: SIZES.callout,
    color: COLORS.gray,
    marginTop: 2,
  },
  profilePlan: {
    fontSize: SIZES.caption1,
    color: COLORS.sage,
    fontWeight: '600',
    marginTop: 2,
  },
  editButton: {
    padding: SIZES.base,
  },
  section: {
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  sectionTitle: {
    fontSize: SIZES.callout,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: SIZES.base,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: SIZES.callout,
    color: COLORS.teal,
    marginLeft: SIZES.padding,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.padding,
  },
  versionText: {
    fontSize: SIZES.caption1,
    color: COLORS.gray,
  },
  versionSubtext: {
    fontSize: SIZES.caption2,
    color: COLORS.gray,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.orange + '40',
    ...SHADOWS.light,
  },
  signOutText: {
    fontSize: SIZES.callout,
    color: COLORS.orange,
    fontWeight: '600',
    marginLeft: SIZES.base,
  },
});

export default SettingsScreen;