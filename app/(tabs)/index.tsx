import TravelLogSkeleton from '@/components/logs/TravelLogSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import SearchBar from '@/components/ui/SearchBar';
import { useAuth } from '@/hooks/useAuth';
import { useLogs } from '@/hooks/useLogs';
import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import { formatDate } from '@/utils/helpers';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Plus, Star } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Log {
  id: string;
  title: string;
  location: string;
  description: string;
  tags: string[];
  images?: string[];
  date: string | Date; // Assuming date can be a string or Date object
  rating: number;
}

interface StarRatingProps {
  rating: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 16, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.ratingContainer, style]}>
      {[1, 2, 3, 4, 5].map((star) => (
        <View key={star} style={{ position: 'relative', marginRight: star < 5 ? 4 : 0 }}>
          {/* Base (unfilled) star */}
          <Star size={size} color={Colors[theme].border} />
          {/* Filled star overlay */}
          {star <= rating && (
            <Star
              size={size}
              color={Colors[theme].starFilled}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          )}
        </View>
      ))}
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { logs, refreshLogs, loading } = useLogs(); // Assuming useLogs returns logs of type Log[]
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs as Log[];
    const query = searchQuery.toLowerCase();
    return (logs as Log[]).filter(
      (log: Log) =>
        log.title?.toLowerCase().includes(query) ||
        log.location?.toLowerCase().includes(query) ||
        log.description?.toLowerCase().includes(query) ||
        log.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [logs, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLogs();
    setRefreshing(false);
  };

  const renderLogItem = ({ item }: { item: Log }) => {
    const mainImage = item.images && item.images.length > 0 ? item.images[0] : null;

    return (
      <Animated.View entering={FadeIn.duration(400)}>
        <TouchableOpacity
          style={[
            styles.logCard,
            { backgroundColor: Colors[theme].card }
          ]}
          onPress={() => router.push(`/entry/${item.id}` as any)} // Using 'as any' for now, ideally router types would cover dynamic segments
          activeOpacity={0.7}
        >
          {mainImage && (
            <Image
              source={{ uri: mainImage }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: Colors[theme].text }]}>
              {item.title}
            </Text>

            <View style={styles.cardMeta}>
              <View style={styles.locationContainer}>
                <MapPin size={14} color={Colors[theme].primary} />
                <Text style={[styles.locationText, { color: Colors[theme].textSecondary }]}>
                  {item.location}
                </Text>
              </View>

              <View style={styles.dateContainer}>
                <Calendar size={14} color={Colors[theme].textSecondary} />
                <Text style={[styles.dateText, { color: Colors[theme].textSecondary }]}>
                  {formatDate(item.date)}
                </Text>
              </View>
            </View>

            <StarRating rating={item.rating} />

            <View style={styles.tagsContainer}>
              {item.tags.map((tag: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: Colors[theme].primaryLight }
                  ]}
                >
                  <Text style={[styles.tagText, { color: Colors[theme].primary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: Colors[theme].textSecondary }]}>
            Hello, {user?.displayName || 'Traveler'}
          </Text>
          <Text style={[styles.title, { color: Colors[theme].text }]}>
            Your Travel Logs
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search places, trips, tags..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.skeletonContainer}>
          <TravelLogSkeleton />
          <TravelLogSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          renderItem={renderLogItem}
          keyExtractor={(item: Log) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon={<MapPin size={48} color={Colors[theme].textSecondary} />}
              title="No travel logs yet"
              message="Start by adding your first travel experience"
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors[theme].primary}
              colors={[Colors[theme].primary]}
            />
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors[theme].primary }]}
        onPress={() => router.push('/(tabs)/add' as any)}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  logCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
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
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 84,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
    }),
  },
  skeletonContainer: {
    padding: 16,
  },
});
