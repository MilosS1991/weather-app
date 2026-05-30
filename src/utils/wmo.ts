const WMO_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
  85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ hail', 99: 'Thunderstorm w/ heavy hail',
};

const WMO_ICON: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '❄️', 75: '❄️', 77: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  85: '🌨️', 86: '🌨️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

export function wmoLabel(code: number | undefined): string {
  if (code === undefined) return 'Unknown';
  return WMO_LABELS[code] ?? 'Unknown';
}

export function wmoIcon(code: number | undefined): string {
  if (code === undefined) return '🌡️';
  return WMO_ICON[code] ?? '🌡️';
}

const SEVERE_CODES = new Set([95, 96, 99]);

export interface SevereEvent {
  time: string;
  code: number;
  label: string;
}

export function scanSevereWeather(
  codes: number[],
  times: string[],
  startIndex: number,
  windowHours = 12,
): SevereEvent[] {
  const end = Math.min(startIndex + windowHours, codes.length);
  const events: SevereEvent[] = [];
  for (let i = startIndex; i < end; i++) {
    if (SEVERE_CODES.has(codes[i])) {
      events.push({ time: times[i], code: codes[i], label: WMO_LABELS[codes[i]] ?? 'Severe weather' });
    }
  }
  return events;
}
