import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { platformAPI } from '../../api/platform.api';
import toast from 'react-hot-toast';

export default function DisconnectPlatformModal({ isOpen, onClose, channelId, onRefresh }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await platformAPI.disconnectYouTube(channelId);
      toast.success('YouTube disconnected successfully');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error('Failed to disconnect YouTube');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={loading ? undefined : onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-text mb-2">Disconnect YouTube?</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Disconnecting YouTube will prevent future automated publishing for this channel. 
                  Any scheduled automations currently using this platform will fail.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-bg-secondary rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-danger hover:bg-danger-hover rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Disconnect
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
