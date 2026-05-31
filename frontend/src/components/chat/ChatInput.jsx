import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled }) {
  const [content, setContent] = useState('');
  const textareaRef = useRef(null);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleSend = () => {
    if (!content.trim() || disabled) return;
    onSendMessage(content.trim());
    setContent('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-bg-secondary border-t border-border shrink-0">
      <div className="relative flex items-end gap-2 bg-surface border border-border rounded-xl focus-within:border-accent-purple focus-within:ring-1 focus-within:ring-accent-purple/50 transition-all">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message channel..."
          disabled={disabled}
          className="flex-1 max-h-[120px] min-h-[44px] py-3 pl-4 pr-12 bg-transparent text-sm text-text placeholder:text-text-muted resize-none focus:outline-none"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className="absolute right-2 bottom-2 p-1.5 rounded-lg text-white bg-accent-purple hover:bg-accent-purple-light disabled:opacity-50 disabled:bg-surface-elevated disabled:text-text-muted transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-2 text-center">
        <p className="text-[10px] text-text-muted">
          <span className="font-semibold">Enter</span> to send, <span className="font-semibold">Shift + Enter</span> for new line.
        </p>
      </div>
    </div>
  );
}
