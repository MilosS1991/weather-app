import type { AirQualityData } from '../types';

const BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: 'pm2_5,pm10,nitrogen_dioxide,ozone,us_aqi',
    timezone: 'auto',
    forecast_days: '1',
  });
  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`Air quality: HTTP ${res.status}`);
  return res.json() as Promise<AirQualityData>;
}
