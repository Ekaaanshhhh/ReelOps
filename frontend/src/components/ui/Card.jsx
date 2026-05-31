import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

export default function Card({
  children,
  className = '',
  hover = true,
  padding = 'md',
  glow = false,
  ...props
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-card border border-border rounded-2xl transition-all duration-200',
        hover && 'hover:border-border-light hover:shadow-lg hover:shadow-black/20',
        glow && 'glow-purple',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
