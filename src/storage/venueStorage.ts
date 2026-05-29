import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveSelectedVenue = async (venue: any) => {
  await AsyncStorage.setItem('selectedVenue', JSON.stringify(venue));
};

export const getSelectedVenue = async () => {
  const data = await AsyncStorage.getItem('selectedVenue');
  return data ? JSON.parse(data) : null;
};
