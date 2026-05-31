import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function HashtagList({ hashtags }) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    const text = hashtags.join(' ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hashtags || hashtags.length === 0) return null;

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-text">Suggested Hashtags</h4>
        <button
          type="button"
          onClick={handleCopyAll}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy All'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((tag, idx) => (
          <span key={idx} className="px-2.5 py-1 text-xs bg-card border border-border rounded-full text-text-secondary">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
