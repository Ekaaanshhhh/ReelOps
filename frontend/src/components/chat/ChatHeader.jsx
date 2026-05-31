import { Hash } from 'lucide-react';

export default function ChatHeader({ channelName, memberCount }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-secondary shrink-0">
      <div className="flex items-center gap-3">
        <Hash className="w-5 h-5 text-text-muted" />
        <h2 className="text-lg font-semibold text-text">{channelName || 'Loading...'}</h2>
      </div>
      {memberCount !== undefined && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
          <span>{memberCount} members</span>
        </div>
      )}
    </div>
  );
}
