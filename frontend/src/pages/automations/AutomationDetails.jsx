import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  PlayCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Cpu,
  User,
  Sparkles,
  Hash,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { automationAPI } from '../../api/automation.api';
import useChannel from '../../hooks/useChannel';
import { formatDateTime, timeAgo, getErrorMessage } from '../../utils/helpers';
import { PLATFORMS } from '../../utils/constants';
import ExecutionTimeline from '../../components/automation/ExecutionTimeline';

// ── Automation status config ────────────────────────────────────────
const AUTOMATION_STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    icon: Clock,
    pulse: false,
  },
  RUNNING: {
    label: 'Running',
    color: '#06B6D4',
    bg: 'rgba(6, 182, 212, 0.12)',
    icon: Loader2,
    pulse: true,
  },
  COMPLETED: {
    label: 'Completed',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
    icon: CheckCircle2,
    pulse: false,
  },
  FAILED: {
    label: 'Failed',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    icon: XCircle,
    pulse: false,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.12)',
    icon: AlertCircle,
    pulse: false,
  },
};

// ── Execution status badge ──────────────────────────────────────────
const EXEC_STATUS = {
  SUCCESS: { label: 'Success', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  PUBLISHED: { label: 'Published', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  QUEUED: { label: 'Queued', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.12)' },
  DOWNLOADING: { label: 'Downloading', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  UPLOADING: { label: 'Uploading', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  FAILED: { label: 'Failed', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' },
};

export default function AutomationDetails() {
  const { channelId, automationId } = useParams();
  const { activeChannel } = useChannel();

  const [automation, setAutomation] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [execLoading, setExecLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch automation from channel list ───────────────────────────
  const fetchAutomation = useCallback(async () => {
    try {
      const result = await automationAPI.getChannelAutomations(channelId);
      const found = (result.automations || []).find((a) => a._id === automationId);
      if (found) {
        setAutomation(found);
      } else {
        setError('Automation not found in this channel.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [channelId, automationId]);

  // ── Fetch execution history ──────────────────────────────────────
  const fetchExecutions = useCallback(async () => {
    try {
      const result = await automationAPI.getExecutionHistory(automationId);
      setExecutions(result.executions || []);
    } catch (err) {
      console.error('Failed to fetch executions:', err);
    } finally {
      setExecLoading(false);
    }
  }, [automationId]);

  // ── Manual refresh ───────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAutomation(), fetchExecutions()]);
    setRefreshing(false);
  };

  // ── Initial load ─────────────────────────────────────────────────
  useEffect(() => {
    fetchAutomation();
    fetchExecutions();
  }, [fetchAutomation, fetchExecutions]);

  // ── Auto-refresh every 15s when PENDING or RUNNING ───────────────
  useEffect(() => {
    if (!automation) return;
    const isActive = automation.status === 'PENDING' || automation.status === 'RUNNING';
    if (!isActive) return;

    const interval = setInterval(() => {
      fetchAutomation();
      fetchExecutions();
    }, 15000);

    return () => clearInterval(interval);
  }, [automation, fetchAutomation, fetchExecutions]);

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-border" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-text-muted">Loading automation...</p>
        </motion.div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          to={`/channels/${channelId}/automations`}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Automations
        </Link>
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <p className="text-danger text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // ── Resolve data ─────────────────────────────────────────────────
  const platform = PLATFORMS.find((p) => p.id === automation.platform);
  const statusConfig = AUTOMATION_STATUS_CONFIG[automation.status] || AUTOMATION_STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;
  const latestExecution = executions.length > 0 ? executions[0] : null;
  const isActive = automation.status === 'PENDING' || automation.status === 'RUNNING';

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link
              to={`/channels/${channelId}/automations`}
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {activeChannel?.name || 'Channel'} / Automations
            </Link>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-text">
                {automation.submission?.title || 'Automation Details'}
              </h1>
            </div>

            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-text-muted font-mono flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {automation._id.slice(-8)}
              </span>
              <span className="text-text-muted">·</span>
              <span className="text-xs text-text-secondary">
                Created {timeAgo(automation.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-bg-secondary border border-border hover:border-border-light transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-text-secondary ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Status badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ color: statusConfig.color, backgroundColor: statusConfig.bg }}
            >
              <StatusIcon
                className={`w-4 h-4 ${statusConfig.pulse ? 'animate-spin' : ''}`}
              />
              {statusConfig.label}
              {isActive && (
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: statusConfig.color }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Main Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-8">
          {/* Left Column: Submission Info (3 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 bg-card border border-border rounded-2xl overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="relative w-full aspect-video bg-bg-secondary">
              {automation.submission?.thumbnailUrl ? (
                <img
                  src={automation.submission.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-text-muted/40" />
                </div>
              )}
              {automation.submission?.videoUrl && (
                <a
                  href={automation.submission.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-black/80 transition-colors backdrop-blur-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Video
                </a>
              )}
              {/* Platform pill overlay */}
              {platform && (
                <div
                  className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm"
                  style={{
                    backgroundColor: `${platform.color}20`,
                    color: platform.color,
                    border: `1px solid ${platform.color}30`,
                  }}
                >
                  {platform.name}
                </div>
              )}
            </div>

            {/* Info grid */}
            <div className="p-5">
              <h2 className="text-lg font-bold text-text mb-4">Submission Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Scheduled Time"
                  value={formatDateTime(automation.scheduledAt)}
                  accent="#3B82F6"
                />
                <InfoItem
                  icon={automation.scheduleSource === 'AI' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  label="Schedule Source"
                  value={automation.scheduleSource === 'AI' ? 'AI Recommendation' : 'Manual (Owner)'}
                  accent={automation.scheduleSource === 'AI' ? '#8B5CF6' : '#06B6D4'}
                />
                <InfoItem
                  icon={<Cpu className="w-4 h-4" />}
                  label="Platform"
                  value={platform?.name || automation.platform}
                  accent={platform?.color || '#7C3AED'}
                />
                <InfoItem
                  icon={<User className="w-4 h-4" />}
                  label="Created By"
                  value={automation.createdBy?.name || 'Unknown'}
                  accent="#06B6D4"
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column: Execution Timeline (2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-accent-purple" />
                Execution Pipeline
              </h2>
              {isActive && (
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-accent-cyan/15 text-accent-cyan animate-pulse">
                  Live
                </span>
              )}
            </div>

            <ExecutionTimeline
              automation={automation}
              latestExecution={latestExecution}
            />
          </motion.div>
        </div>

        {/* ── Execution History Table ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-accent-purple" />
              Execution History
            </h2>
            <span className="text-xs text-text-muted font-mono">
              {executions.length} run{executions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {execLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-accent-purple" />
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-10 h-10 text-text-muted/40 mx-auto mb-3" />
              <p className="text-sm text-text-muted">
                No executions yet. The scheduler will run this automation when it's due.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {executions.map((exec, i) => {
                const execStatus = EXEC_STATUS[exec.status] || EXEC_STATUS.FAILED;
                return (
                  <motion.div
                    key={exec._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-card-hover/50 transition-colors"
                  >
                    {/* Run number + status */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-text-muted font-mono w-8 flex-shrink-0">
                        #{executions.length - i}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ color: execStatus.color, backgroundColor: execStatus.bg }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: execStatus.color }}
                        />
                        {execStatus.label}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-text-secondary truncate flex-1 min-w-0">
                      {exec.resultMessage || '—'}
                    </p>

                    {/* Timestamp */}
                    <span className="text-xs text-text-muted font-mono flex-shrink-0">
                      {formatDateTime(exec.executedAt)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── InfoItem sub-component ──────────────────────────────────────────
function InfoItem({ icon, label, value, accent }) {
  return (
    <div className="bg-bg-secondary/50 rounded-xl p-3.5 border border-border/50">
      <div className="flex items-center gap-2 mb-1.5">
        <span style={{ color: accent }}>{icon}</span>
        <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold text-text">{value}</p>
    </div>
  );
}
