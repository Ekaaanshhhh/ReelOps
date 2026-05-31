import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, PlaySquare } from 'lucide-react';
import useChannel from '../../hooks/useChannel';
import { ROLE_CONFIG } from '../../utils/constants';
import { platformAPI } from '../../api/platform.api';

import YouTubeConnectionCard from '../../components/platforms/YouTubeConnectionCard';
import ConnectYouTubeButton from '../../components/platforms/ConnectYouTubeButton';

export default function ChannelPlatformsView() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { activeChannel, isOwner } = useChannel();
  
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState(null);
  const [healthData, setHealthData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [platformsRes, healthRes] = await Promise.all([
        platformAPI.getChannelPlatforms(channelId),
        platformAPI.getYouTubeHealth(channelId)
      ]);
      setPlatforms(platformsRes);
      setHealthData(healthRes);
    } catch (err) {
      toast.error('Failed to load platform connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Handle OAuth Callback Query Params
    const youtubeStatus = searchParams.get('youtube');
    if (youtubeStatus) {
      if (youtubeStatus === 'connected') {
        toast.success('YouTube account connected successfully');
      } else if (youtubeStatus === 'error') {
        toast.error('Failed to connect YouTube account');
      }
      // Remove query param from URL without reloading
      navigate(location.pathname + location.hash, { replace: true });
    }

    if (channelId) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, searchParams, navigate, location.pathname, location.hash]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent-purple mb-4" />
        <p className="text-text-muted text-sm animate-pulse">Loading connected platforms...</p>
      </div>
    );
  }

  const isYouTubeConnected = platforms?.youtube?.connected;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h3 className="text-lg font-semibold text-text mb-1">Connected Platforms</h3>
        <p className="text-sm text-text-muted">
          Manage third-party integrations for automated publishing.
        </p>
      </div>

      {!isYouTubeConnected ? (
        // Empty State
        <div className="flex flex-col items-center justify-center p-8 bg-bg-secondary border border-dashed border-border/60 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-card border border-border/50 flex items-center justify-center mb-4">
            <PlaySquare className="w-8 h-8 text-text-muted" />
          </div>
          <h4 className="text-lg font-medium text-text mb-2">No platforms connected yet</h4>
          <p className="text-sm text-text-muted max-w-sm mb-6">
            Connect your YouTube channel to enable future automated publishing directly from ReelOps.
          </p>
          {isOwner ? (
            <ConnectYouTubeButton channelId={channelId} />
          ) : (
            <p className="text-xs text-accent-cyan font-medium px-3 py-1.5 rounded-full bg-accent-cyan/10">
              Only Channel Owners can connect platforms.
            </p>
          )}
        </div>
      ) : (
        // Connected State
        <div className="space-y-6">
          <YouTubeConnectionCard 
            channelId={channelId}
            connectionData={platforms.youtube}
            healthData={healthData}
            isOwner={isOwner}
            onRefresh={fetchData}
          />
          {/* Future platforms like Instagram can drop in here as additional cards */}
        </div>
      )}
    </div>
  );
}
