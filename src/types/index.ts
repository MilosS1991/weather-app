// ── Location ─────────────────────────────────────────────────────────────────

export interface GeoLocation {
  latitude: number;
  longitude: number;
  name: string;
}

// ── Open-Meteo ────────────────────────────────────────────────────────────────

/** Variables returned by all model requests (comparison subset) */
export interface BaseHourly {
  time: string[];
  temperature_2m: number[];
  precipitation: number[];
}

/** Full variable set returned by the primary (default model) request */
export interface FullHourly extends BaseHourly {
  apparent_temperature: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  pressure_msl: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  rain: number[];
  snowfall: number[];
  dew_point_2m: number[];
}

export interface OpenMeteoResponse<H extends BaseHourly = FullHourly> {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: H;
}

export interface WeatherData {
  primary: OpenMeteoResponse<FullHourly>;
  ecmwf: OpenMeteoResponse<BaseHourly>;
  gfs: OpenMeteoResponse<BaseHourly>;
}

// ── Air Quality ───────────────────────────────────────────────────────────────

export interface AirQualityHourly {
  time: string[];
  pm2_5: (number | null)[];
  pm10: (number | null)[];
  nitrogen_dioxide: (number | null)[];
  ozone: (number | null)[];
  us_aqi: (number | null)[];
}

export interface AirQualityData {
  hourly: AirQualityHourly;
}

// ── Pressure ─────────────────────────────────────────────────────────────────

export type AlertLevel = 'rapid' | 'moderate';
export type PressureDirection = 'rising' | 'falling';

export interface PressureAlertResult {
  level: AlertLevel;
  direction: PressureDirection;
  label: string;
}

// ── Daily forecast ────────────────────────────────────────────────────────────

export interface DailyData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  precipitation_sum: number[];
  precipitation_hours: number[];
  uv_index_max: number[];
  sunrise: string[];
  sunset: string[];
}

// ── AQI ──────────────────────────────────────────────────────────────────────

export interface AqiCategory {
  label: string;
  color: string;
  bg: string;
}
