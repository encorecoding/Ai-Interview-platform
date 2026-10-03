import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AtmosphericBackground from '../components/ui/AtmosphericBackground';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signInWithGoogle, loginAsDemo } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
    } catch (err: any) {
      const msg = err?.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : err?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome back!');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Google login failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4 relative overflow-hidden py-12 selection:bg-brand-500/30 selection:text-brand-200">
      <AtmosphericBackground />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header / Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
            <div className="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.25)] border border-white/80 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-300">
              <img
                src="/carrier-mantra-mark.png"
                alt="Carrier Mantra"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Carrier<span className="text-brand-400">Mantra</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-gray-400 mt-1">Sign in to your candidate intelligence workspace</p>
        </div>

        {/* Main Glass Card */}
        <div className="glass-card-deep p-6 sm:p-8 rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          {/* Zero-Config Demo Mode Banner */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-transparent border border-brand-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-semibold text-brand-300 flex items-center gap-1.5">
                <Sparkles size={13} className="text-brand-400" />
                Zero-Config Instant Demo
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40">
                1-Click Access
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
              Explore the full platform immediately as verified candidate Alex Chen without credentials.
            </p>
            <button
              type="button"
              id="demo-login-btn"
              onClick={() => {
                loginAsDemo();
                toast.success('Welcome to Carrier Mantra Demo Workspace!');
              }}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
            >
              <Zap size={14} />
              Explore as Demo Candidate
            </button>
          </div>

          {/* Google Sign In */}
          <button
            id="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-5"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">or sign in with email</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs mb-4"
            >
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 text-xs sm:text-sm"
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-gray-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10 text-xs sm:text-sm"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="email-login-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold shadow-glow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In to Workspace'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
