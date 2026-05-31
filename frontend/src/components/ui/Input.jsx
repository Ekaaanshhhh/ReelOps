import { cn } from '../../utils/helpers';

export default function Input({
  label,
  error,
  helper,
  icon: Icon,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        )}
        <input
          type={type}
          className={cn(
            'w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text',
            'placeholder:text-text-muted',
            'focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30',
            'transition-all duration-200',
            Icon && 'pl-10',
            error && 'border-danger focus:border-danger focus:ring-danger/30',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {helper && !error && <p className="text-xs text-text-muted">{helper}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helper,
  className = '',
  containerClassName = '',
  rows = 4,
  ...props
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={cn(
          'w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text resize-none',
          'placeholder:text-text-muted',
          'focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30',
          'transition-all duration-200',
          error && 'border-danger focus:border-danger focus:ring-danger/30',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {helper && !error && <p className="text-xs text-text-muted">{helper}</p>}
    </div>
  );
}
