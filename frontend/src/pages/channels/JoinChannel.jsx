import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Lock, Loader2, ArrowLeft, LogIn } from 'lucide-react';
import { channelAPI } from '../../api/channel.api';
import useChannel from '../../hooks/useChannel';
import { getErrorMessage } from '../../utils/helpers';

/**
 * JoinChannel — full page form for joining a channel via invite code + password.
 */
export default function JoinChannel() {
  const navigate = useNavigate();
  const { fetchChannels } = useChannel();
  const [inviteCode, setInviteCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await channelAPI.joinChannel(inviteCode.trim().toUpperCase(), password);
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
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-text">Join Channel</h1>
              <p className="text-xs text-text-muted">Enter the invite code and password</p>
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
                Invite Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3D4"
                  required
                  maxLength={8}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text text-sm
                             uppercase tracking-widest font-mono
                             placeholder:text-text-muted placeholder:tracking-normal placeholder:font-sans
                             focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30"
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
                  placeholder="Enter channel password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text text-sm
                             placeholder:text-text-muted focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !inviteCode || !password}
              className="w-full py-2.5 rounded-xl font-medium text-sm text-white
                         bg-accent-cyan hover:bg-accent-cyan-dark
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining…
                </>
              ) : (
                'Join Channel'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
