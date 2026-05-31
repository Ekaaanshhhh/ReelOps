import { motion } from 'framer-motion';
import { Users, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import useChannel from '../../hooks/useChannel';
import useAuth from '../../hooks/useAuth';
import MemberList from '../../components/channels/MemberList';
import InviteCodeDisplay from '../../components/channels/InviteCodeDisplay';

/**
 * ChannelMembers — full page view of all channel members.
 */
export default function ChannelMembers() {
  const { channelId } = useParams();
  const { activeChannel, members, isOwner, loading } = useChannel();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back */}
        <button
          onClick={() => navigate(`/channels/${channelId}`)}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {activeChannel?.name || 'channel'}
        </button>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-text-muted" />
              <h1 className="text-xl font-bold font-heading text-text">Members</h1>
            </div>
            <span className="text-sm text-text-muted">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Invite code (owner only) */}
          {isOwner && activeChannel?.inviteCode && (
            <div className="mb-5">
              <InviteCodeDisplay inviteCode={activeChannel.inviteCode} />
            </div>
          )}

          <MemberList members={members} currentUserId={user?._id} />
        </div>
      </motion.div>
    </div>
  );
}
