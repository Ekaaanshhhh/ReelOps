import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { submissionAPI } from '../../api/submission.api';
import { automationAPI } from '../../api/automation.api';
import { getErrorMessage } from '../../utils/helpers';
import AIScheduleCard from './AIScheduleCard';
import AutomationSchedulePicker from './AutomationSchedulePicker';
import { PLATFORMS } from '../../utils/constants';

export default function AutomationApprovalModal({ isOpen, onClose, submission }) {
  const hasAIRecommendation = !!submission?.aiSuggestedPostTime;
  
  const [loading, setLoading] = useState(false);
  const [scheduleSource, setScheduleSource] = useState(hasAIRecommendation ? 'AI' : 'OWNER');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');

  // Auto-populate custom date/time fields with current time + 1 hour as default
  // Set scheduleSource based on AI availability
  useEffect(() => {
    if (isOpen) {
      setScheduleSource(hasAIRecommendation ? 'AI' : 'OWNER');
      const now = new Date();
      now.setHours(now.getHours() + 1);
      
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      setCustomDate(`${yyyy}-${mm}-${dd}`);
      
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      setCustomTime(`${hh}:${min}`);
    }
  }, [isOpen, hasAIRecommendation]);

  if (!isOpen || !submission) return null;

  const aiTime = hasAIRecommendation ? new Date(submission.aiSuggestedPostTime) : null;
  const aiConfidence = submission.aiTimeConfidence || 0;
  const aiReason = submission.aiTimeReason || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let scheduledAt;

      if (scheduleSource === 'AI') {
        if (!hasAIRecommendation) throw new Error("No AI recommendation available.");
        scheduledAt = aiTime.toISOString();
      } else {
        if (!customDate || !customTime) throw new Error("Please select a valid date and time.");
        const customDateTime = new Date(`${customDate}T${customTime}`);
        if (customDateTime <= new Date()) throw new Error("Scheduled time must be in the future.");
        scheduledAt = customDateTime.toISOString();
      }

      // Step 1: Approve submission
      await submissionAPI.approveSubmission(submission._id);

      // Step 2: Create automation
      await automationAPI.createAutomation({
        submissionId: submission._id,
        scheduledAt,
        scheduleSource
      });

      toast.success('Approve and Schedule Successful');
      onClose(true); // pass true to indicate success
    } catch (err) {
      toast.error('Unable To Schedule Automation');
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-bg-secondary/50">
              <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent-purple" />
                Approve & Schedule Content
              </h2>
              <button
                onClick={() => onClose(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-bg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-accent-purple/10 text-accent-purple uppercase tracking-wider">
                    {PLATFORMS.find(p => p.id === submission.platform)?.name || submission.platform}
                  </span>
                </div>
                <h3 className="text-base font-medium text-text">{submission.title}</h3>
                <p className="text-sm text-text-secondary">
                  Please confirm the schedule before finalizing approval.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AIScheduleCard 
                  hasAIRecommendation={hasAIRecommendation}
                  aiTime={aiTime}
                  aiConfidence={aiConfidence}
                  aiReason={aiReason}
                  selected={scheduleSource === 'AI'}
                  onSelect={() => setScheduleSource('AI')}
                />

                <AutomationSchedulePicker 
                  selected={scheduleSource === 'OWNER'}
                  onSelect={() => setScheduleSource('OWNER')}
                  customDate={customDate}
                  setCustomDate={setCustomDate}
                  customTime={customTime}
                  setCustomTime={setCustomTime}
                />

                {/* Submit */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => onClose(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text bg-bg-secondary hover:bg-card-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl font-medium text-sm text-white gradient-bg
                               hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                               transition-opacity flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                    Approve & Schedule
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
