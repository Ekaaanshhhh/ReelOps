import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * InviteCodeDisplay — shows the channel invite code with copy button.
 * Only visible to channel OWNERs.
 */
export default function InviteCodeDisplay({ inviteCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-bg-secondary rounded-xl border border-border">
      <div className="flex-1">
        <p className="text-xs text-text-muted mb-1">Invite Code</p>
        <p className="text-lg font-mono font-bold tracking-[0.3em] text-accent-purple">
          {inviteCode}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted
                   hover:text-accent-purple hover:bg-accent-purple/10 transition-all"
        title={copied ? 'Copied!' : 'Copy invite code'}
      >
        {copied ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
