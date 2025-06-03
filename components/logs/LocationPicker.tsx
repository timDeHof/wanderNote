import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import { X, MapPin, Search } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import { getDarkMapStyle } from '@/utils/mapStyles';

type LocationPickerProps = {
  isVisible: boolean;
  initialLocation?: { latitude: number; longitude: number } | null;
  onSelectLocation: (name: string, coordinates: { latitude: number; longitude: number }) => void;
  onClose: () => void;
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  isVisible,
  initialLocation,
  onSelectLocation,
  onClose,
}) => {
  const { theme } = useTheme();
  const [location, setLocation] = useState(initialLocation || null);
  const [locationName, setLocationName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  type SearchResult = {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
  };
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const mapRef = useRef(null);

  useEffect(() => {
    if (!location && isVisible) {
      getCurrentLocation();
    }
  }, [isVisible]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;

      setLocation({ latitude, longitude });

      // Get location name from coordinates
      const [locationInfo] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (locationInfo) {
        const name = formatLocationName(locationInfo);
        setLocationName(name);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLocationName = (locationInfo: { city: any; district?: string | null; streetNumber?: string | null; street?: string | null; region: any; subregion?: string | null; country: any; postalCode?: string | null; name: any; isoCountryCode?: string | null; timezone?: string | null; formattedAddress?: string | null; }) => {
    const components = [];

    if (locationInfo.name) components.push(locationInfo.name);
    if (locationInfo.city) components.push(locationInfo.city);
    if (locationInfo.region) components.push(locationInfo.region);
    if (locationInfo.country) components.push(locationInfo.country);

    return components.join(', ');
  };

  const searchLocations = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const results = await Location.geocodeAsync(searchQuery);

      if (results.length > 0) {
        // Mock search results with names
        // In a real app, you'd use a geocoding service with place names
        const mockResults = results.map((result, index) => ({
          ...result,
          id: `result-${index}`,
          name: `${searchQuery} ${index + 1}`,
        }));

        setSearchResults(mockResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  interface MapCoordinate {
    latitude: number;
    longitude: number;
  }

  interface MapPressEvent {
    nativeEvent: {
      coordinate: MapCoordinate;
    };
  }

  const handleMapPress = async (event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    setLocation(coordinate);

    try {
      const [locationInfo] = await Location.reverseGeocodeAsync(coordinate);

      if (locationInfo) {
        const name = formatLocationName(locationInfo);
        setLocationName(name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleConfirm = () => {
    if (location) {
      onSelectLocation(locationName || 'Unknown location', location);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: Colors[theme].card }
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              Select Location
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors[theme].text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchInputContainer,
                {
                  backgroundColor: Colors[theme].inputBackground,
                  borderColor: Colors[theme].border,
                }
              ]}
            >
              <Search size={16} color={Colors[theme].textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: Colors[theme].text }]}
                placeholder="Search locations..."
                placeholderTextColor={Colors[theme].textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={searchLocations}
                returnKeyType="search"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.searchButton,
                { backgroundColor: Colors[theme].primary }
              ]}
              onPress={searchLocations}
            >
              <Search size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors[theme].primary} />
            </View>
          ) : (
            <>
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={
                  location ? {
                    ...location,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  } : {
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }
                }
                onPress={handleMapPress}
                customMapStyle={theme === 'dark' ? getDarkMapStyle() : []}
              >
                {location && (
                  <Marker
                    coordinate={location}
                    pinColor={Colors[theme].primary}
                  />
                )}
              </MapView>

              <View
                style={[
                  styles.locationInfoContainer,
                  { borderColor: Colors[theme].border }
                ]}
              >
                <MapPin size={16} color={Colors[theme].primary} style={styles.locationIcon} />
                <TextInput
                  style={[styles.locationNameInput, { color: Colors[theme].text }]}
                  placeholder="Enter location name..."
                  placeholderTextColor={Colors[theme].textSecondary}
                  value={locationName}
                  onChangeText={setLocationName}
                />
              </View>
            </>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Confirm"
              onPress={handleConfirm}
              disabled={!location || !locationName}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    marginTop: 80,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  locationInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationNameInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
});

export default LocationPicker;
