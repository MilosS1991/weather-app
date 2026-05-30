import type { SevereEvent } from '../utils/wmo';

interface Props {
  events: SevereEvent[];
}

export function SevereWeatherBanner({ events }: Props) {
  if (events.length === 0) return null;

  const hasHail = events.some(e => e.code === 96 || e.code === 99);
  const first = events[0];
  const extra = events.length - 1;

  const firstTime = new Date(first.time).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const containerCls = hasHail
    ? 'bg-red-500/10 border-red-500/30 text-red-300'
    : 'bg-amber-500/10 border-amber-500/30 text-amber-300';

  return (
    <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${containerCls}`}>
      <span className="text-xl flex-none">⛈️</span>
      <p className="text-sm">
        <span className="font-medium">{first.label}</span>
        {' '}expected at{' '}
        <span className="font-medium tabular-nums">{firstTime}</span>
        {extra > 0 && (
          <span className="opacity-70">
            {' '}· {extra} more affected hour{extra > 1 ? 's' : ''}
          </span>
        )}
      </p>
    </div>
  );
}
