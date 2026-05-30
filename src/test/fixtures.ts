import type { FullHourly, DailyData, AirQualityData, BaseHourly } from '../types';

// 48 hourly timestamps: 2024-01-15T00:00 → 2024-01-16T23:00
export const MOCK_TIMES: string[] = Array.from({ length: 48 }, (_, i) => {
  const day = i < 24 ? '2024-01-15' : '2024-01-16';
  const h = String(i % 24).padStart(2, '0');
  return `${day}T${h}:00`;
});

export const MOCK_HOURLY: FullHourly = {
  time:                    MOCK_TIMES,
  temperature_2m:          Array.from({ length: 48 }, (_, i) => 10 + (i % 10)),
  apparent_temperature:    Array.from({ length: 48 }, (_, i) => 8 + (i % 10)),
  precipitation:           Array.from({ length: 48 }, (_, i) => (i % 8 === 0 ? 0.5 : 0)),
  rain:                    Array.from({ length: 48 }, (_, i) => (i % 8 === 0 ? 0.5 : 0)),
  snowfall:                Array.from({ length: 48 }, () => 0),
  weather_code:            Array.from({ length: 48 }, (_, i) => (i % 6 === 0 ? 61 : 1)),
  wind_speed_10m:          Array.from({ length: 48 }, (_, i) => 15 + (i % 5)),
  wind_direction_10m:      Array.from({ length: 48 }, (_, i) => (i * 30) % 360),
  pressure_msl:            Array.from({ length: 48 }, (_, i) => 1013 + (i % 5)),
  relative_humidity_2m:    Array.from({ length: 48 }, (_, i) => 60 + (i % 20)),
  precipitation_probability: Array.from({ length: 48 }, (_, i) => (i % 10) * 10),
  dew_point_2m:            Array.from({ length: 48 }, (_, i) => 5 + (i % 5)),
};

export const MOCK_DAILY: DailyData = {
  time: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-20', '2024-01-21'],
  temperature_2m_max:  [15, 16, 14, 12, 17, 18, 13],
  temperature_2m_min:  [5,   6,  4,  3,  7,  8,  4],
  weather_code:        [1,   2, 61,  0,  1,  3, 71],
  precipitation_sum:   [0, 0.5, 2.0, 0,  0, 1.0, 0.2],
  precipitation_hours: [0,   1,  4,  0,  0,  2,  1],
  uv_index_max:        [2,   3,  1,  4,  2,  1,  3],
  sunrise: [
    '2024-01-15T07:30:00', '2024-01-16T07:29:00', '2024-01-17T07:28:00',
    '2024-01-18T07:27:00', '2024-01-19T07:26:00', '2024-01-20T07:25:00',
    '2024-01-21T07:24:00',
  ],
  sunset: [
    '2024-01-15T16:30:00', '2024-01-16T16:32:00', '2024-01-17T16:34:00',
    '2024-01-18T16:36:00', '2024-01-19T16:38:00', '2024-01-20T16:40:00',
    '2024-01-21T16:42:00',
  ],
};

export const MOCK_AQ_DATA: AirQualityData = {
  hourly: {
    time:               MOCK_TIMES,
    pm2_5:              Array.from({ length: 48 }, () => 5.0),
    pm10:               Array.from({ length: 48 }, () => 10.0),
    nitrogen_dioxide:   Array.from({ length: 48 }, () => 15.0),
    ozone:              Array.from({ length: 48 }, () => 80.0),
    us_aqi:             Array.from({ length: 48 }, () => 25),
  },
};

export const MOCK_BASE_HOURLY: BaseHourly = {
  time:          MOCK_TIMES,
  temperature_2m: Array.from({ length: 48 }, (_, i) => 12 + (i % 8)),
  precipitation:  Array.from({ length: 48 }, () => 0),
};
