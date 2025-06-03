import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLogs } from '@/hooks/useLogs';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import Colors from '@/utils/colors';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera, MapPin, Calendar, Star, Tag, Image as ImageIcon } from 'lucide-react-native';
import { formatDate } from '@/utils/helpers';
import DateTimePicker from '@/components/ui/DateTimePicker';
import TagSelector from '@/components/logs/TagSelector';
import LocationPicker from '@/components/logs/LocationPicker';
import Button from '@/components/ui/Button';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export default function AddScreen() {
  const { theme } = useTheme();
  const { addLog, loading } = useLogs();
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [rating, setRating] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [showTagSelector, setShowTagSelector] = useState<boolean>(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCoordinates({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...selectedImages]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  const handleLocationSelect = (name: string, coords: Coordinates) => {
    setLocation(name);
    setCoordinates(coords);
    setShowLocationPicker(false);
  };

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSave = async () => {
    if (!user) {
      setError('User not authenticated. Please log in.');
      return;
    }
    if (!title || !location || !description) {
      setError('Title, location, and description are required');
      return;
    }

    if (!coordinates) {
      setError('Location coordinates are required');
      return;
    }

    if (images.length === 0) {
      setError('At least one image is required');
      return;
    }

    try {
      const newLog = {
        title,
        description,
        location,
        date: date.toISOString(),
        rating,
        images,
        tags,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        userId: user.uid, // user is now guaranteed to be non-null here
      };

      await addLog(newLog);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save travel log');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[theme].text }]}>Add Travel Log</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View
            entering={FadeInDown.duration(400).delay(100)}
            style={[styles.form, { backgroundColor: Colors[theme].card }]}
          >
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[theme].text }]}>Title</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[theme].text,
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].inputBackground,
                  }
                ]}
                placeholder="e.g. Weekend in Paris"
                placeholderTextColor={Colors[theme].textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[theme].text }]}>Location</Text>
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  {
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].inputBackground,
                  }
                ]}
                onPress={() => setShowLocationPicker(true)}
              >
                <MapPin size={16} color={Colors[theme].textSecondary} style={styles.inputIcon} />
                <Text
                  style={[
                    styles.locationText,
                    {
                      color: location ? Colors[theme].text : Colors[theme].textSecondary
                    }
                  ]}
                >
                  {location || 'Select a location'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[theme].text }]}>Date</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  {
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].inputBackground,
                  }
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={16} color={Colors[theme].textSecondary} style={styles.inputIcon} />
                <Text style={[styles.dateText, { color: Colors[theme].text }]}>
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[theme].text }]}>Rating</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRatingPress(star)}
                  >
                    <Star
                      size={32}
                      color={star <= rating ? '#FFD700' : Colors[theme].border}
                      fill={star <= rating ? '#FFD700' : 'transparent'}
                      style={{ marginRight: 8 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[theme].text }]}>Tags</Text>
              <TouchableOpacity
                style={[
                  styles.tagButton,
                  {
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].inputBackground,
                  }
                ]}
                onPress={() => setShowTagSelector(true)}
              >
                <Tag size={16} color={Colors[theme].textSecondary} style={styles.inputIcon} />
                <Text
                  style={[
                    styles.tagText,
                    {
                      color: tags.length > 0 ? Colors[theme].text : Colors[theme].textSecondary
                    }
                  ]}
                >
                  {tags.length > 0 ? tags.join(', ') : 'Add tags (e.g. beach, mountain)'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[theme].text }]}>Description</Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    color: Colors[theme].text,
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].inputBackground,
                  }
                ]}
                placeholder="Write about your experience..."
                placeholderTextColor={Colors[theme].textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[theme].text }]}>Photos</Text>
              <View style={styles.imageButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.imageButton,
                    {
                      borderColor: Colors[theme].border,
                      backgroundColor: Colors[theme].primaryLight,
                    }
                  ]}
                  onPress={pickImages}
                >
                  <ImageIcon size={16} color={Colors[theme].primary} style={styles.buttonIcon} />
                  <Text style={[styles.buttonText, { color: Colors[theme].primary }]}>
                    Gallery
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.imageButton,
                    {
                      borderColor: Colors[theme].border,
                      backgroundColor: Colors[theme].primaryLight,
                      marginLeft: 8,
                    }
                  ]}
                  onPress={takePhoto}
                >
                  <Camera size={16} color={Colors[theme].primary} style={styles.buttonIcon} />
                  <Text style={[styles.buttonText, { color: Colors[theme].primary }]}>
                    Camera
                  </Text>
                </TouchableOpacity>
              </View>

              {images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imagesContainer}
                >
                  {images.map((image, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri: image }} style={styles.image} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Text style={styles.removeImageText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Button
              title="Save Travel Log"
              onPress={handleSave}
              isLoading={loading}
              style={{ marginTop: 24 }}
            />
          </Animated.View>
        </ScrollView>

        <DateTimePicker
          isVisible={showDatePicker}
          date={date}
          onConfirm={(selectedDate) => {
            setShowDatePicker(false);
            setDate(selectedDate);
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        <LocationPicker
          isVisible={showLocationPicker}
          initialLocation={coordinates}
          onSelectLocation={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
        />

        <TagSelector
          isVisible={showTagSelector}
          selectedTags={tags}
          onSelectTags={(selectedTags) => {
            setTags(selectedTags);
            setShowTagSelector(false);
          }}
          onClose={() => setShowTagSelector(false)}
        />
      </View>
    </KeyboardAvoidingView>
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
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    borderRadius: 16,
    margin: 16,
    padding: 16,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontFamily: 'Poppins-Regular',
    minHeight: 120,
  },
  locationButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 8,
  },
  locationText: {
    fontFamily: 'Poppins-Regular',
  },
  dateButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: 'Poppins-Regular',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontFamily: 'Poppins-Regular',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#E53935',
    marginTop: 16,
    fontFamily: 'Poppins-Regular',
  },
});
