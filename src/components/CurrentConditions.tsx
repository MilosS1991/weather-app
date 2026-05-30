import type { FullHourly } from '../types';
import { wmoLabel, wmoIcon } from '../utils/wmo';
import { degreesToCardinal, windArrowRotation } from '../utils/wind';

interface Props {
  hourly: FullHourly;
  index: number;
  locationName: string;
}

interface StatProps {
  label: string;
  children: React.ReactNode;
}

function Stat({ label, children }: StatProps) {
  return (
    <div className="bg-slate-900/60 rounded-lg p-3">
      <div className="text-slate-500 text-xs mb-1 whitespace-nowrap truncate">{label}</div>
      <div className="text-slate-100 font-medium">{children}</div>
    </div>
  );
}

export function CurrentConditions({ hourly, index, locationName }: Props) {
  const temp     = hourly.temperature_2m[index];
  const feelsLike = hourly.apparent_temperature[index];
  const humidity  = hourly.relative_humidity_2m[index];
  const dewPoint  = hourly.dew_point_2m[index];
  const speed     = hourly.wind_speed_10m[index];
  const direction = hourly.wind_direction_10m[index];
  const code      = hourly.weather_code[index];
  const time      = hourly.time[index];

  // Open-Meteo time strings are already in the city's local timezone ("2024-01-15T14:00")
  const localTime = time.split('T')[1]?.slice(0, 5) ?? '';

  const cardinal = degreesToCardinal(direction);
  const arrowRot = windArrowRotation(direction);

  return (
    <div className="bg-slate-800 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-slate-400 text-sm uppercase tracking-widest">{locationName}</div>
          <div className="text-slate-500 text-xs mt-0.5">Updated {localTime}</div>
        </div>
        <span className="text-4xl" title={wmoLabel(code)}>{wmoIcon(code)}</span>
      </div>

      <div>
        <div className="text-6xl font-light text-orange-100 tabular-nums">
          {Math.round(temp)}°
        </div>
        <div className="text-slate-400 text-sm mt-1">{wmoLabel(code)}</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <Stat label="Feels like">{Math.round(feelsLike)}°C</Stat>
        <Stat label="Humidity">{humidity}%</Stat>
        <Stat label="Dew point">{Math.round(dewPoint)}°C</Stat>
        <Stat label="Wind">
          <span
            className="flex items-center gap-1"
            title={`From ${cardinal} (${direction}°)`}
          >
            <span
              className="inline-block leading-none text-slate-400 flex-none"
              style={{ transform: `rotate(${arrowRot}deg)` }}
            >
              ↑
            </span>
            <span className="tabular-nums">{Math.round(speed)} km/h</span>
          </span>
          <span className="text-slate-400 text-xs mt-0.5 block">{cardinal}</span>
        </Stat>
      </div>
    </div>
  );
}
