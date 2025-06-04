import Button from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import { getMapStyle } from '@/utils/mapStyles';
import type { LocationGeocodedAddress } from 'expo-location';
import * as Location from 'expo-location';
import { MapPin, Search, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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
    // Refresh local state whenever the modal is shown or the caller
    // provides a new initialLocation.
    if (isVisible) {
      if (initialLocation) {
        setLocation(initialLocation);
      } else if (!location) {
        getCurrentLocation();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, initialLocation]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        const defaultLocation = {
          latitude: 37.7749,
          longitude: -122.4194, // San Francisco coordinates as default
        };
        setLocation(defaultLocation);

        Alert.alert(
          'Location Permission Required',
          'We need access to your location to show you on the map. Please enable location permissions in your device settings.',
          [
            {
              text: 'Continue with Default Location',
              style: 'cancel',
              onPress: async () => {
                try {
                  const [locationInfo] = await Location.reverseGeocodeAsync(defaultLocation);
                  if (locationInfo) {
                    setLocationName(formatLocationName(locationInfo));
                  }
                } catch (error) {
                  console.error('Error getting location name:', error);
                  setLocationName('San Francisco');
                }
              }
            },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:').catch(() => {
                    console.error('Failed to open settings');
                  });
                } else {
                  Linking.openSettings().catch(() => {
                    console.error('Failed to open settings');
                  });
                }
              },
            },
          ]
        );
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
  const formatLocationName = (locationInfo: LocationGeocodedAddress): string => {
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
        // Get place names for the coordinates using reverse geocoding
        const detailedResults = await Promise.all(
          results.map(async (result, index) => {
            const [locationInfo] = await Location.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude,
            });

            return {
              id: `result-${index}`,
              name: locationInfo ? formatLocationName(locationInfo) : `${searchQuery} Location ${index + 1}`,
              latitude: result.latitude,
              longitude: result.longitude,
            };
          })
        );

        setSearchResults(detailedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResultPress = (result: SearchResult) => {
    setLocation({
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setLocationName(result.name);
    setSearchResults([]); // Clear results after selection
    setSearchQuery(''); // Clear search input

    // Animate map to the selected location
    if (mapRef.current) {
      (mapRef.current as MapView).animateToRegion({
        latitude: result.latitude,
        longitude: result.longitude,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0121,
      }, 250);
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

    // Smoothly move the camera to the new point
    if (mapRef.current) {
      (mapRef.current as MapView).animateToRegion({
        ...coordinate,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0121,
      }, 250);
    }
    // Smoothly move the camera to the new point
    if (mapRef.current) {
      (mapRef.current as MapView).animateToRegion({
        ...coordinate,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0121,
      }, 250);
    }

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

          {/* Search Results List */}
          {searchResults.length > 0 && (
            <View
              style={[
                styles.searchResultsContainer,
                { backgroundColor: Colors[theme].card }
              ]}
            >
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={[
                    styles.searchResultItem,
                    { borderBottomColor: Colors[theme].border }
                  ]}
                  onPress={() => handleSearchResultPress(result)}
                >
                  <MapPin size={16} color={Colors[theme].primary} style={styles.resultIcon} />
                  <Text style={[styles.resultText, { color: Colors[theme].text }]}>
                    {result.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors[theme].primary} />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                region={location ? {
                  ...location,
                  latitudeDelta: 0.0122,
                  longitudeDelta: 0.0121,
                } : undefined}
                onPress={handleMapPress}
                customMapStyle={theme === 'dark' ? getMapStyle() : []}
              >
                {location && (
                  <Marker
                    coordinate={location}
                    pinColor={Colors[theme].primary}
                  />
                )}
              </MapView>
            </View>
          )}

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
  searchResultsContainer: {
    maxHeight: 200,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  resultIcon: {
    marginRight: 8,
  },
  resultText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
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
