import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LogIn, Hash, Zap } from 'lucide-react';
import useChannel from '../../hooks/useChannel';
import ChannelCard from '../../components/channels/ChannelCard';
import CreateChannelModal from '../../components/channels/CreateChannelModal';
import JoinChannelModal from '../../components/channels/JoinChannelModal';

/**
 * ChannelsPage — main landing after login.
 * Shows grid of joined channels + create/join actions.
 */
export default function ChannelsPage() {
  const { channels, fetchChannels, loading } = useChannel();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleChannelCreated = () => {
    fetchChannels();
  };

  const handleChannelJoined = () => {
    fetchChannels();
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text">My Channels</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {channels.length} channel{channels.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       text-text-secondary bg-bg-secondary border border-border
                       hover:bg-card-hover hover:text-text transition-all"
          >
            <LogIn className="w-4 h-4" />
            Join
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       text-white gradient-bg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Channel Grid */}
      {loading && channels.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      ) : channels.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-accent-purple" />
          </div>
          <h3 className="text-lg font-semibold text-text mb-1">No channels yet</h3>
          <p className="text-sm text-text-muted max-w-sm mb-6">
            Create your first channel to start collaborating on content, or join an existing one with an invite code.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white gradient-bg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Create Channel
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                         text-text-secondary bg-bg-secondary border border-border hover:bg-card-hover hover:text-text"
            >
              <LogIn className="w-4 h-4" />
              Join Channel
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {channels.map((ch) => (
            <motion.div key={ch.channel?._id || ch._id} variants={item}>
              <ChannelCard
                channel={ch.channel || ch}
                role={ch.role}
                joinedAt={ch.joinedAt}
                onClick={() => navigate(`/channels/${ch.channel?._id || ch._id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modals */}
      <CreateChannelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleChannelCreated}
      />
      <JoinChannelModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={handleChannelJoined}
      />
    </div>
  );
}
