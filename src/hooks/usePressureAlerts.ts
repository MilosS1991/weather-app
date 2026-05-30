import { useState, useEffect, useRef, useCallback } from 'react';
import { pressureRateOfChange, pressureAlert } from '../utils/pressure';
import { DEFAULT_LOCATION } from '../api/openmeteo';
import type { GeoLocation } from '../types';

const POLL_MS = 15 * 60 * 1000;
const DEDUP_MS = 90 * 60 * 1000;
const STORAGE_KEY = 'wx-pressure-alert-last';

interface StoredAlert {
  level: string;
  direction: string;
  firedAt: number;
}

async function fetchPressureSeries(location: GeoLocation): Promise<{ time: string[]; pressure_msl: number[] }> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    hourly: 'pressure_msl',
    timezone: 'auto',
    past_days: '1',
    forecast_days: '1',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Pressure poll: ${res.status}`);
  const data = await res.json();
  return data.hourly as { time: string[]; pressure_msl: number[] };
}

function nearestIndex(times: string[]): number {
  const now = Date.now();
  return times.reduce((best, t, i) =>
    Math.abs(new Date(t).getTime() - now) < Math.abs(new Date(times[best]).getTime() - now)
      ? i
      : best,
  0);
}

function isDuplicate(alert: { level: string; direction: string }): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const last: StoredAlert = JSON.parse(raw);
    return (
      last.level === alert.level &&
      last.direction === alert.direction &&
      Date.now() - last.firedAt < DEDUP_MS
    );
  } catch {
    return false;
  }
}

function storeAlert(alert: { level: string; direction: string }): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...alert, firedAt: Date.now() } satisfies StoredAlert),
    );
  } catch { /* quota exceeded — skip */ }
}

export interface UsePressureAlertsResult {
  supported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
}

export function usePressureAlerts(location: GeoLocation = DEFAULT_LOCATION): UsePressureAlertsResult {
  const supported = typeof window !== 'undefined' && 'Notification' in window;

  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : 'denied',
  );
  const permRef = useRef(permission);
  permRef.current = permission;
  const locationRef = useRef(location);
  locationRef.current = location;

  const check = useCallback(async () => {
    if (permRef.current !== 'granted') return;
    try {
      const { time, pressure_msl } = await fetchPressureSeries(locationRef.current);
      const idx = nearestIndex(time);
      const rate = pressureRateOfChange(pressure_msl, idx, 3);
      const alert = pressureAlert(rate);
      if (!alert || isDuplicate(alert)) return;

      new Notification(`${locationRef.current.name} Weather`, {
        body: alert.label,
        icon: '/favicon.svg',
        tag: `pressure-${alert.level}-${alert.direction}`,
      });
      storeAlert(alert);
    } catch {
      // best-effort — notification failure must never crash the app
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') void check();
  }, [supported, check]);

  // Poll every 15 minutes while tab is open
  useEffect(() => {
    if (!supported) return;
    const id = setInterval(() => void check(), POLL_MS);
    return () => clearInterval(id);
  }, [supported, check]);

  return { supported, permission, requestPermission };
}
