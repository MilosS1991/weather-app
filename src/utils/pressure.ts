import type { PressureAlertResult, AlertLevel, PressureDirection } from '../types';

export function pressureRateOfChange(
  pressureArray: number[],
  currentIndex: number,
  windowHours = 3,
): number | null {
  if (currentIndex < windowHours || currentIndex >= pressureArray.length) return null;
  const current = pressureArray[currentIndex];
  const past = pressureArray[currentIndex - windowHours];
  return (current - past) / windowHours;
}

export function pressureAlert(ratePerHour: number | null): PressureAlertResult | null {
  if (ratePerHour == null) return null;
  const abs = Math.abs(ratePerHour);
  const direction: PressureDirection = ratePerHour < 0 ? 'falling' : 'rising';

  let level: AlertLevel | null = null;
  if (abs >= 2) level = 'rapid';
  else if (abs >= 1) level = 'moderate';
  if (!level) return null;

  const label =
    level === 'rapid'
      ? direction === 'falling' ? 'Rapid pressure drop — storm likely' : 'Rapid pressure rise — clearing'
      : direction === 'falling' ? 'Pressure falling — weather change ahead' : 'Pressure rising — conditions improving';

  return { level, direction, label };
}
