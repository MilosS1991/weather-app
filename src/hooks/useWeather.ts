import { useQuery } from '@tanstack/react-query';
import { fetchWeather, DEFAULT_LOCATION } from '../api/openmeteo';
import type { WeatherData, GeoLocation } from '../types';

export function useWeather(location: GeoLocation = DEFAULT_LOCATION) {
  return useQuery<WeatherData, Error>({
    queryKey: ['weather', location.latitude, location.longitude],
    queryFn: () => fetchWeather(location),
  });
}
