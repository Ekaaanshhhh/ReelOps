import { motion } from 'framer-motion';
import {
  Plus,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Mail,
  Loader2,
} from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

/**
 * Derive timeline steps from automation + execution data.
 * Each step: { label, description, icon, iconColor, timestamp, status }
 * status: 'completed' | 'active' | 'pending'
 */
function deriveSteps(automation, latestExecution) {
  const status = automation?.status;
  const hasExecution = !!latestExecution;
  const isCompleted = status === 'COMPLETED';
  const isFailed = status === 'FAILED';
  const isRunning = status === 'RUNNING';
  const isDone = isCompleted || isFailed;

  return [
    {
      label: 'Automation Created',
      description: 'Automation was created and queued',
      icon: Plus,
      iconColor: '#7C3AED',
      timestamp: automation?.createdAt,
      status: 'completed',
    },
    {
      label: 'Scheduled',
      description: `Scheduled for ${formatDateTime(automation?.scheduledAt)}`,
      icon: Clock,
      iconColor: '#3B82F6',
      timestamp: automation?.scheduledAt,
      status: 'completed',
    },
    {
      label: 'Execution Started',
      description: isRunning
        ? 'Job is currently running...'
        : isDone
        ? 'Scheduler picked up the job'
        : 'Waiting for scheduled time',
      icon: isRunning ? Loader2 : Play,
      iconColor: '#06B6D4',
      timestamp: hasExecution ? latestExecution.executedAt : null,
      status: isRunning ? 'active' : isDone ? 'completed' : 'pending',
    },
    {
      label: isDone
        ? isFailed
          ? 'Execution Failed'
          : 'Execution Completed'
        : 'Execution Completed',
      description: hasExecution
        ? latestExecution.resultMessage || (isFailed ? 'An error occurred' : 'Completed successfully')
        : 'Awaiting execution',
      icon: isFailed ? XCircle : CheckCircle,
      iconColor: isFailed ? '#EF4444' : '#10B981',
      timestamp: isDone ? automation?.updatedAt : null,
      status: isDone ? 'completed' : 'pending',
    },
    {
      label: 'Email Notification Sent',
      description: isDone
        ? 'Channel owners have been notified'
        : 'Will be sent after execution',
      icon: Mail,
      iconColor: '#8B5CF6',
      timestamp: isDone ? automation?.updatedAt : null,
      status: isDone ? 'completed' : 'pending',
    },
  ];
}

const stepVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
};

/**
 * ExecutionTimeline — GitHub Actions-style vertical stepper.
 *
 * @param {{ automation: object, latestExecution: object | null }} props
 */
export default function ExecutionTimeline({ automation, latestExecution }) {
  const steps = deriveSteps(automation, latestExecution);

  return (
    <div className="relative">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const StepIcon = step.icon;
        const isActive = step.status === 'active';
        const isPending = step.status === 'pending';

        return (
          <motion.div
            key={step.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={stepVariants}
            className="flex gap-4 relative"
          >
            {/* Connector line + dot */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isActive
                    ? 'ring-4 ring-accent-cyan/30'
                    : ''
                }`}
                style={{
                  backgroundColor: isPending
                    ? 'rgba(107, 114, 128, 0.2)'
                    : `${step.iconColor}20`,
                  boxShadow: isActive
                    ? `0 0 16px ${step.iconColor}40`
                    : 'none',
                }}
              >
                <StepIcon
                  className={`w-4 h-4 ${
                    isActive ? 'animate-spin' : ''
                  }`}
                  style={{
                    color: isPending ? '#4B5563' : step.iconColor,
                  }}
                />
                {/* Active pulse ring */}
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{
                      backgroundColor: `${step.iconColor}15`,
                    }}
                  />
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[32px] my-1 transition-colors duration-300 ${
                    isPending
                      ? 'border-l-2 border-dashed border-border-light bg-transparent w-0'
                      : ''
                  }`}
                  style={
                    !isPending
                      ? { backgroundColor: `${step.iconColor}40` }
                      : {}
                  }
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 ${isLast ? 'pb-0' : ''} flex-1 min-w-0`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm font-semibold ${
                    isPending ? 'text-text-muted' : 'text-text'
                  }`}
                >
                  {step.label}
                </span>
                {step.timestamp && (
                  <span className="text-xs text-text-muted font-mono">
                    {new Date(step.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                )}
                {isActive && (
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-accent-cyan/15 text-accent-cyan">
                    In Progress
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  isPending ? 'text-text-muted/60' : 'text-text-secondary'
                }`}
              >
                {step.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
