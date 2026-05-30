import type { GeoLocation } from '../types';

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];
  const params = new URLSearchParams({
    name: query.trim(),
    count: '6',
    language: 'en',
    format: 'json',
  });
  const res = await fetch(`${GEOCODING_BASE}?${params}`);
  if (!res.ok) throw new Error(`Geocoding: HTTP ${res.status}`);
  const data = await res.json() as { results?: GeocodingResult[] };
  return data.results ?? [];
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'json',
    zoom: '10',
    'accept-language': 'en',
  });
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    { headers: { 'User-Agent': 'personal-weather-app/1.0' } },
  );
  if (!res.ok) throw new Error(`Reverse geocode: HTTP ${res.status}`);
  const data = await res.json() as {
    address?: { city?: string; town?: string; village?: string; county?: string };
  };
  const addr = data.address ?? {};
  const name = addr.city ?? addr.town ?? addr.village ?? addr.county ?? 'My Location';
  return { latitude: lat, longitude: lon, name };
}
