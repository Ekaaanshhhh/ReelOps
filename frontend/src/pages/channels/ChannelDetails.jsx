import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hash, Users, FileVideo, Upload, Clock, CheckCircle,
  XCircle, ArrowRight, Crown,
} from 'lucide-react';
import useChannel from '../../hooks/useChannel';
import useAuth from '../../hooks/useAuth';
import InviteCodeDisplay from '../../components/channels/InviteCodeDisplay';
import MemberList from '../../components/channels/MemberList';
import SubmissionCard from '../../components/submissions/SubmissionCard';
import { submissionAPI } from '../../api/submission.api';
import { STATUS_TYPES } from '../../utils/constants';

/**
 * ChannelDetails — the main workspace view when inside a channel.
 * Shows overview: channel info, invite code, members preview, recent submissions.
 */
export default function ChannelDetails() {
  const { channelId } = useParams();
  const { activeChannel, members, isOwner, loading: channelLoading } = useChannel();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [subLoading, setSubLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!channelId) return;
      setSubLoading(true);
      try {
        const result = await submissionAPI.getChannelSubmissions(channelId, { limit: 5 });
        setSubmissions(result.submissions || []);
        setStats({
          total: result.total || 0,
          pending: (result.submissions || []).filter(s => s.status === STATUS_TYPES.PENDING_APPROVAL).length,
          approved: (result.submissions || []).filter(s => s.status === STATUS_TYPES.APPROVED).length,
          rejected: (result.submissions || []).filter(s => s.status === STATUS_TYPES.REJECTED).length,
        });
      } catch {
        setSubmissions([]);
      } finally {
        setSubLoading(false);
      }
    };
    fetchSubmissions();
  }, [channelId]);

  if (channelLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!activeChannel) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-text-muted">Channel not found.</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Submissions', value: stats.total, icon: FileVideo, color: 'text-accent-purple' },
    { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-warning' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-success' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Channel header card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
              <Hash className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-text">{activeChannel.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </span>
                {isOwner && (
                  <span className="flex items-center gap-1 text-accent-purple">
                    <Crown className="w-3.5 h-3.5" />
                    You're the owner
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isOwner && (
              <button
                onClick={() => navigate(`/channels/${channelId}/upload`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white gradient-bg hover:opacity-90"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            )}
            <button
              onClick={() => navigate(`/channels/${channelId}/submissions`)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                isOwner 
                  ? 'text-white bg-accent-purple border-accent-purple hover:bg-accent-purple-light'
                  : 'text-text-secondary bg-bg-secondary border-border hover:bg-card-hover hover:text-text'
              }`}
            >
              {isOwner ? <CheckCircle className="w-4 h-4" /> : <FileVideo className="w-4 h-4" />}
              {isOwner ? 'Review Submissions' : 'All Submissions'}
            </button>
          </div>
        </div>

        {/* Invite code — owner only */}
        {isOwner && activeChannel.inviteCode && (
          <div className="mt-5 pt-5 border-t border-border">
            <InviteCodeDisplay inviteCode={activeChannel.inviteCode} />
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold font-heading text-text">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Two columns: Members + Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text flex items-center gap-2">
              <Users className="w-4 h-4 text-text-muted" />
              Members
            </h3>
            <span className="text-xs text-text-muted">{members.length}</span>
          </div>
          <MemberList members={members} currentUserId={user?._id} />
        </motion.div>

        {/* Recent Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text flex items-center gap-2">
              <FileVideo className="w-4 h-4 text-text-muted" />
              Recent Submissions
            </h3>
            <button
              onClick={() => navigate(`/channels/${channelId}/submissions`)}
              className="text-xs text-accent-purple hover:text-accent-purple-light flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {subLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <FileVideo className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">No submissions yet</p>
              <button
                onClick={() => navigate(`/channels/${channelId}/upload`)}
                className="mt-2 text-xs text-accent-purple hover:text-accent-purple-light transition-colors"
              >
                Upload your first video →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map(sub => (
                <SubmissionCard
                  key={sub._id}
                  submission={sub}
                  onClick={() => navigate(`/submissions/${sub._id}`)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
