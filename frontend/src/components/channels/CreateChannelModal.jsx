import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { channelAPI } from '../../api/channel.api';
import { getErrorMessage } from '../../utils/helpers';

/**
 * CreateChannelModal — modal form for creating a new channel.
 */
export default function CreateChannelModal({ isOpen, onClose, onSuccess }) {
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
      toast.success('Channel created!');
      onSuccess?.(result);
      setName('');
      setPassword('');
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-text font-heading">
                Create Channel
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

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
                             placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30
                             transition-colors"
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
                             placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30
                             transition-colors"
                />
              </div>
              <p className="text-xs text-text-muted mt-1.5">
                Members will need this password + invite code to join.
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
