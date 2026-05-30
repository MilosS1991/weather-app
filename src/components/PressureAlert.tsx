import type { AlertLevel } from '../types';
import { pressureRateOfChange, pressureAlert } from '../utils/pressure';
import { Sparkline } from './Sparkline';

interface Props {
  pressureArray: number[];
  currentIndex: number;
}

interface SparklineProps {
  values: number[];
  nowIndex: number;
}

const LEVEL_STYLES: Record<AlertLevel, { border: string; badge: string; dot: string }> = {
  rapid:    { border: 'border-red-500/40',   badge: 'bg-red-500/20 text-red-300',    dot: 'bg-red-400'   },
  moderate: { border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300', dot: 'bg-amber-400' },
};

const SPARK_H   = 48;
const SPARK_PAD = 4;

function PressureSparkline({ values, nowIndex }: SparklineProps) {
  const n   = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => ({
    svgX: (i / (n - 1)) * 100,
    y: SPARK_PAD + (1 - (v - min) / range) * (SPARK_H - 2 * SPARK_PAD),
  }));

  const allPts = pts.map(p => `${p.svgX.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  return (
    <Sparkline
      nowX={pts[nowIndex].svgX}
      nowY={pts[nowIndex].y}
      height={SPARK_H}
      id="pa-spark"
      svgContent={({ pastClip, futureClip }) => (
        <>
          <polyline points={allPts} fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" clipPath={pastClip} />
          <polyline points={allPts} fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" clipPath={futureClip} />
        </>
      )}
    />
  );
}

export function PressureAlert({ pressureArray, currentIndex }: Props) {
  const current = pressureArray[currentIndex];
  const rate    = pressureRateOfChange(pressureArray, currentIndex, 3);
  const alert   = pressureAlert(rate);
  const styles  = alert ? LEVEL_STYLES[alert.level] : null;

  const sparkStart = Math.max(0, currentIndex - 12);
  const sparkEnd   = Math.min(pressureArray.length, currentIndex + 13);
  const sparkData  = pressureArray.slice(sparkStart, sparkEnd);
  const nowIndex   = currentIndex - sparkStart;

  return (
    <div
      className={`bg-slate-800 rounded-2xl p-6 flex flex-col gap-4 border ${
        styles ? styles.border : 'border-transparent'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-slate-400 text-sm uppercase tracking-widest">Pressure</div>
        {alert && styles && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5 ${styles.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} animate-pulse`} />
            {alert.level === 'rapid' ? 'Rapid' : 'Moderate'}
          </span>
        )}
      </div>

      <div className="flex items-end gap-3">
        <div className="text-4xl font-light text-white tabular-nums">
          {Math.round(current)}
          <span className="text-xl text-slate-400 ml-1">hPa</span>
        </div>
        {rate != null && (
          <div className={`text-sm mb-1 ${rate < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {rate < 0 ? '▼' : '▲'} {Math.abs(rate).toFixed(1)} hPa/h
          </div>
        )}
      </div>

      {alert && styles && (
        <div className={`text-sm rounded-lg px-3 py-2 ${styles.badge}`}>{alert.label}</div>
      )}

      {sparkData.length > 1 && (
        <div>
          <div className="text-slate-500 text-xs mb-1">±12h</div>
          <PressureSparkline values={sparkData} nowIndex={nowIndex} />
        </div>
      )}
    </div>
  );
}
