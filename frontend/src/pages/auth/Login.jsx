import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/helpers';

/**
 * Login Page — email/password authentication.
 * No role selection — roles are channel-specific.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/channels');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-text-bright mb-2 tracking-tight">
          Welcome back
        </h1>
        <p className="text-text-dim text-[14px] font-light mb-8">
          Sign in to your account to continue
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-4 py-3 rounded-xl bg-bg neu-in text-danger text-[13px] font-medium flex items-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-text-dim mb-2 tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-[42px] pr-4 py-3 bg-bg rounded-xl text-text-bright text-[14px] font-medium neu-in placeholder:text-text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent-purple/50 transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text-dim mb-2 tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
                className="w-full pl-[42px] pr-4 py-3 bg-bg rounded-xl text-text-bright text-[14px] font-medium neu-in placeholder:text-text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent-purple/50 transition-shadow"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl font-bold text-[14px] text-white bg-accent-purple shadow-[4px_4px_12px_rgba(139,124,248,0.4),-2px_-2px_8px_rgba(139,124,248,0.1)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 tracking-wider"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[13px] text-text-dim font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent-purple hover:text-accent-purple-light transition-colors font-bold tracking-wide">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
