import { useQuery } from '@tanstack/react-query';
import { fetchDaily, DEFAULT_LOCATION } from '../api/openmeteo';
import type { DailyData, GeoLocation } from '../types';

export function useDaily(location: GeoLocation = DEFAULT_LOCATION) {
  return useQuery<DailyData, Error>({
    queryKey: ['daily', location.latitude, location.longitude],
    queryFn: () => fetchDaily(location),
  });
}
