import { useState } from 'react';
import { Copy, Check, MousePointerClick } from 'lucide-react';

export default function OptimizedDescriptionCard({ description, onSelect }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!description) return null;

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-4">
      <h4 className="text-sm font-medium text-text mb-2">Optimized Description</h4>
      <p className="text-sm text-text-secondary leading-relaxed mb-4 whitespace-pre-wrap">
        {description}
      </p>
      
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-text-secondary hover:text-text bg-card rounded-lg transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={() => onSelect(description)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-accent-purple hover:bg-accent-purple/10 bg-card rounded-lg transition-colors"
        >
          <MousePointerClick className="w-4 h-4" />
          Replace Description
        </button>
      </div>
    </div>
  );
}
