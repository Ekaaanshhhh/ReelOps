import { useState } from 'react';
import { PlaySquare, Camera, Music, Link2, Unlink, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import PlatformStatusBadge from './PlatformStatusBadge';
import useProfile from '../../hooks/useProfile';

const PLATFORM_CONFIG = {
  YOUTUBE: {
    icon: PlaySquare,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    name: 'YouTube',
    desc: 'Automate shorts publishing',
  },
  INSTAGRAM: {
    icon: Camera,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    name: 'Instagram',
    desc: 'Auto-publish to Reels',
  },
};

export default function ConnectedPlatformCard({ platformKey, connection }) {
  const config = PLATFORM_CONFIG[platformKey] || {
    icon: PlaySquare,
    color: 'text-gray-500',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/20',
    name: platformKey,
    desc: 'Connected Platform',
  };
  const { disconnectPlatform } = useProfile();
  
  const [loading, setLoading] = useState(false);

  const isConnected = connection?.isConnected;
  const isPending = connection && !isConnected;

  const Icon = config.icon;

  const handleConnect = async () => {
    setLoading(true);
    try {
      await connectPlatform(platformKey);
      toast.success(`${config.name} connection initiated`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to connect ${config.name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm(`Disconnect ${config.name}? You will need to re-authenticate.`)) return;
    setLoading(true);
    try {
      await disconnectPlatform(connection._id);
      toast.success(`${config.name} disconnected`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to disconnect ${config.name}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 hover:border-text-muted/30 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color} ${config.border} border`}>
          <Icon className="w-5 h-5" />
        </div>
        <PlatformStatusBadge isConnected={isConnected} />
      </div>

      <div>
        <h3 className="text-base font-semibold text-text mb-1">{config.name}</h3>
        <p className="text-xs text-text-muted mb-4">{config.desc}</p>
      </div>

      <div className="pt-4 border-t border-border flex items-center">
        {connection ? (
          <div className="flex-1 min-w-0">
            {isConnected ? (
              <span className="text-sm font-medium text-text block truncate">
                @{connection.username || 'Connected Account'}
                {connection.channelName && (
                  <span className="text-xs text-text-muted ml-2 font-normal">
                    (in {connection.channelName})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-xs text-text-muted italic flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Auth Pending...
              </span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
