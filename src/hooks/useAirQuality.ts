import { useQuery } from '@tanstack/react-query';
import { fetchAirQuality } from '../api/openaq';
import type { AirQualityData } from '../types';

export function useAirQuality(lat = 44.8176, lon = 20.4633) {
  return useQuery<AirQualityData, Error>({
    queryKey: ['airQuality', lat, lon],
    queryFn: () => fetchAirQuality(lat, lon),
  });
}
