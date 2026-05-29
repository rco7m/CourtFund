import axios from 'axios';

const SPORT_MAP: Record<string, string> = {
  football: 'soccer',
  cricket: 'cricket',
  tennis: 'tennis',
  badminton: 'badminton',
  basketball: 'basketball',
  volleyball: 'volleyball',
  pickleball: 'pickleball',
  'table tennis': 'table_tennis',
};

export const searchNearbySportsPlaces = async (
  latitude: number,
  longitude: number,
  sport: string,
) => {
  const mappedSport = SPORT_MAP[sport.toLowerCase()] || sport.toLowerCase();
  const query = `
    [out:json][timeout:25];
    (
      node["sport"="${mappedSport}"](around:5000,${latitude},${longitude});
      way["sport"="${mappedSport}"](around:5000,${latitude},${longitude});
      relation["sport"="${mappedSport}"](around:5000,${latitude},${longitude});
      node["leisure"="sports_centre"](around:5000,${latitude},${longitude});
      way["leisure"="sports_centre"](around:5000,${latitude},${longitude});
      relation["leisure"="sports_centre"](around:5000,${latitude},${longitude});
    );
    out center tags;
  `;

  const response = await axios.post(
    'https://overpass-api.de/api/interpreter',
    query,
    { headers: { 'Content-Type': 'text/plain' } },
  );

  return response.data.elements ?? [];
};
