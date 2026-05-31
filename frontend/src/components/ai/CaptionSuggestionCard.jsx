import { useState } from 'react';
import { Copy, Check, MousePointerClick } from 'lucide-react';

export default function CaptionSuggestionCard({ caption, onSelect }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-4 flex flex-col gap-3 group hover:border-border-light transition-colors">
      <p className="text-sm text-text leading-relaxed">{caption}</p>
      
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text bg-card rounded-lg transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={() => onSelect(caption)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-accent-purple hover:bg-accent-purple/10 bg-card rounded-lg transition-colors"
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          Use This
        </button>
      </div>
    </div>
  );
}
