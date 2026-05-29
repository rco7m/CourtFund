import Geolocation from 'react-native-geolocation-service';
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

type PermissionStatus = 'unavailable' | 'denied' | 'blocked' | 'limited' | 'granted';

const getPermissionKey = () => {
  if (Platform.OS === 'ios') return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  return PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
};

const toStatus = (result: string): PermissionStatus => {
  switch (result) {
    case RESULTS.GRANTED:
      return 'granted';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.LIMITED:
      return 'limited';
    default:
      return 'unavailable';
  }
};

export const checkLocationPermission = async (): Promise<PermissionStatus> => {
  const key = getPermissionKey();
  const result = await check(key);
  return toStatus(result);
};

export const requestLocationPermission = async (): Promise<PermissionStatus> => {
  const key = getPermissionKey();
  const result = await request(key);
  return toStatus(result);
};

export const getCurrentLocation = async (): Promise<Coordinates> => {
  const status = await checkLocationPermission();
  if (status !== 'granted' && status !== 'limited') {
    throw new Error('Location permission denied');
  }

  return await new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
};
