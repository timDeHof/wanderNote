import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  Database,
  FileText,
  HelpCircle,
  Info,
  Lock,
  MapPin,
  Moon,
  Trash
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Storage keys for settings
const STORAGE_KEYS = {
  NOTIFICATIONS: '@settings_notifications',
  LOCATION_TRACKING: '@settings_location_tracking',
  OFFLINE_MODE: '@settings_offline_mode',
};

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Initialize state with loading indicators
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    locationTracking: true,
    offlineMode: false
  });

  // Load stored settings on mount
  useEffect(() => {
    const loadStoredSettings = async () => {
      try {
        const [notifs, location, offline] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.LOCATION_TRACKING),
          AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE),
        ]);

        setSettings({
          notifications: notifs === null ? true : notifs === 'true',
          locationTracking: location === null ? true : location === 'true',
          offlineMode: offline === null ? false : offline === 'true'
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredSettings();
  }, []);

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [toggleTheme]);

const updateSetting = async (key: keyof typeof STORAGE_KEYS, value: boolean) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS[key], String(value));
    setSettings(prev => ({ ...prev, [key.toLowerCase()]: value }));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    console.error(`Failed to save ${key} setting:`, error);
    // Revert the setting if save fails
    setSettings(prev => ({ ...prev, [key.toLowerCase()]: !value }));
    Alert.alert('Error', `Failed to save ${key.toLowerCase()} setting`);
  }
};

const handleNotificationsToggle = () =>
  updateSetting('NOTIFICATIONS', !settings.notifications);

const handleLocationTrackingToggle = () =>
  updateSetting('LOCATION_TRACKING', !settings.locationTracking);

const handleOfflineModeToggle = () =>
  updateSetting('OFFLINE_MODE', !settings.offlineMode);

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
              // Remove everything inside the cache folder
                const items = await FileSystem.readDirectoryAsync(cacheDir);
                await Promise.all(
                  items.map((item) =>
                    FileSystem.deleteAsync(cacheDir + item, { idempotent: true })
                  )
                );

                // ensure the directory still exists for consumers
                await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
              } else {
              Alert.alert('Error', 'Cache directory not found.');
            }
            Alert.alert('Success', 'Cache cleared successfully');
          } catch (error) {
            Alert.alert('Error', `Failed to clear cache: ${error}`);
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

// Render settings only when we have loaded values
const renderSettings = () => {
  if (settings.notifications === null || settings.locationTracking === null || settings.offlineMode === null) {
    return null;
  }

  return (
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
          settings.notifications,
          handleNotificationsToggle,
          <Bell size={20} color={Colors[theme].primary} style={styles.settingIcon} />
        )}
        {renderSwitchItem(
          'Location Tracking',
          settings.locationTracking,
          handleLocationTrackingToggle,
          <MapPin size={20} color={Colors[theme].primary} style={styles.settingIcon} />
        )}
        {renderSwitchItem(
          'Offline Mode',
          settings.offlineMode,
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
          <Trash size={20} color={Colors[theme].primary} style={styles.settingIcon} />
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
          () => { },
          <HelpCircle size={20} color={Colors[theme].primary} style={styles.settingIcon} />
        )}

        {renderLinkItem(
          'Privacy Policy',
          () => { },
          <FileText size={20} color={Colors[theme].primary} style={styles.settingIcon} />
        )}

        {renderLinkItem(
          'Terms of Service',
          () => { },
          <FileText size={20} color={Colors[theme].primary} style={styles.settingIcon} />
        )}

        {renderLinkItem(
          'About Travel Log',
          () => { },
          <Info size={20} color={Colors[theme].primary} style={styles.settingIcon} />
        )}
      </View>

      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: Colors[theme].textSecondary }]}>
          Travel Log v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

if (isLoading) {
  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[theme].text }]}>Settings</Text>
      </View>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[theme].primary} />
      </View>
    </View>
  );
}

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
          settings.notifications,
          handleNotificationsToggle,
          <Bell size={20} color={Colors[theme].primary} style={styles.settingIcon} />
        )}
        {renderSwitchItem(
          'Location Tracking',
          settings.locationTracking,
          handleLocationTrackingToggle,
          <MapPin size={20} color={Colors[theme].primary} style={styles.settingIcon} />
        )}
        {renderSwitchItem(
          'Offline Mode',
          settings.offlineMode,
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
          <Trash size={20} color={Colors[theme].primary} style={styles.settingIcon} />
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
          () => { },
          <HelpCircle size={20} color={Colors[theme].primary} style={styles.settingIcon} />
        )}

        {renderLinkItem(
          'Privacy Policy',
          () => { },
          <FileText size={20} color={Colors[theme].primary} style={styles.settingIcon} />
        )}

        {renderLinkItem(
          'Terms of Service',
          () => { },
          <FileText size={20} color={Colors[theme].primary} style={styles.settingIcon} />
        )}

        {renderLinkItem(
          'About Travel Log',
          () => { },
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

