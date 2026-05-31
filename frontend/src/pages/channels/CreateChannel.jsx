import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { channelAPI } from '../../api/channel.api';
import useChannel from '../../hooks/useChannel';
import { getErrorMessage } from '../../utils/helpers';

/**
 * CreateChannel — full page form for creating a new channel.
 */
export default function CreateChannel() {
  const navigate = useNavigate();
  const { fetchChannels } = useChannel();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await channelAPI.createChannel(name, password);
      await fetchChannels();
      navigate(`/channels/${result.channel._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/channels')}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to channels
        </button>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-text">Create Channel</h1>
              <p className="text-xs text-text-muted">You'll become the owner of this channel</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Channel Name
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Content Team"
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text text-sm
                             placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Channel Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set a password for joining"
                  required
                  minLength={4}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text text-sm
                             placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30"
                />
              </div>
              <p className="text-xs text-text-muted mt-1.5">
                Members will need this password + invite code to join your channel.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !name || !password}
              className="w-full py-2.5 rounded-xl font-medium text-sm text-white gradient-bg
                         hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-opacity flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Channel'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
