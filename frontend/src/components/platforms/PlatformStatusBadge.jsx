import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export default function PlatformStatusBadge({ status }) {
  let colorClass = '';
  let bgColorClass = '';
  let Icon = HelpCircle;
  let label = status || 'UNKNOWN';

  switch (status) {
    case 'CONNECTED':
      colorClass = 'text-accent-cyan';
      bgColorClass = 'bg-accent-cyan/10 border-accent-cyan/20';
      Icon = CheckCircle2;
      break;
    case 'EXPIRED':
      colorClass = 'text-yellow-500';
      bgColorClass = 'bg-yellow-500/10 border-yellow-500/20';
      Icon = AlertTriangle;
      break;
    case 'ERROR':
      colorClass = 'text-danger';
      bgColorClass = 'bg-danger/10 border-danger/20';
      Icon = XCircle;
      break;
    case 'DISCONNECTED':
    default:
      colorClass = 'text-text-muted';
      bgColorClass = 'bg-bg-secondary border-border';
      Icon = XCircle;
      label = 'DISCONNECTED';
      break;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${bgColorClass} ${colorClass} text-xs font-semibold tracking-wide`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}
