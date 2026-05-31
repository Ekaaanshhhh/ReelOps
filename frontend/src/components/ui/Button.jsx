import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

const variants = {
  primary: 'bg-gradient-to-r from-accent-purple to-accent-purple-light text-white shadow-lg shadow-accent-purple/20 hover:shadow-accent-purple/40',
  secondary: 'bg-card border border-border text-text hover:bg-card-hover hover:border-border-light',
  ghost: 'bg-transparent text-text-secondary hover:text-text hover:bg-card',
  danger: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20',
  outline: 'bg-transparent border border-accent-purple/50 text-accent-purple hover:bg-accent-purple/10',
  cyan: 'bg-gradient-to-r from-accent-cyan to-accent-cyan-light text-bg shadow-lg shadow-accent-cyan/20 hover:shadow-accent-cyan/40',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  fullWidth = false,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight className="w-4 h-4" />}
    </motion.button>
  );
}
