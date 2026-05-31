import ConnectedPlatformCard from './ConnectedPlatformCard';
import { Cable } from 'lucide-react';
import useProfile from '../../hooks/useProfile';

export default function ConnectedPlatformsSection() {
  const { connectedPlatforms } = useProfile();

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Cable className="w-5 h-5 text-accent-purple" />
        <h2 className="text-xl font-bold font-heading text-text">Connected Platforms</h2>
      </div>
      
      <p className="text-sm text-text-secondary mb-6 max-w-2xl">
        Here you can view your currently connected social media accounts. Connections are managed at the channel level.
      </p>

      {connectedPlatforms && connectedPlatforms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectedPlatforms.map(platform => (
            <ConnectedPlatformCard key={platform._id} platformKey={platform.platform} connection={platform} />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-border bg-bg-secondary/50 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-text">No platforms connected yet.</p>
          <p className="text-xs text-text-muted mt-2">Connect your platforms from within a channel's settings.</p>
        </div>
      )}
    </div>
  );
}
