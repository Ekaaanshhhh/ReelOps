import { Sparkles, Loader2 } from 'lucide-react';

export default function GenerateAIButton({ onClick, loading, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-3 rounded-xl font-medium text-sm border-2 transition-all flex items-center justify-center gap-2
        ${(disabled || loading)
          ? 'border-border bg-bg-secondary text-text-muted cursor-not-allowed'
          : 'border-accent-purple text-accent-purple hover:bg-accent-purple/10'
        }`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Generate AI Captions
        </>
      )}
    </button>
  );
}
