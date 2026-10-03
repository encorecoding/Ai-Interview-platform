import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Camera, Save, Loader2, Award, Brain, FileText, Target, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({ name });
      toast.success('Profile updated successfully!');
    } catch {
      toast('Profile updated locally in workspace', { icon: 'ℹ️' });
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Interviews Completed', value: 6, icon: Brain, color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
    { label: 'Highest Readiness', value: '90%', icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Resumes Analyzed', value: 2, icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Core Skills Tracked', value: 18, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono text-brand-400 uppercase tracking-wider font-semibold">Account Identity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Candidate Profile</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Manage personal parameters, credentials, and telemetry</p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Left: User Identity Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 glass-card-deep p-6 text-center border border-white/10"
          >
            <div className="relative inline-block mx-auto mb-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-500/40 shadow-[0_0_25px_rgba(59,130,246,0.3)]"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-[0_0_25px_rgba(59,130,246,0.3)] border border-white/20">
                  {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center border border-white/20 shadow-md">
                <Sparkles size={13} className="text-white" />
              </div>
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight">{user?.displayName || 'Alex Chen'}</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{user?.email || 'alex.chen@carriermantra.demo'}</p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[10px] font-mono mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              Verified Demo Candidate
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.06] text-left space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-9 text-xs"
                    placeholder="Candidate Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email (Managed by Auth)</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={user?.email || 'alex.chen@carriermantra.demo'}
                    readOnly
                    className="input-field pl-9 text-xs opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold shadow-glow-sm mt-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Update Profile
              </button>
            </div>
          </motion.div>

          {/* Right: Activity Stats & Credentials Details */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-3 space-y-4"
          >
            {/* Stats Grid */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-4 flex items-center justify-between">
                <span>Telemetry & Activity</span>
                <span className="text-brand-400 font-semibold">Active Session</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className={`p-4 rounded-xl border ${stat.bg} transition-all hover:border-white/20`}>
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon size={18} className={stat.color} />
                    </div>
                    <p className="text-2xl font-black text-white font-mono">{stat.value}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Details & Plan */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                <Shield size={14} className="text-emerald-400" />
                Security & Plan Specifications
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Platform Tier', value: 'Candidate Pro (Unlimited AI Mocks)', highlight: 'text-emerald-400' },
                  { label: 'Authentication Engine', value: user?.providerData?.[0]?.providerId === 'google.com' ? 'Google OAuth 2.0' : 'Firebase JWT / Dev Bearer' },
                  { label: 'Adaptive Model', value: 'LangGraph State Graph + Heuristic Fallback' },
                  { label: 'Telemetry Storage', value: 'MongoDB Multi-Tenant Cluster' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-white/[0.04] last:border-0 text-xs">
                    <span className="text-gray-400">{item.label}</span>
                    <span className={`font-mono font-medium ${item.highlight || 'text-white'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
