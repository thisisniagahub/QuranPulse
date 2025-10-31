import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocationData } from '../types';
import { logger } from './loggingService';

const LOCATION_KEY = 'last_location';

/**
 * Get user's current location
 */
export async function getCurrentLocation(): Promise<LocationData> {
  try {
    // Check for cached location first
    const cachedLocation = await AsyncStorage.getItem(LOCATION_KEY);
    if (cachedLocation) {
      const parsed: LocationData = JSON.parse(cachedLocation);
      // Use cached if less than 1 hour old
      if (Date.now() - (parsed as any).timestamp < 3600000) {
        return parsed;
      }
    }

    // Request permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    // Get current position
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Reverse geocode to get city/country
    const [address] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      city: address?.city || address?.subregion || 'Unknown',
      country: address?.country || 'Unknown',
      timezone: address?.timezone || undefined,
    };

    // Cache location
    await AsyncStorage.setItem(
      LOCATION_KEY,
      JSON.stringify({ ...locationData, timestamp: Date.now() })
    );

    return locationData;
  } catch (error) {
    logger.error('Error getting location:', error);
    throw new Error('Failed to get location. Please enable location services.');
  }
}
