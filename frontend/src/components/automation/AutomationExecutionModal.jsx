import Modal from '../ui/Modal';
import { formatDateTime } from '../../utils/helpers';
import { CheckCircle, XCircle, Clock, ExternalLink, Activity } from 'lucide-react';

export default function AutomationExecutionModal({ isOpen, onClose, execution }) {
  if (!execution) return null;

  const isSuccess = execution.status === 'PUBLISHED' || execution.status === 'SUCCESS';
  const statusColor = isSuccess ? 'text-success' : 'text-danger';
  const statusBg = isSuccess ? 'bg-success/10' : 'bg-danger/10';
  const StatusIcon = isSuccess ? CheckCircle : XCircle;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Execution Details">
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-secondary">
          <div className={`w-12 h-12 rounded-full ${statusBg} flex items-center justify-center`}>
            <StatusIcon className={`w-6 h-6 ${statusColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text mb-1">
              {isSuccess ? 'Successfully Published' : 'Execution Failed'}
            </h3>
            <p className="text-sm text-text-muted">
              {formatDateTime(execution.executedAt)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-semibold text-text">Status</span>
              </div>
              <p className={`text-sm font-medium ${statusColor}`}>
                {execution.status}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-semibold text-text">Duration</span>
              </div>
              <p className="text-sm font-medium text-text">
                {execution.executionDurationMs ? `${(execution.executionDurationMs / 1000).toFixed(1)}s` : 'Unknown'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-bg-secondary/50">
            <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">Result Message</p>
            <p className="text-sm text-text whitespace-pre-wrap font-mono bg-bg p-3 rounded-lg border border-border/50">
              {execution.resultMessage || 'No details provided.'}
            </p>
          </div>

          {execution.platformVideoUrl && (
            <div className="p-4 rounded-xl border border-border bg-bg-secondary/50 flex flex-col gap-2">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Platform Video URL</p>
              <a 
                href={execution.platformVideoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-[#FF0000] hover:text-red-400 font-medium flex items-center gap-2 w-fit transition-colors"
              >
                {execution.platformVideoUrl}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {execution.youtubeChannelId && (
            <div className="p-4 rounded-xl border border-border bg-bg-secondary/50 grid grid-cols-2 gap-4">
               <div>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Channel ID</p>
                <p className="text-sm font-mono text-text">{execution.youtubeChannelId}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Privacy Status</p>
                <p className="text-sm font-medium text-text capitalize">{execution.privacyStatus}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
