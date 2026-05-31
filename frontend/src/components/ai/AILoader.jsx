import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AILoader() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="text-accent-purple mb-4"
      >
        <Loader2 className="w-8 h-8" />
      </motion.div>
      <h3 className="text-lg font-medium text-text mb-2">AI is Thinking...</h3>
      <p className="text-sm text-text-muted">Generating optimized captions, hashtags, and descriptions based on your inputs.</p>
    </div>
  );
}
