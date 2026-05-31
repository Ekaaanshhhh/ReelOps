import { useState } from 'react';
import { Loader2, PlaySquare } from 'lucide-react';
import { platformAPI } from '../../api/platform.api';
import toast from 'react-hot-toast';

export default function ConnectYouTubeButton({ channelId }) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const res = await platformAPI.connectYouTube(channelId);
      if (res.success && res.url) {
        // Redirect browser to Google OAuth consent screen
        window.location.href = res.url;
      } else {
        toast.error('Failed to initiate YouTube connection');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Could not connect to YouTube');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-[#282828] font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-[#FF0000]" />
      ) : (
        <PlaySquare className="w-4 h-4 text-[#FF0000]" />
      )}
      Connect YouTube
    </button>
  );
}
