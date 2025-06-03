import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useLogs } from '@/hooks/useLogs';
import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import { useRouter } from 'expo-router';
import { Image as ImageIcon, LogOut, MapPin, Settings } from 'lucide-react-native';
import React from 'react';
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { logs } = useLogs();
  const router = useRouter();

  // Filter logs to only show the current user's logs
  const userLogs = logs.filter(log => log.userId === user?.uid);

  // Calculate stats
  const totalDestinations = new Set(userLogs.map(log => log.location)).size;
  const totalPhotos = userLogs.reduce((sum, log) => sum + (log.images?.length || 0), 0);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const navigateToLogDetails = (logId: string): void => {
    router.push(`/entry/${logId}`);
  };

  const renderRecentLogItem = ({ item }: { item: { id: string; title: string; location: string; images?: string[] } }) => {
    return (
      <TouchableOpacity
        style={[
          styles.recentLogItem,
          { backgroundColor: Colors[theme].card }
        ]}
        onPress={() => navigateToLogDetails(item.id)}
      >
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.recentLogImage} />
        ) : (
          <View style={[styles.noImagePlaceholder, { backgroundColor: Colors[theme].border }]}>
            <ImageIcon size={24} color={Colors[theme].textSecondary} />
          </View>
        )}

        <View style={styles.recentLogInfo}>
          <Text
            style={[styles.recentLogTitle, { color: Colors[theme].text }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <View style={styles.recentLogLocation}>
            <MapPin size={12} color={Colors[theme].primary} />
            <Text
              style={[styles.recentLogLocationText, { color: Colors[theme].textSecondary }]}
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Mock avatar URL - in a real app, this would be from the user profile
  const avatarUrl = user?.photoURL || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg';

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[theme].text }]}>Profile</Text>
        <TouchableOpacity onPress={navigateToSettings}>
          <Settings size={24} color={Colors[theme].text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Animated.View
          entering={FadeIn.duration(800)}
          style={[
            styles.profileCard,
            { backgroundColor: Colors[theme].card }
          ]}
        >
          <View style={styles.profileHeader}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />

            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: Colors[theme].text }]}>
                {user?.displayName || 'Traveler'}
              </Text>
              <Text style={[styles.profileEmail, { color: Colors[theme].textSecondary }]}>
                {user?.email}
              </Text>
            </View>
          </View>

          <View style={[styles.statsDivider, { backgroundColor: Colors[theme].border }]} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors[theme].primary }]}>
                {userLogs.length}
              </Text>
              <Text style={[styles.statLabel, { color: Colors[theme].textSecondary }]}>
                Logs
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: Colors[theme].border }]} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors[theme].primary }]}>
                {totalDestinations}
              </Text>
              <Text style={[styles.statLabel, { color: Colors[theme].textSecondary }]}>
                Places
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: Colors[theme].border }]} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors[theme].primary }]}>
                {totalPhotos}
              </Text>
              <Text style={[styles.statLabel, { color: Colors[theme].textSecondary }]}>
                Photos
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
            Recent Logs
          </Text>

          {userLogs.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: Colors[theme].border }]}>
              <MapPin size={40} color={Colors[theme].textSecondary} />
              <Text style={[styles.emptyStateText, { color: Colors[theme].text }]}>
                No travel logs yet
              </Text>
              <Button
                title="Create Your First Log"
                onPress={() => router.push('/add')}
                style={{ marginTop: 16 }}
                size="small"
              />
            </View>
          ) : (
            <FlatList
              data={userLogs.slice(0, 5)}
              renderItem={renderRecentLogItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentLogsList}
              ListFooterComponent={
                userLogs.length > 5 ? (
                  <TouchableOpacity
                    style={[
                      styles.viewAllButton,
                      { backgroundColor: Colors[theme].primaryLight }
                    ]}
                    onPress={() => router.push('/')}
                  >
                    <Text style={[styles.viewAllText, { color: Colors[theme].primary }]}>
                      View All
                    </Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.signOutButton,
            { borderColor: Colors[theme].border }
          ]}
          onPress={handleSignOut}
        >
          <LogOut size={18} color={Colors[theme].danger} style={{ marginRight: 8 }} />
          <Text style={[styles.signOutText, { color: Colors[theme].danger }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  statsDivider: {
    height: 1,
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
  recentLogsList: {
    paddingBottom: 8,
  },
  recentLogItem: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  recentLogImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  noImagePlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recentLogInfo: {
    padding: 12,
  },
  recentLogTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  recentLogLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentLogLocationText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginLeft: 4,
  },
  viewAllButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 168, // Match height of log items
  },
  viewAllText: {
    fontFamily: 'Poppins-Medium',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  signOutText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
});
