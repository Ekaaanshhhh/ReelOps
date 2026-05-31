import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AutomationSchedulePicker({
  selected,
  onSelect,
  customDate,
  setCustomDate,
  customTime,
  setCustomTime
}) {
  return (
    <label 
      className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected 
          ? 'border-accent-purple bg-accent-purple/5' 
          : 'border-border bg-bg hover:border-border-light'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <input 
          type="radio" 
          name="scheduleSource" 
          value="OWNER" 
          checked={selected} 
          onChange={onSelect}
          className="w-4 h-4 text-accent-purple border-border bg-bg focus:ring-accent-purple focus:ring-offset-bg"
        />
        <span className="font-medium text-text flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-text-secondary" />
          Select Custom Time
        </span>
      </div>
      
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              required={selected}
              className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text text-sm
                         focus:outline-none focus:border-accent-purple"
            />
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              required={selected}
              className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text text-sm
                         focus:outline-none focus:border-accent-purple"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </label>
  );
}
