import { Sparkles, RefreshCcw } from 'lucide-react';
import AILoader from './AILoader';
import CaptionSuggestionCard from './CaptionSuggestionCard';
import HashtagList from './HashtagList';
import OptimizedDescriptionCard from './OptimizedDescriptionCard';
import { motion } from 'framer-motion';

export default function AICaptionPanel({ 
  loading, 
  error, 
  aiData, 
  onSelectCaption, 
  onSelectDescription,
  onRegenerate
}) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col items-center justify-center min-h-[400px]">
        <AILoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4 mx-auto">
          <span className="text-danger font-bold text-xl">!</span>
        </div>
        <h3 className="text-lg font-medium text-text mb-2">AI Generation Failed</h3>
        <p className="text-sm text-text-muted mb-4 max-w-xs mx-auto">{error}</p>
        <button 
          onClick={onRegenerate}
          className="px-4 py-2 bg-bg-secondary hover:bg-border rounded-xl text-sm font-medium text-text transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!aiData) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-full bg-accent-purple/10 flex items-center justify-center mb-4 mx-auto">
          <Sparkles className="w-8 h-8 text-accent-purple" />
        </div>
        <h3 className="text-lg font-medium text-text mb-2">AI Metadata Generator</h3>
        <p className="text-sm text-text-muted max-w-xs mx-auto">
          Fill in your title and description, select a platform, and let our AI generate optimized captions, hashtags, and descriptions for you.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full max-h-[800px]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-purple" />
          <h2 className="text-lg font-bold text-text">AI Suggestions</h2>
        </div>
        <button 
          onClick={onRegenerate}
          className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Regenerate
        </button>
      </div>

      <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
        {/* Captions */}
        {aiData.captions && aiData.captions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-3">Caption Options</h3>
            <div className="grid grid-cols-1 gap-3">
              {aiData.captions.map((caption, idx) => (
                <CaptionSuggestionCard 
                  key={idx} 
                  caption={caption} 
                  onSelect={onSelectCaption}
                />
              ))}
            </div>
          </div>
        )}

        {/* Optimized Description */}
        {aiData.optimizedDescription && (
          <OptimizedDescriptionCard 
            description={aiData.optimizedDescription}
            onSelect={onSelectDescription}
          />
        )}

        {/* Hashtags */}
        {aiData.hashtags && aiData.hashtags.length > 0 && (
          <HashtagList hashtags={aiData.hashtags} />
        )}
      </div>
    </motion.div>
  );
}
