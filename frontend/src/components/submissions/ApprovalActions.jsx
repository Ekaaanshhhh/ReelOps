import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, MessageSquare, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { submissionAPI } from '../../api/submission.api';
import { getErrorMessage } from '../../utils/helpers';

/**
 * ApprovalActions — Approve/Reject buttons for submission approval workflow.
 * Only rendered for channel OWNERs on PENDING_APPROVAL submissions.
 */
export default function ApprovalActions({ submissionId, onActionComplete, onApproveSuccess }) {
  const [loading, setLoading] = useState(null); // 'approve' | 'reject' | null
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleApprove = () => {
    onApproveSuccess?.();
  };

  const handleReject = async () => {
    setError('');
    setLoading('reject');
    try {
      await submissionAPI.rejectSubmission(submissionId, reason);
      toast.success('Submission rejected');
      onActionComplete?.();
      setShowRejectForm(false);
      setReason('');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {showRejectForm ? (
          <motion.div
            key="reject-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Rejection Reason
              </label>
              <button
                onClick={() => setShowRejectForm(false)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-text transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this submission is being rejected…"
              rows={3}
              className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-xl text-text text-sm
                         placeholder:text-text-muted focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger/30
                         transition-colors resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={loading === 'reject'}
                className="flex-1 py-2 rounded-xl font-medium text-sm text-white bg-danger hover:bg-red-600
                           disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading === 'reject' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Confirm Reject
              </button>
              <button
                onClick={() => setShowRejectForm(false)}
                className="px-4 py-2 rounded-xl text-sm text-text-secondary hover:text-text bg-bg-secondary hover:bg-card-hover transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="action-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            <button
              onClick={handleApprove}
              disabled={loading === 'approve'}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm text-white bg-success hover:bg-emerald-600
                         disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading === 'approve' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Approve
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm text-danger bg-danger/10 hover:bg-danger/20
                         transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
