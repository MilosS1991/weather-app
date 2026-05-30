import type { AirQualityData } from '../types';
import { aqiCategory } from '../utils/aqi';
import { currentHourIndex } from '../api/openmeteo';

interface Props {
  data: AirQualityData | undefined;
  isPending: boolean;
  error: Error | null;
}

function SkeletonCard() {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 flex flex-col gap-4">
      <div className="text-slate-400 text-sm uppercase tracking-widest">Air Quality</div>
      <div className="h-10 w-24 bg-slate-700 rounded animate-pulse" />
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 bg-slate-700 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function AirQuality({ data, isPending, error }: Props) {
  if (isPending) return <SkeletonCard />;

  if (error || !data) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6 flex flex-col gap-2">
        <div className="text-slate-400 text-sm uppercase tracking-widest">Air Quality</div>
        <div className="text-red-400 text-sm">{error?.message ?? 'No data'}</div>
      </div>
    );
  }

  const idx = currentHourIndex(data.hourly.time);
  const usAqi = data.hourly.us_aqi[idx];
  const cat = usAqi != null ? aqiCategory(usAqi) : null;

  const readings = [
    { label: 'PM2.5',  value: data.hourly.pm2_5[idx],            unit: 'μg/m³' },
    { label: 'PM10',   value: data.hourly.pm10[idx],             unit: 'μg/m³' },
    { label: 'NO₂',   value: data.hourly.nitrogen_dioxide[idx],  unit: 'μg/m³' },
    { label: 'O₃',    value: data.hourly.ozone[idx],             unit: 'μg/m³' },
  ].filter((r): r is { label: string; value: number; unit: string } => r.value != null);

  return (
    <div className="bg-slate-800 rounded-2xl p-6 flex flex-col gap-4">
      <div className="text-slate-400 text-sm uppercase tracking-widest">Air Quality</div>

      {usAqi != null && cat ? (
        <div className="flex items-end gap-3">
          <div className={`text-4xl font-light tabular-nums ${cat.color}`}>{usAqi}</div>
          <div className={`text-sm mb-1 px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>
            {cat.label}
          </div>
        </div>
      ) : (
        <div className="text-slate-500 text-sm">AQI unavailable</div>
      )}

      {readings.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {readings.map(r => (
            <div key={r.label} className="bg-slate-900/60 rounded-lg px-3 py-2">
              <span className="text-slate-500">{r.label} </span>
              <span className="text-slate-200">{r.value.toFixed(1)} {r.unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
