import { useState } from 'react';
import { PlaySquare, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import PlatformStatusBadge from './PlatformStatusBadge';
import PlatformHealthCard from './PlatformHealthCard';
import DisconnectPlatformModal from './DisconnectPlatformModal';
import { platformAPI } from '../../api/platform.api';
import toast from 'react-hot-toast';
import { Loader2, UploadCloud } from 'lucide-react';

export default function YouTubeConnectionCard({ channelId, connectionData, healthData, isOwner, onRefresh }) {
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const [isTestingUpload, setIsTestingUpload] = useState(false);

  const handleTestUpload = async () => {
    try {
      setIsTestingUpload(true);
      const res = await platformAPI.testUploadYouTube(channelId);
      toast.success('Test upload successful!');
      if (res.youtubeUrl) {
        window.open(res.youtubeUrl, '_blank');
      }
      onRefresh(); // Refresh health stats
    } catch (err) {
      toast.error(err.response?.data?.message || 'Test upload failed');
    } finally {
      setIsTestingUpload(false);
    }
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <PlaySquare className="w-6 h-6 text-[#FF0000]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-text">YouTube</h3>
                <PlatformStatusBadge status={connectionData.oauthStatus || 'CONNECTED'} />
              </div>
              <p className="text-sm text-text-secondary">
                Publish videos automatically to your YouTube channel.
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestUpload}
                disabled={isTestingUpload || connectionData.oauthStatus !== 'CONNECTED'}
                className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-accent-purple hover:bg-accent-purple-hover rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingUpload ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                Test Upload
              </button>
              <button
                onClick={() => setIsDisconnectOpen(true)}
                className="px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 rounded-xl transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center mt-1">
              <User className="w-4 h-4 text-text-muted" />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Connected Account</p>
              <p className="text-sm font-medium text-text">{connectionData.googleAccountName}</p>
              <p className="text-sm text-text-secondary">{connectionData.googleAccountEmail}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center mt-1">
              <PlaySquare className="w-4 h-4 text-text-muted" />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Target Channel</p>
              <p className="text-sm font-medium text-text">{connectionData.channelName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center mt-1">
              <Calendar className="w-4 h-4 text-text-muted" />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Connected At</p>
              <p className="text-sm font-medium text-text">
                {format(new Date(connectionData.connectedAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        </div>

        <PlatformHealthCard healthData={healthData} />
      </div>

      <DisconnectPlatformModal
        isOpen={isDisconnectOpen}
        onClose={() => setIsDisconnectOpen(false)}
        channelId={channelId}
        onRefresh={onRefresh}
      />
    </div>
  );
}
