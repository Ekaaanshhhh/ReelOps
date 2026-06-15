import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg flex font-sans text-text">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative bg-bg-secondary shadow-[inset_-4px_0_16px_var(--color-sh-dark)] overflow-hidden">
        
        {/* Subtle glowing elements */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-purple/10 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-cyan/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-bg neu-out flex items-center justify-center">
              <Play className="w-5 h-5 text-accent-purple" />
            </div>
            <span className="text-2xl font-bold text-text-bright tracking-tight">
              Reel<span className="text-accent-purple">Ops</span>
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-text-bright mb-4 leading-tight tracking-tight"
          >
            AI-powered content publishing for{' '}
            <em className="not-italic text-accent-purple">modern creators</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[15px] font-light text-text-dim leading-[1.85]"
          >
            Upload, optimize, approve, and publish your content across all platforms — powered by intelligent automation.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 flex items-center gap-6 text-[12px] font-semibold text-text-dim tracking-wider"
        >
          <div className="flex items-center gap-2">
            <div className="w-[5px] h-[5px] bg-accent-purple rounded-full shadow-[0_0_5px_var(--color-accent-purple)]" />
            10K+ Creators
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[5px] h-[5px] bg-accent-cyan rounded-full shadow-[0_0_5px_var(--color-accent-cyan)]" />
            99.9% Uptime
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[5px] h-[5px] bg-accent-purple rounded-full shadow-[0_0_5px_var(--color-accent-purple)]" />
            SOC 2 Compliant
          </div>
        </motion.div>
      </div>

      {/* Right panel - Form Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-bg relative">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Neumorphic wrapper for the forms */}
          <div className="bg-bg rounded-[24px] p-6 sm:p-10 neu-out">
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
