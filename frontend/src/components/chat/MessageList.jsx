import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

export default function MessageList({ messages, isLoading }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-end p-6 space-y-6 overflow-y-auto">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-surface-elevated shrink-0" />
            <div className="space-y-2 flex-1 max-w-sm">
              <div className="h-4 bg-surface-elevated rounded w-1/4" />
              <div className="h-10 bg-surface-elevated rounded-xl w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center mb-4">
          <span className="text-2xl">👋</span>
        </div>
        <h3 className="text-lg font-semibold text-text mb-1">Welcome to the beginning of this channel</h3>
        <p className="text-sm text-text-muted max-w-sm">
          No messages yet. Start the conversation by sending a message below!
        </p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
      <div className="flex flex-col min-h-full justify-end">
        {messages.map((msg) => (
          <ChatMessage key={msg._id} message={msg} />
        ))}
      </div>
    </div>
  );
}
