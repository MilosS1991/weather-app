import type { FullHourly } from '../types';
import { wmoIcon } from '../utils/wmo';
import { degreesToCardinal, windArrowRotation } from '../utils/wind';
import { Sparkline } from './Sparkline';

interface Props {
  hourly: FullHourly;
  startIndex: number;
  timezone: string;
  showNowLabel?: boolean;
  wrapped?: boolean;
  title?: string;
}

interface PrecipBarProps {
  mm: number;
  rain: number;
  snowfall: number;
  probability: number;
}

// ── Smooth cubic-bezier path (Catmull-Rom tension) ───────────────────────────

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  const t = 0.35;
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// ── Temperature sparkline ────────────────────────────────────────────────────

const CHART_H = 52;
const LABEL_H = 14; // px reserved below curve for hour tick labels
const PAD_V   = 8;

interface SparklineProps {
  temps: number[];
  times: string[];
  gradId: string;
  timezone: string;
}

function TempSparkline({ temps, times, gradId, timezone }: SparklineProps) {
  const n = temps.length;
  if (n < 2) return null;

  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;

  const pts = temps.map((t, i) => ({
    x: (i / (n - 1)) * 100,
    y: PAD_V + (1 - (t - min) / range) * (CHART_H - 2 * PAD_V),
  }));

  const line = smoothPath(pts);
  const area = `${line} L 100 ${CHART_H} L 0 ${CHART_H} Z`;

  const maxIdx = temps.indexOf(max);
  const minIdx = temps.indexOf(min);
  const showMin = minIdx !== maxIdx && Math.abs(pts[maxIdx].x - pts[minIdx].x) > 8;

  // Precise "now" in the city's local timezone.
  // Appending "Z" to both city-local strings (from Open-Meteo) and the city-local now
  // treats them as fake-UTC — relative differences are preserved, so the fraction is correct.
  const nowCityStr = new Intl.DateTimeFormat('sv-SE', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date()).replace(' ', 'T');
  const nowFake = new Date(nowCityStr + ':00Z').getTime();
  let nowX = pts[0].x;
  let nowY = pts[0].y;
  for (let i = 0; i < times.length - 1; i++) {
    const t0 = new Date(times[i] + ':00Z').getTime();
    const t1 = new Date(times[i + 1] + ':00Z').getTime();
    if (nowFake >= t0 && nowFake <= t1) {
      const frac = (nowFake - t0) / (t1 - t0);
      nowX = ((i + frac) / (n - 1)) * 100;
      nowY = pts[i].y + frac * (pts[i + 1].y - pts[i].y);
      break;
    }
  }

  const labelX = (x: number) => `clamp(1.5rem, ${x}%, calc(100% - 1.5rem))`;

  return (
    <Sparkline
      nowX={nowX}
      nowY={nowY}
      height={CHART_H}
      extraBottom={LABEL_H}
      id={gradId}
      className="w-full mb-1 group"
      svgContent={({ pastClip, futureClip }) => (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#fb923c" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0"    />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradId})`} clipPath={futureClip} />
          <path d={line} fill="none" stroke="#94a3b8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" clipPath={futureClip} />
          <path d={line} fill="none" stroke="#334155" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" clipPath={pastClip} />
        </>
      )}
    >
      <span
        className="absolute text-[9px] leading-none text-orange-400 font-medium pointer-events-none"
        style={{ left: labelX(pts[maxIdx].x), top: Math.max(2, pts[maxIdx].y - 13), transform: 'translateX(-50%)' }}
      >
        {Math.round(max)}°
      </span>
      {showMin && (
        <span
          className="absolute text-[9px] leading-none text-sky-400 font-medium pointer-events-none"
          style={{ left: labelX(pts[minIdx].x), top: Math.min(CHART_H - 10, pts[minIdx].y + 2), transform: 'translateX(-50%)' }}
        >
          {Math.round(min)}°
        </span>
      )}
      {pts.map((pt, i) => {
        const h = parseInt(times[i].split('T')[1]?.split(':')[0] ?? '0', 10);
        if (i > 18 || h % 6 !== 0) return null;
        return (
          <span
            key={i}
            className="absolute text-[9px] leading-none text-slate-500 pointer-events-none
                       opacity-30 group-hover:opacity-100 transition-opacity duration-200"
            style={{ left: `${pt.x}%`, top: CHART_H + 3, transform: 'translateX(-50%)' }}
          >
            {String(h).padStart(2, '0')}
          </span>
        );
      })}
    </Sparkline>
  );
}

// ── Precipitation bar ────────────────────────────────────────────────────────

function precipProbColor(pct: number): string {
  if (pct >= 80) return 'text-blue-300 font-medium';
  if (pct >= 50) return 'text-sky-400';
  if (pct >= 20) return 'text-slate-400';
  return 'text-slate-700';
}

function PrecipBar({ mm, rain, snowfall, probability }: PrecipBarProps) {
  const pct = Math.min(100, (mm / 5) * 100);
  const isSnow  = snowfall > 0 && rain < 0.1;
  const isMixed = snowfall > 0 && rain >= 0.1;
  const barColor = isSnow ? 'bg-sky-200' : isMixed ? 'bg-sky-300' : mm >= 2 ? 'bg-blue-400' : 'bg-blue-500/60';
  const title = isSnow
    ? `${snowfall.toFixed(1)} cm snow`
    : isMixed
    ? `${rain.toFixed(1)} mm rain + ${snowfall.toFixed(1)} cm snow`
    : `${mm.toFixed(1)} mm rain`;

  return (
    <div className="flex flex-col items-center gap-0.5 w-full">
      <span className={`text-xs tabular-nums leading-none ${precipProbColor(probability)}`}>
        {probability}%
      </span>
      {mm >= 0.1 ? (
        <div className="h-1 w-full rounded-full bg-slate-700/50 overflow-hidden" title={title}>
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      ) : (
        <div className="h-1 w-full rounded-full bg-slate-700/30" />
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function HourlyForecast({
  hourly,
  startIndex,
  timezone,
  showNowLabel = true,
  wrapped = true,
  title = '24-Hour Forecast',
}: Props) {
  const indices = Array.from({ length: 25 }, (_, i) => startIndex + i)
    .filter(i => i < hourly.time.length);

  // Sparkline shows today 00:00 → 24:00; cells start from current hour
  const todayStr = hourly.time[startIndex]?.split('T')[0] ?? '';
  const dayBase  = Math.max(0, hourly.time.findIndex(t => t.startsWith(todayStr)));
  const sparkTemps = hourly.temperature_2m.slice(dayBase, dayBase + 25);
  const sparkTimes = hourly.time.slice(dayBase, dayBase + 25);

  const cells = (
    <div className="overflow-x-auto -mx-1 px-1 pb-2">
      <div className="flex gap-2 min-w-max">
        {indices.map((idx, i) => {
          const time     = hourly.time[idx];
          const temp     = hourly.temperature_2m[idx];
          const precip   = hourly.precipitation[idx];
          const rain     = hourly.rain[idx];
          const snowfall = hourly.snowfall[idx];
          const prob     = hourly.precipitation_probability[idx] ?? 0;
          const code     = hourly.weather_code[idx];
          const speed    = hourly.wind_speed_10m[idx];
          const windDir  = hourly.wind_direction_10m[idx];

          const isFirst = i === 0;
          // Open-Meteo times are city-local — extract directly from the string
          const label   = isFirst && showNowLabel
            ? 'Now'
            : time.split('T')[1]?.slice(0, 5) ?? '';
          const hour    = parseInt(time.split('T')[1]?.split(':')[0] ?? '0', 10);
          const isNight = hour < 6 || hour >= 21;

          return (
            <div
              key={idx}
              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs min-w-[52px] ${
                isFirst ? 'bg-slate-700 ring-1 ring-slate-500' : 'bg-slate-900/50'
              } ${isNight ? 'opacity-70' : ''}`}
            >
              <div className={`font-medium ${isFirst ? 'text-slate-100' : 'text-slate-400'}`}>
                {label}
              </div>
              <div className="text-lg leading-none">{wmoIcon(code)}</div>
              <div className="text-slate-100 font-semibold tabular-nums">
                {Math.round(temp)}°
              </div>
              <PrecipBar mm={precip} rain={rain} snowfall={snowfall} probability={prob} />
              <div
                className="flex items-center gap-1 text-slate-500 tabular-nums"
                title={`From ${degreesToCardinal(windDir)} (${windDir}°)`}
              >
                <span
                  className="inline-block leading-none text-slate-600"
                  style={{ transform: `rotate(${windArrowRotation(windDir)}deg)` }}
                >
                  ↑
                </span>
                {Math.round(speed)}<span className="text-slate-600"> km/h</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Use startIndex as part of the gradient ID to avoid SVG defs conflicts
  // when both the main card and a DailyForecast expansion are mounted
  const gradId = `hf-g${startIndex}`;

  if (!wrapped) {
    return (
      <div>
        <TempSparkline temps={sparkTemps} times={sparkTimes} gradId={gradId} timezone={timezone} />
        {cells}
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-6">
      <div className="text-slate-400 text-sm uppercase tracking-widest mb-3">{title}</div>
      <TempSparkline temps={sparkTemps} times={sparkTimes} gradId={gradId} timezone={timezone} />
      {cells}
    </div>
  );
}
