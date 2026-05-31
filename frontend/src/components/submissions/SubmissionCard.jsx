import { motion } from 'framer-motion';
import { FileVideo, Clock, User, ChevronRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { PLATFORMS, STATUS_TYPES } from '../../utils/constants';
import { timeAgo, truncate, formatDateTime } from '../../utils/helpers';

/**
 * SubmissionCard — displays a submission with status, metadata, and platform info.
 */
export default function SubmissionCard({ submission, onClick }) {
  const platform = PLATFORMS.find(
    (p) => p.id === submission?.platform
  );

  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      onClick={() => onClick?.(submission)}
      className="group bg-card border border-border rounded-xl p-4 cursor-pointer
                 transition-all duration-200 hover:border-border-light hover:shadow-md hover:shadow-black/10"
    >
      <div className="flex items-start gap-4">
        {/* Video thumbnail placeholder */}
        <div className="w-20 h-14 rounded-lg bg-bg-secondary border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
          {submission?.thumbnailUrl ? (
            <img
              src={submission.thumbnailUrl}
              alt={submission.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileVideo className="w-5 h-5 text-text-muted" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="text-sm font-medium text-text truncate group-hover:text-accent-purple-light transition-colors">
              {submission?.title || 'Untitled'}
            </h4>
            <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {submission?.description && (
            <p className="text-xs text-text-muted mb-2 line-clamp-1">
              {truncate(submission.description, 80)}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={submission?.status} size="xs" />

            {platform && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  color: platform.color,
                  backgroundColor: `${platform.color}15`,
                }}
              >
                {platform.name}
              </span>
            )}

            <span className="flex items-center gap-1 text-[10px] text-text-muted">
              <User className="w-3 h-3" />
              {submission?.uploadedBy?.name || 'Unknown'}
            </span>

            <span className="flex items-center gap-1 text-[10px] text-text-muted">
              <Clock className="w-3 h-3" />
              {timeAgo(submission?.createdAt)}
            </span>

            {submission?.status === STATUS_TYPES.SCHEDULED && submission?.scheduledTime && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                {formatDateTime(submission.scheduledTime)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
