import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { Log } from '@/context/LogsContext';
import { useLogs } from '@/hooks/useLogs';
import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import { formatDate } from '@/utils/helpers';
import { getDarkMapStyle } from '@/utils/mapStyles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  MapPin,
  Share2,
  Star,
  Trash,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function EntryDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const { getLogById, deleteLog, loading } = useLogs();
  const router = useRouter();

  const [log, setLog] = useState<Log | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (id) {
      const logData = getLogById(id.toString());
      if (logData) {
        setLog(logData);
      } else {
        // Log not found, redirect to home
        router.replace('/');
      }
    }
  }, [id, getLogById, router]);

  const handleShare = useCallback(async () => {
    if (!log) return;
    try {
      await Share.share({
        message: `Check out my travel to ${log.location}! ${log.title}`,
      });
    } catch {
      Alert.alert('Error', 'Could not share this log');
    }
  }, [log]);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirmation(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!log) return;
    try {
      await deleteLog(log.id);
      router.replace('/');
    } catch {
      Alert.alert('Error', 'Could not delete this log');
    }
  }, [log, deleteLog, router]);

  const navigateToEdit = useCallback(() => {
    if (!log) return;
    router.push(`/edit/${log.id}` as any);
  }, [log, router]);

  const handlePrevImage = useCallback(() => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  }, [selectedImageIndex]);

  const handleNextImage = useCallback(() => {
    if (log?.images && selectedImageIndex < log.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  }, [log, selectedImageIndex]);

  const renderRatingStars = useCallback((rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star: number) => (
          <Star
            key={star}
            size={16}
            color={star <= rating ? '#FFD700' : Colors[theme].border}
            fill={star <= rating ? '#FFD700' : 'transparent'}
          />
        ))}
      </View>
    );
  }, [theme]);

  if (!log) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors[theme].background }]}>
        <Text style={[styles.loadingText, { color: Colors[theme].text }]}>
          {loading ? 'Loading...' : 'Entry not found'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {log.images && log.images.length > 0 ? (
            <>
              <Image
                source={{ uri: log.images[selectedImageIndex] }}
                style={styles.coverImage}
                resizeMode="cover"
              />

              {log.images.length > 1 && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.imageNavButton,
                      styles.imageNavButtonLeft,
                      { backgroundColor: Colors[theme].card }
                    ]}
                    onPress={handlePrevImage}
                    disabled={selectedImageIndex === 0}
                  >
                    <ChevronLeft
                      size={20}
                      color={selectedImageIndex === 0
                        ? Colors[theme].textSecondary
                        : Colors[theme].text
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.imageNavButton,
                      styles.imageNavButtonRight,
                      { backgroundColor: Colors[theme].card }
                    ]}
                    onPress={handleNextImage}
                    disabled={selectedImageIndex === log.images.length - 1}
                  >
                    <ChevronRight
                      size={20}
                      color={selectedImageIndex === log.images.length - 1
                        ? Colors[theme].textSecondary
                        : Colors[theme].text
                      }
                    />
                  </TouchableOpacity>

                  <View style={styles.imagePagination}>
                    <Text style={styles.imagePaginationText}>
                      {selectedImageIndex + 1} / {log.images.length}
                    </Text>
                  </View>
                </>
              )}
            </>
          ) : (
            <View
              style={[
                styles.coverImage,
                {
                  backgroundColor: Colors[theme].card,
                  justifyContent: 'center',
                  alignItems: 'center',
                }
              ]}
            >
              <Text style={{ color: Colors[theme].textSecondary }}>No image</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Share2 size={20} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToEdit}
            >
              <Edit size={20} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: 'rgba(229, 57, 53, 0.8)' }]}
              onPress={handleDelete}
            >
              <Trash size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[
            styles.contentContainer,
            { backgroundColor: Colors[theme].card }
          ]}
        >
          <Text style={[styles.title, { color: Colors[theme].text }]}>
            {log.title}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <MapPin size={16} color={Colors[theme].primary} style={styles.metaIcon} />
              <Text style={[styles.metaText, { color: Colors[theme].text }]}>
                {log.location}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Calendar size={16} color={Colors[theme].textSecondary} style={styles.metaIcon} />
              <Text style={[styles.metaText, { color: Colors[theme].textSecondary }]}>
                {formatDate(log.date)}
              </Text>
            </View>
          </View>

          {renderRatingStars(log.rating)}

          <View style={styles.tagsContainer}>
            {log.tags && log.tags.map((tag: string, index: number) => (
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

          <Text style={[styles.description, { color: Colors[theme].text }]}>
            {log.description}
          </Text>

          <View style={styles.mapContainer}>
            <Text style={[styles.mapTitle, { color: Colors[theme].text }]}>
              Location
            </Text>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: log.latitude,
                longitude: log.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              onPress={() => {
                const url = Platform.select({
                  ios: `maps://app?q=${log.latitude},${log.longitude}`,
                  android: `geo:${log.latitude},${log.longitude}?q=${log.latitude},${log.longitude}`
                });
                if (url) Linking.openURL(url);
              }}
              customMapStyle={theme === 'dark' ? getDarkMapStyle() : []}
            >
              <Marker
                coordinate={{
                  latitude: log.latitude,
                  longitude: log.longitude,
                }}
                pinColor={Colors[theme].primary}
              />
            </MapView>
          </View>

          {log.images && log.images.length > 1 && (
            <View style={styles.thumbnailGallery}>
              <Text style={[styles.galleryTitle, { color: Colors[theme].text }]}>
                Gallery
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailContainer}
              >
                {log.images.map((image: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index && {
                        borderColor: Colors[theme].primary,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => setSelectedImageIndex(index)}
                  >
                    <Image source={{ uri: image }} style={styles.thumbnailImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <DeleteConfirmationModal
        visible={showDeleteConfirmation}
        onCancel={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        isLoading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 16,
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  imageNavButtonLeft: {
    left: 16,
  },
  imageNavButtonRight: {
    right: 16,
  },
  imagePagination: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  imagePaginationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  contentContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    lineHeight: 24,
    marginBottom: 24,
  },
  mapContainer: {
    marginBottom: 24,
  },
  mapTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 12,
  },
  map: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnailGallery: {
    marginBottom: 24,
  },
  galleryTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 12,
  },
  thumbnailContainer: {
    paddingBottom: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
