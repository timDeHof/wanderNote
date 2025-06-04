import LogCardModal from '@/components/logs/LogCardModal';
import { useLogs } from '@/hooks/useLogs';
import { Log } from '@/context/LogsContext';
import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import { getDarkMapStyle } from '@/utils/mapStyles';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Compass, List, MapPin, Search } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { MapType, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function MapScreen() {
  const { theme } = useTheme();
  const { logs } = useLogs();
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  interface UserLocation {
    latitude: number;
    longitude: number;
  }
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mapType, setMapType] = useState<MapType>('standard');


  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Consider showing a toast or alert to inform the user
        console.warn('Location permission not granted');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.warn('Failed to get current location:', error);
      }
    })();
  }, []);


  const handleMarkerPress = (log: Log): void => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const navigateToCurrentLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
    const toggleMapType = () => {
      setMapType(mapType === 'standard' ? 'satellite' : 'standard' as MapType);
    };
    setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  };

  const navigateToSearch = () => {
    router.push('/search' as any);
  };

  const navigateToLogList = () => {
    router.push('/');
  };

  const toggleMapType = () => {
    setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          userLocation
            ? {
              ...userLocation,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
            : {
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
        }
        mapType={mapType}
        customMapStyle={theme === 'dark' ? getDarkMapStyle() : []}
      >
        {logs.map((log) => (
          <Marker
            key={log.id}
            coordinate={{
              latitude: log.latitude,
              longitude: log.longitude,
            }}
            onPress={() => handleMarkerPress(log)}
            pinColor={Colors[theme].primary}
          >
            <View style={styles.customMarker}>
              <View style={[styles.markerBg, { backgroundColor: Colors[theme].primary }]}>
                <MapPin size={16} color="#FFFFFF" />
              </View>
            </View>
          </Marker>
        ))}

        {userLocation && (
          <Marker
            coordinate={userLocation}
            pinColor="#4285F4"
            title="Your Location"
          >
            <View style={styles.userLocationMarker}>
              <View style={styles.userDot} />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: Colors[theme].card }
          ]}
          onPress={navigateToCurrentLocation}
        >
          <Compass size={20} color={Colors[theme].primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: Colors[theme].card }
          ]}
          onPress={toggleMapType}
        >
          <MapPin size={20} color={Colors[theme].primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: Colors[theme].card }
          ]}
          onPress={navigateToSearch}
        >
          <Search size={20} color={Colors[theme].primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: Colors[theme].card }
          ]}
          onPress={navigateToLogList}
        >
          <List size={20} color={Colors[theme].primary} />
        </TouchableOpacity>
      </View>

      {selectedLog && (
        <LogCardModal
          visible={showModal}
          log={selectedLog}
          onClose={() => setShowModal(false)}
          onViewDetails={() => router.push(`/entry/${selectedLog.id}`)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    alignItems: 'center',
  },
  markerBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
        elevation: 4,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  userLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: 'white',
  },
  controls: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
    }),
  },
});
