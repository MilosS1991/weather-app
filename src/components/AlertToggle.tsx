import type { UsePressureAlertsResult } from '../hooks/usePressureAlerts';

type Props = Pick<UsePressureAlertsResult, 'supported' | 'permission' | 'requestPermission'>;

const CONFIG: Record<NotificationPermission, { icon: string; label: string; className: string }> = {
  default: {
    icon: '🔔',
    label: 'Enable pressure alerts',
    className: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer',
  },
  granted: {
    icon: '🔔',
    label: 'Pressure alerts on',
    className: 'text-emerald-400 bg-emerald-400/10',
  },
  denied: {
    icon: '🔕',
    label: 'Notifications blocked',
    className: 'text-slate-600 cursor-not-allowed',
  },
};

export function AlertToggle({ supported, permission, requestPermission }: Props) {
  if (!supported) return null;

  const { icon, label, className } = CONFIG[permission];

  return (
    <button
      onClick={permission === 'default' ? () => void requestPermission() : undefined}
      disabled={permission !== 'default'}
      title={label}
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${className}`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
