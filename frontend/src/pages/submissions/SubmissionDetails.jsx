import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileVideo, User, Clock, Hash, Trash2,
  Edit3, Loader2, ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/ui/StatusBadge';
import ApprovalActions from '../../components/submissions/ApprovalActions';
import AutomationApprovalModal from '../../components/automation/AutomationApprovalModal';
import { submissionAPI } from '../../api/submission.api';
import { PLATFORMS, STATUS_TYPES } from '../../utils/constants';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import useChannel from '../../hooks/useChannel';
import useAuth from '../../hooks/useAuth';

/**
 * SubmissionDetails — full detail view of a single submission.
 * Shows video, metadata, status, and approval actions (OWNER only, PENDING_APPROVAL only).
 */
export default function SubmissionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOwner, activeChannel, setActiveChannel } = useChannel();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showAutomationModal, setShowAutomationModal] = useState(false);

  const fetchSubmission = useCallback(async () => {
    setLoading(true);
    try {
      const result = await submissionAPI.getSubmissionById(id);
      setSubmission(result.submission);
      
      // Since this route (/submissions/:id) doesn't have :channelId in the URL,
      // we must manually set the active channel so ChannelContext can determine isOwner.
      const fetchedChannelId = result.submission?.channel?._id || result.submission?.channel;
      if (fetchedChannelId) {
        setActiveChannel(fetchedChannelId);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, user?._id]); // Add user._id to deps

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    setDeleting(true);
    try {
      await submissionAPI.deleteSubmission(id);
      toast.success('Submission deleted');
      const channelId = submission?.channel?._id || submission?.channel;
      navigate(channelId ? `/channels/${channelId}/submissions` : '/channels');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      setDeleting(false);
    }
  };

  const platform = PLATFORMS.find(p => p.id === submission?.platform);
  const isUploader = submission?.uploadedBy?._id === user?._id;
  const canDelete = isUploader || isOwner;
  const showApproval = isOwner && submission?.status === STATUS_TYPES.PENDING_APPROVAL;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-danger mb-2">{error}</p>
        <button onClick={() => navigate(-1)} className="text-sm text-accent-purple hover:underline">
          Go back
        </button>
      </div>
    );
  }

  if (!submission) return null;

  const channelId = submission?.channel?._id || submission?.channel;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back */}
        <button
          onClick={() => navigate(channelId ? `/channels/${channelId}/submissions` : -1)}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to submissions
        </button>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Video section */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-5">
          <div className="aspect-video bg-bg-secondary flex items-center justify-center">
            {submission.videoUrl ? (
              <video
                src={submission.videoUrl}
                controls
                className="w-full h-full object-contain"
                poster={submission.thumbnailUrl || undefined}
              />
            ) : (
              <FileVideo className="w-12 h-12 text-text-muted" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          {/* Title + Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold font-heading text-text mb-2">
                {submission.title}
              </h1>
              <StatusBadge status={submission.status} size="md" />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {submission.videoUrl && (
                <a
                  href={submission.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-bg-secondary transition-colors"
                  title="Open video"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                  title="Delete submission"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {submission.description && (
            <div>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Description</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{submission.description}</p>
            </div>
          )}

          {/* Rejection reason */}
          {submission.status === STATUS_TYPES.REJECTED && submission.rejectionReason && (
            <div className="px-4 py-3 rounded-xl bg-danger/5 border border-danger/10">
              <h3 className="text-xs font-medium text-danger uppercase tracking-wider mb-1">Rejection Reason</h3>
              <p className="text-sm text-text-secondary">{submission.rejectionReason}</p>
            </div>
          )}

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Platform</span>
              <div className="flex items-center gap-1.5 mt-1">
                {platform && (
                  <span className="text-sm font-medium" style={{ color: platform.color }}>
                    {platform.name}
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Channel</span>
              <p className="text-sm text-text mt-1 flex items-center gap-1">
                <Hash className="w-3 h-3 text-text-muted" />
                {submission.channel?.name || 'Unknown'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Uploaded By</span>
              <p className="text-sm text-text mt-1 flex items-center gap-1">
                <User className="w-3 h-3 text-text-muted" />
                {submission.uploadedBy?.name || 'Unknown'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Uploaded At</span>
              <p className="text-sm text-text mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-text-muted" />
                {formatDateTime(submission.createdAt)}
              </p>
            </div>
            {submission.approvedBy && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Approved By</span>
                <p className="text-sm text-text mt-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-text-muted" />
                  {submission.approvedBy.name || 'Unknown'}
                </p>
              </div>
            )}
          </div>

          {/* Approval actions */}
          {showApproval && (
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-text mb-3">Approval Decision</h3>
              <ApprovalActions
                submissionId={submission._id}
                onActionComplete={fetchSubmission}
                onApproveSuccess={() => setShowAutomationModal(true)}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Automation Modal */}
      <AutomationApprovalModal
        isOpen={showAutomationModal}
        onClose={(success) => {
          setShowAutomationModal(false);
          if (success === true) fetchSubmission();
        }}
        submission={submission}
      />
    </div>
  );
}
