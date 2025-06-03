import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/utils/colors';
import { useRouter } from 'expo-router';
import {
  Moon,
  ArrowLeft,
  Lock,
  Bell,
  Database,
  HelpCircle,
  FileText,
  Info,
  MapPin
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleThemeToggle = () => {
    toggleTheme();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNotificationsToggle = () => {
    setNotifications(!notifications);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleLocationTrackingToggle = () => {
    setLocationTracking(!locationTracking);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleOfflineModeToggle = () => {
    setOfflineMode(!offlineMode);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleClearCache = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Cannot clear cache on web platform');
      return;
    }

    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache? This will remove all locally stored images.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              const cacheDir = FileSystem.cacheDirectory;
              if (cacheDir) {
                await FileSystem.deleteAsync(cacheDir, { idempotent: true });
              } else {
                Alert.alert('Error', 'Cache directory not found.');
              }
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export all your travel logs. Feature coming soon.'
    );
  };

  const renderSwitchItem = (title: string, value: boolean, onValueChange: () => void, icon: React.ReactNode) => (
    <View style={[styles.settingItem, { borderBottomColor: Colors[theme].border }]}>
      <View style={styles.settingInfo}>
        {icon}
        <Text style={[styles.settingTitle, { color: Colors[theme].text }]}>
          {title}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: Colors[theme].border,
          true: Colors[theme].primary
        }}
        thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? '#FFFFFF' : Colors[theme].card}
      />
    </View>
  );

  const renderLinkItem = (title: string, onPress: () => void, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: Colors[theme].border }]}
      onPress={onPress}
    >
      <View style={styles.settingInfo}>
        {icon}
        <Text style={[styles.settingTitle, { color: Colors[theme].text }]}>
          {title}
        </Text>
      </View>
      <ArrowLeft size={16} color={Colors[theme].textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[theme].text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.section, { backgroundColor: Colors[theme].card }]}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].textSecondary }]}>
            APPEARANCE
          </Text>

          {renderSwitchItem(
            'Dark Mode',
            theme === 'dark',
            handleThemeToggle,
            <Moon size={20} color={Colors[theme].primary} style={styles.settingIcon} />
          )}
        </View>

        <View style={[styles.section, { backgroundColor: Colors[theme].card }]}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].textSecondary }]}>
            PREFERENCES
          </Text>

          {renderSwitchItem(
            'Push Notifications',
            notifications,
            handleNotificationsToggle,
            <Bell size={20} color={Colors[theme].primary} style={styles.settingIcon} />
          )}

          {renderSwitchItem(
            'Location Tracking',
            locationTracking,
            handleLocationTrackingToggle,
            <MapPin size={20} color={Colors[theme].primary} style={styles.settingIcon} />
          )}

          {renderSwitchItem(
            'Offline Mode',
            offlineMode,
            handleOfflineModeToggle,
            <Database size={20} color={Colors[theme].primary} style={styles.settingIcon} />
          )}
        </View>

        <View style={[styles.section, { backgroundColor: Colors[theme].card }]}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].textSecondary }]}>
            DATA
          </Text>

          {renderLinkItem(
            'Export Travel Data',
            handleExportData,
            <Database size={20} color={Colors[theme].primary} style={styles.settingIcon} />
          )}

          {renderLinkItem(
            'Clear Cache',
            handleClearCache,
            <Database size={20} color={Colors[theme].primary} style={styles.settingIcon} />
          )}
        </View>

        <View style={[styles.section, { backgroundColor: Colors[theme].card }]}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].textSecondary }]}>
            ACCOUNT
          </Text>

          {renderLinkItem(
            'Change Password',
            () => router.push('/change-password' as any),
            <Lock size={20} color={Colors[theme].primary} style={styles.settingIcon} />
          )}
        </View>

        <View style={[styles.section, { backgroundColor: Colors[theme].card }]}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].textSecondary }]}>
            ABOUT
          </Text>

          {renderLinkItem(
            'Help & Support',
            () => {},
            <HelpCircle size={20} color={Colors[theme].primary} style={styles.settingIcon} />
          )}

          {renderLinkItem(
            'Privacy Policy',
            () => {},
            <FileText size={20} color={Colors[theme].primary} style={styles.settingIcon} />
          )}

          {renderLinkItem(
            'Terms of Service',
            () => {},
            <FileText size={20} color={Colors[theme].primary} style={styles.settingIcon} />
          )}

          {renderLinkItem(
            'About Travel Log',
            () => {},
            <Info size={20} color={Colors[theme].primary} style={styles.settingIcon} />
          )}
        </View>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: Colors[theme].textSecondary }]}>
            Travel Log v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  versionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
});
