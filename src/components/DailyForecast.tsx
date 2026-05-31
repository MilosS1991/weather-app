import { useState } from 'react';
import type { DailyData, FullHourly } from '../types';
import { wmoIcon, wmoLabel } from '../utils/wmo';
import { HourlyForecast } from './HourlyForecast';

interface Props {
  data: DailyData;
  hourly: FullHourly;
  currentHourIndex: number;
  timezone: string;
}

interface RowProps {
  day: DailyData;
  index: number;
  weekMin: number;
  weekMax: number;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
}

// Mobile: Day | Icon | Hi/Lo | Bar | Chevron
// Desktop (sm+): + Precip | UV | Sunrise/Sunset
const GRID_MOBILE  = 'grid-cols-[4rem_1.5rem_3.5rem_1fr_1.25rem]';
const GRID_DESKTOP = 'sm:grid-cols-[5rem_1.5rem_3.5rem_1fr_3.5rem_4rem_5rem_1.25rem]';
const GRID = `grid ${GRID_MOBILE} ${GRID_DESKTOP}`;

function uvColor(uv: number): string {
  if (uv <= 2)  return 'text-green-400';
  if (uv <= 5)  return 'text-yellow-400';
  if (uv <= 7)  return 'text-orange-400';
  if (uv <= 10) return 'text-red-400';
  return 'text-purple-400';
}

// Open-Meteo sunrise/sunset strings are city-local ("2024-01-15T07:30:00") — extract directly
function hhmm(isoString: string): string {
  return isoString.split('T')[1]?.slice(0, 5) ?? '';
}

function TempRangeBar({
  min, max, weekMin, weekMax,
}: {
  min: number; max: number; weekMin: number; weekMax: number;
}) {
  const span = weekMax - weekMin || 1;
  const left = ((min - weekMin) / span) * 100;
  const width = ((max - min) / span) * 100;

  return (
    <div className="relative h-1.5 w-full rounded-full bg-slate-700/50">
      <div
        className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400"
        style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
      />
    </div>
  );
}

function DayRow({ day, index, weekMin, weekMax, isToday, isSelected, onClick }: RowProps) {
  // Parse as local midnight to avoid UTC-midnight-to-local-date shift for western timezones
  const [y, mo, d] = day.time[index].split('-').map(Number);
  const date = new Date(y, mo - 1, d);
  const dayLabel = isToday
    ? 'Today'
    : date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });

  const tMax = day.temperature_2m_max[index];
  const tMin = day.temperature_2m_min[index];
  const code = day.weather_code[index];
  const precip = day.precipitation_sum[index];
  const precipHours = day.precipitation_hours[index];
  const uv = day.uv_index_max[index];
  const sunrise = day.sunrise[index];
  const sunset = day.sunset[index];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${GRID} items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl text-sm w-full text-left cursor-pointer transition-colors ${
        isSelected
          ? 'bg-slate-700/80 ring-1 ring-slate-500/50'
          : isToday
          ? 'bg-slate-700/60 hover:bg-slate-700/80'
          : 'hover:bg-slate-700/30'
      }`}
    >
      <div className={isToday ? 'text-slate-100 font-medium' : 'text-slate-400'}>
        {dayLabel}
      </div>

      <div title={wmoLabel(code)}>{wmoIcon(code)}</div>

      <div className="tabular-nums text-xs text-slate-300 text-right whitespace-nowrap">
        <span className="text-blue-300">{Math.round(tMin)}°</span>
        <span className="text-slate-600 mx-0.5">/</span>
        <span className="text-orange-300">{Math.round(tMax)}°</span>
      </div>

      <TempRangeBar min={tMin} max={tMax} weekMin={weekMin} weekMax={weekMax} />

      <div className="hidden sm:block text-xs tabular-nums text-right">
        {precip > 0 ? (
          <span className="text-blue-400" title={`${precipHours}h of precipitation`}>
            {precip.toFixed(1)}<span className="text-slate-500">mm</span>
          </span>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </div>

      <div className={`hidden sm:block text-xs tabular-nums text-right font-medium ${uvColor(uv)}`}>
        UV {Math.round(uv)}
      </div>

      <div className="hidden sm:block text-xs text-slate-500 tabular-nums text-right whitespace-nowrap">
        ↑{hhmm(sunrise)} ↓{hhmm(sunset)}
      </div>

      <div className={`text-slate-500 text-xs text-right transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`}>
        ›
      </div>
    </button>
  );
}

function findDayStartIndex(hourlyTimes: string[], dayDate: string): number {
  const idx = hourlyTimes.findIndex(t => t.startsWith(dayDate));
  return idx === -1 ? 0 : idx;
}

export function DailyForecast({ data, hourly, currentHourIndex, timezone }: Props) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const weekMin = Math.min(...data.temperature_2m_min);
  const weekMax = Math.max(...data.temperature_2m_max);

  function toggleDay(i: number) {
    setSelectedDay(prev => (prev === i ? null : i));
  }

  const selectedDate = selectedDay !== null ? data.time[selectedDay] : null;
  const hourlyStartIndex = selectedDay === null
    ? currentHourIndex
    : selectedDay === 0
    ? currentHourIndex
    : findDayStartIndex(hourly.time, data.time[selectedDay]);

  const selectedDayLabel = selectedDay !== null
    ? selectedDay === 0
      ? 'Today'
      : new Date(data.time[selectedDay]).toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'short',
        })
    : '';

  return (
    <div className="bg-slate-800 rounded-2xl p-4">
      <div className="text-slate-400 text-sm uppercase tracking-widest mb-3 px-3 sm:px-4">
        7-Day Forecast
      </div>

      <div className={`${GRID} items-center gap-2 sm:gap-3 px-3 sm:px-4 pb-2 text-slate-600 text-xs uppercase tracking-wider`}>
        <span>Day</span>
        <span />
        <span className="text-right">Hi/Lo</span>
        <span />
        <span className="hidden sm:block text-right">Precip</span>
        <span className="hidden sm:block text-right">UV</span>
        <span className="hidden sm:block text-right">Sun</span>
        <span />
      </div>

      <div className="flex flex-col gap-0.5">
        {data.time.map((_, i) => (
          <DayRow
            key={data.time[i]}
            day={data}
            index={i}
            weekMin={weekMin}
            weekMax={weekMax}
            isToday={i === 0}
            isSelected={selectedDay === i}
            onClick={() => toggleDay(i)}
          />
        ))}
      </div>

      {selectedDay !== null && selectedDate !== null && (
        <div className="mt-3 pt-4 border-t border-slate-700/50">
          <div className="text-slate-500 text-xs uppercase tracking-widest mb-3 px-1">
            {selectedDayLabel} · Hourly
          </div>
          <HourlyForecast
            hourly={hourly}
            startIndex={hourlyStartIndex}
            timezone={timezone}
            showNowLabel={selectedDay === 0}
            wrapped={false}
          />
        </div>
      )}
    </div>
  );
}
