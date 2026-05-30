import type { GeoLocation, BaseHourly, FullHourly, OpenMeteoResponse, WeatherData, DailyData } from '../types';

const BASE = 'https://api.open-meteo.com/v1/forecast';

export const DEFAULT_LOCATION: GeoLocation = {
  latitude: 44.8176,
  longitude: 20.4633,
  name: 'Belgrade',
};

const FULL_HOURLY_VARS = [
  'temperature_2m',
  'apparent_temperature',
  'precipitation',
  'rain',
  'snowfall',
  'dew_point_2m',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'pressure_msl',
  'relative_humidity_2m',
  'precipitation_probability',
].join(',');

const COMPARISON_VARS = 'temperature_2m,precipitation';

async function fetchModel(
  model: 'default' | string,
  location: GeoLocation,
): Promise<OpenMeteoResponse<BaseHourly>> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    hourly: model === 'default' ? FULL_HOURLY_VARS : COMPARISON_VARS,
    timezone: 'auto',
    forecast_days: '7',
    ...(model !== 'default' && { models: model }),
  });
  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo (${model}): HTTP ${res.status}`);
  return res.json() as Promise<OpenMeteoResponse<BaseHourly>>;
}

export async function fetchWeather(location: GeoLocation = DEFAULT_LOCATION): Promise<WeatherData> {
  const [primary, ecmwf, gfs] = await Promise.all([
    fetchModel('default', location) as Promise<OpenMeteoResponse<FullHourly>>,
    fetchModel('ecmwf_ifs04', location),
    fetchModel('gfs_seamless', location),
  ]);
  return { primary, ecmwf, gfs };
}

const DAILY_VARS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'weather_code',
  'precipitation_sum',
  'precipitation_hours',
  'uv_index_max',
  'sunrise',
  'sunset',
].join(',');

export async function fetchDaily(location: GeoLocation = DEFAULT_LOCATION): Promise<DailyData> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    daily: DAILY_VARS,
    timezone: 'auto',
    forecast_days: '7',
  });
  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo daily: HTTP ${res.status}`);
  const data = await res.json();
  return data.daily as DailyData;
}

/**
 * Open-Meteo times are city-local (e.g. "2024-01-15T14:00") with no timezone suffix.
 * Appending "Z" to both the time strings and the city-local "now" string lets us compare
 * them as if they were all in the same fake-UTC space — differences between consecutive
 * hourly slots are still exactly 3600 s, so the closest-index logic stays correct.
 */
export function currentHourIndex(timeArray: string[], timezone = 'UTC'): number {
  const nowCityStr = new Intl.DateTimeFormat('sv-SE', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date()).replace(' ', 'T');
  const nowFake = new Date(nowCityStr + ':00Z').getTime();

  let closest = 0;
  let minDiff = Infinity;
  timeArray.forEach((t, i) => {
    const diff = Math.abs(new Date(t + ':00Z').getTime() - nowFake);
    if (diff < minDiff) { minDiff = diff; closest = i; }
  });
  return closest;
}
