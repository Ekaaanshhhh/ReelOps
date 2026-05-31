import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileVideo, Filter, Upload, ArrowLeft, CheckCircle, XCircle, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import SubmissionCard from '../../components/submissions/SubmissionCard';
import AutomationApprovalModal from '../../components/automation/AutomationApprovalModal';
import useChannel from '../../hooks/useChannel';
import { submissionAPI } from '../../api/submission.api';
import { STATUS_TYPES, PLATFORMS } from '../../utils/constants';

/**
 * ChannelSubmissions — list all submissions in a channel with filters.
 */
export default function ChannelSubmissions() {
  const { channelId } = useParams();
  const { activeChannel, isOwner } = useChannel();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reject Modal State
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Approve & Schedule Modal State
  const [approvingSubmission, setApprovingSubmission] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  const fetchSubmissions = useCallback(async () => {
    if (!channelId) return;
    setLoading(true);
    try {
      const result = await submissionAPI.getChannelSubmissions(channelId, {
        status: statusFilter,
        platform: platformFilter,
        page,
        limit: 20,
      });
      setSubmissions(result.submissions || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [channelId, statusFilter, platformFilter, page]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleApproveSuccess = () => {
    setApprovingSubmission(null);
    fetchSubmissions();
  };

  const submitReject = async () => {
    if (!rejectingId) return;
    try {
      await submissionAPI.changeStatus(channelId, rejectingId, 'REJECTED', rejectReason);
      toast.success('Submission rejected');
      setRejectingId(null);
      setRejectReason('');
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject submission');
    }
  };

  const handleDelete = async (submissionId) => {
    if (!window.confirm("Are you sure you want to delete this submission? This will also remove the video from storage.")) return;
    try {
      await submissionAPI.deleteChannelSubmission(channelId, submissionId);
      toast.success('Submission deleted');
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete submission');
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.values(STATUS_TYPES).map(s => ({ value: s, label: s.replace('_', ' ') })),
  ];

  const platformOptions = [
    { value: '', label: 'All Platforms' },
    ...PLATFORMS.map(p => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back */}
        <button
          onClick={() => navigate(`/channels/${channelId}`)}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {activeChannel?.name || 'channel'}
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold font-heading text-text">Submissions</h1>
            <p className="text-sm text-text-muted">{total} total submission{total !== 1 ? 's' : ''}</p>
          </div>
          {!isOwner && (
            <button
              onClick={() => navigate(`/channels/${channelId}/upload`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white gradient-bg hover:opacity-90"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-text
                         focus:outline-none focus:border-accent-purple cursor-pointer"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <select
            value={platformFilter}
            onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }}
            className="bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-text
                       focus:outline-none focus:border-accent-purple cursor-pointer"
          >
            {platformOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Submissions list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileVideo className="w-10 h-10 text-text-muted mb-3" />
            <h3 className="text-sm font-medium text-text mb-1">No submissions found</h3>
            <p className="text-xs text-text-muted max-w-sm">
              {statusFilter || platformFilter
                ? 'Try adjusting your filters.'
                : 'Upload your first video to get started.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {submissions.map(sub => (
                <div key={sub._id} className="relative group">
                  <SubmissionCard
                    submission={sub}
                    onClick={() => navigate(`/submissions/${sub._id}`)}
                  />
                  {isOwner && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-bg shadow-lg p-2 rounded-xl border border-border z-10">
                      {sub.status === STATUS_TYPES.PENDING_APPROVAL && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setApprovingSubmission(sub); }}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-success hover:bg-success/10 transition-colors"
                            title="Approve & Schedule"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setRejectingId(sub._id); setRejectReason(''); }}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                            title="Reject Submission"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <div className="w-px h-6 bg-border mx-1"></div>
                        </>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(sub._id); }}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Delete Submission"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-sm text-text-secondary bg-bg-secondary border border-border
                             hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-text-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm text-text-secondary bg-bg-secondary border border-border
                             hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold font-heading text-text">Reject Submission</h3>
                <button
                  onClick={() => { setRejectingId(null); setRejectReason(''); }}
                  className="text-text-muted hover:text-text transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-text-muted mb-4">
                Please provide a reason for rejecting this video (optional). This will be shown to the editor.
              </p>
              <textarea
                autoFocus
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g., Needs more dynamic editing..."
                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-text text-sm
                           focus:outline-none focus:border-danger transition-colors resize-none mb-6"
                rows={3}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setRejectingId(null); setRejectReason(''); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary bg-bg-secondary border border-border hover:bg-card-hover hover:text-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReject}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-danger hover:bg-red-600 transition-colors"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approval & Schedule Modal */}
      <AutomationApprovalModal
        isOpen={!!approvingSubmission}
        onClose={(success) => {
          if (success === true) {
            handleApproveSuccess();
          } else {
            setApprovingSubmission(null);
          }
        }}
        submission={approvingSubmission}
      />
    </div>
  );
}
