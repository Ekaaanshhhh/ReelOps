import { Sparkles } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

export default function AIScheduleCard({ 
  hasAIRecommendation, 
  aiTime, 
  aiConfidence, 
  aiReason, 
  selected, 
  onSelect 
}) {
  return (
    <label 
      className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected 
          ? 'border-accent-purple bg-accent-purple/5' 
          : 'border-border bg-bg hover:border-border-light'
      } ${!hasAIRecommendation ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <input 
            type="radio" 
            name="scheduleSource" 
            value="AI" 
            checked={selected} 
            onChange={() => hasAIRecommendation && onSelect()}
            disabled={!hasAIRecommendation}
            className="w-4 h-4 text-accent-purple border-border bg-bg focus:ring-accent-purple focus:ring-offset-bg"
          />
          <span className="font-medium text-text flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent-purple" />
            AI Recommended Time
          </span>
        </div>
        {hasAIRecommendation && (
          <span className="text-xs font-semibold px-2 py-1 rounded-md bg-accent-purple/10 text-accent-purple">
            {aiConfidence}% Confidence
          </span>
        )}
      </div>
      
      <div className="pl-7">
        {hasAIRecommendation ? (
          <>
            <p className="text-lg font-bold text-text mb-1">
              {formatDateTime(aiTime)}
            </p>
            {aiReason && (
              <p className="text-sm text-text-secondary mt-2">
                <span className="font-semibold text-text-muted">Reason:</span> {aiReason}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-text-muted italic">
            No AI recommendation available for this submission.
          </p>
        )}
      </div>
    </label>
  );
}
