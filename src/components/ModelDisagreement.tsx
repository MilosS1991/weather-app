import type { BaseHourly } from '../types';

interface Props {
  ecmwfHourly: BaseHourly;
  gfsHourly: BaseHourly;
  primaryTimes: string[];
  currentIndex: number;
}

interface DeltaPoint {
  time: string;
  ecmwf: number;
  gfs: number;
  delta: number;
}

interface BarProps {
  deltas: DeltaPoint[];
  threshold: number;
}

const DISAGREEMENT_THRESHOLD = 2;

const ALERT_STYLES = {
  high:     { text: 'text-red-400',     bg: 'bg-red-400/10',     badge: 'High'     },
  moderate: { text: 'text-amber-400',   bg: 'bg-amber-400/10',   badge: 'Moderate' },
  low:      { text: 'text-emerald-400', bg: 'bg-emerald-400/10', badge: 'Good'     },
} as const;

type AlertLevel = keyof typeof ALERT_STYLES;

function DisagreementBar({ deltas, threshold }: BarProps) {
  const maxDelta = Math.max(...deltas.map(d => d.delta), threshold);
  return (
    <div className="flex gap-0.5 items-end h-8">
      {deltas.map((d, i) => {
        const heightPct = (d.delta / maxDelta) * 100;
        const over = d.delta >= threshold;
        const hhmm = new Date(d.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        return (
          <div
            key={i}
            title={`${hhmm}: ECMWF ${d.ecmwf.toFixed(1)}° / GFS ${d.gfs.toFixed(1)}° (Δ${d.delta.toFixed(1)}°)`}
            className={`flex-1 rounded-sm min-h-[2px] ${over ? 'bg-amber-400' : 'bg-slate-600'}`}
            style={{ height: `${Math.max(heightPct, 4)}%` }}
          />
        );
      })}
    </div>
  );
}

export function ModelDisagreement({ ecmwfHourly, gfsHourly, primaryTimes, currentIndex }: Props) {
  const ecmwfByTime: Record<string, number> = Object.fromEntries(
    ecmwfHourly.time.map((t, i) => [t, i]),
  );

  const next24 = primaryTimes.slice(currentIndex, currentIndex + 25);

  const deltas: DeltaPoint[] = next24.flatMap(t => {
    const ei = ecmwfByTime[t];
    const gi = gfsHourly.time.indexOf(t);
    if (ei == null || gi === -1) return [];
    const e = ecmwfHourly.temperature_2m[ei];
    const g = gfsHourly.temperature_2m[gi];
    if (e == null || g == null) return [];
    return [{ time: t, ecmwf: e, gfs: g, delta: Math.abs(e - g) }];
  });

  if (deltas.length === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6">
        <div className="text-slate-400 text-sm uppercase tracking-widest mb-2">Model Disagreement</div>
        <div className="text-slate-500 text-sm">Model data unavailable</div>
      </div>
    );
  }

  const avgDelta = deltas.reduce((s, d) => s + d.delta, 0) / deltas.length;
  const maxDelta = Math.max(...deltas.map(d => d.delta));
  const disagreementHours = deltas.filter(d => d.delta >= DISAGREEMENT_THRESHOLD);

  const alertLevel: AlertLevel = maxDelta >= 4 ? 'high' : maxDelta >= 2 ? 'moderate' : 'low';
  const s = ALERT_STYLES[alertLevel];

  const badgeHours = disagreementHours
    .slice(0, 3)
    .map(d => new Date(d.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    .join(', ');

  return (
    <div className="bg-slate-800 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-slate-400 text-sm uppercase tracking-widest">Model Agreement</div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.badge}</span>
      </div>

      <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
        <div>
          <div className="text-slate-500 text-xs mb-0.5">Avg Δ (24h)</div>
          <div className={`text-xl sm:text-2xl font-light tabular-nums ${s.text}`}>
            ±{avgDelta.toFixed(1)}°C
          </div>
        </div>
        <div>
          <div className="text-slate-500 text-xs mb-0.5">Max Δ</div>
          <div className="text-xl sm:text-2xl font-light tabular-nums text-slate-200">
            {maxDelta.toFixed(1)}°C
          </div>
        </div>
        {disagreementHours.length > 0 && (
          <div>
            <div className="text-slate-500 text-xs mb-0.5">Uncertain hrs</div>
            <div className="text-xl sm:text-2xl font-light tabular-nums text-amber-300">
              {disagreementHours.length}h
            </div>
          </div>
        )}
      </div>

      <DisagreementBar deltas={deltas} threshold={DISAGREEMENT_THRESHOLD} />

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-blue-400 inline-block rounded" />
          ECMWF IFS04
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-orange-400 inline-block rounded" />
          GFS Seamless
        </div>
      </div>

      {disagreementHours.length > 0 && (
        <div className="text-amber-400/80 text-xs bg-amber-400/5 rounded-lg px-3 py-2">
          Models diverge by ≥{DISAGREEMENT_THRESHOLD}°C at {badgeHours}
          {disagreementHours.length > 3 && ` +${disagreementHours.length - 3} more`}
          . Forecast confidence reduced.
        </div>
      )}
    </div>
  );
}
