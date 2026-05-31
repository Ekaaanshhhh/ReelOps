import { STATUS_CONFIG } from '../../utils/constants';

/**
 * StatusBadge — displays a submission status with color-coded styling.
 * Aligned with backend statuses: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, POSTED
 */
export default function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.15)',
  };

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
