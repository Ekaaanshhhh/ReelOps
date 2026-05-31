import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-purple/20 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-cyan/20 blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent-purple/10 blur-3xl animate-float" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-heading text-text">
              Reel<span className="text-accent-purple">Ops</span>
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold font-heading text-text mb-4 leading-tight"
          >
            AI-powered content publishing for{' '}
            <span className="gradient-text">modern creators</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-text-secondary text-lg"
          >
            Upload, optimize, approve, and publish your content across all platforms — powered by intelligent automation.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 flex items-center gap-6 text-sm text-text-muted"
        >
          <span>Trusted by 10,000+ creators</span>
          <span className="w-1 h-1 rounded-full bg-text-muted" />
          <span>99.9% uptime</span>
          <span className="w-1 h-1 rounded-full bg-text-muted" />
          <span>SOC 2 Compliant</span>
        </motion.div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
