import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Brain,
  FileText,
  MessageSquare,
  Map,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Bell,
  Cpu,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AtmosphericBackground from '../components/ui/AtmosphericBackground';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: 'Live' },
  { to: '/interview', icon: Brain, label: 'AI Interview', badge: 'Voice' },
  { to: '/resume', icon: FileText, label: 'Resume', badge: 'ATS' },
  { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
];

const bottomItems = [
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, isDemoMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const getPageTitle = () => {
    const current = navItems.find((i) => location.pathname === i.to || (i.to !== '/dashboard' && location.pathname.startsWith(i.to)));
    if (current) return current.label;
    const bottom = bottomItems.find((i) => location.pathname.startsWith(i.to));
    if (bottom) return bottom.label;
    if (location.pathname.startsWith('/interview/')) return 'Live Interview Studio';
    if (location.pathname.startsWith('/resume/')) return 'Resume ATS Intelligence';
    return 'Carrier Mantra Studio';
  };

  const NavLink = ({
    to,
    icon: Icon,
    label,
    badge,
  }: {
    to: string;
    icon: React.ElementType;
    label: string;
    badge?: string;
  }) => {
    const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={`group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'text-white bg-gradient-to-r from-brand-500/20 via-accent-500/10 to-transparent border border-brand-500/30 shadow-[inset_0_0_20px_rgba(99,102,241,0.15)]'
            : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] hover:border hover:border-white/[0.06]'
        }`}
      >
        {/* Active Left Glow Bar */}
        {isActive && (
          <motion.div
            layoutId="activeNavGlow"
            className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-brand-400 via-accent-400 to-cyan-400 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"
          />
        )}

        <Icon
          size={18}
          className={`transition-all duration-200 group-hover:translate-x-0.5 ${
            isActive ? 'text-brand-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-gray-400 group-hover:text-white'
          }`}
        />
        <span className="flex-1 tracking-tight">{label}</span>

        {badge && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono uppercase tracking-wider font-semibold transition-colors ${
              isActive
                ? 'bg-brand-500/30 text-brand-200 border border-brand-400/40'
                : 'bg-white/[0.05] text-gray-400 group-hover:text-gray-300'
            }`}
          >
            {badge}
          </span>
        )}

        {isActive && <ChevronRight size={14} className="text-brand-400/80 animate-pulse" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative z-10">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/[0.07]">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-white/80 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-300">
              <img
                src="/carrier-mantra-mark.png"
                alt="Carrier Mantra"
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#07070d] shadow-[0_0_8px_#34d399]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-white tracking-tight font-sans">
                Carrier<span className="text-brand-400">Mantra</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono tracking-wide">AI Career Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold font-mono">Workspace</p>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Online
          </span>
        </div>
        {navItems.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}

        <div className="pt-4 pb-2 px-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold font-mono">Preferences</p>
        </div>
        {bottomItems.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3.5 space-y-2.5 border-t border-white/[0.07] bg-[#07070d]/40">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-red-300/80 hover:text-red-200 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
        >
          <LogOut size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Sign Out</span>
        </button>

        {/* User Card */}
        <div className="glass-card p-3 flex items-center gap-3 border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-9 h-9 rounded-xl object-cover border border-white/10" />
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 via-indigo-600 to-accent-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-glow-sm">
              {user?.displayName?.[0] || user?.email?.[0] || 'A'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-white truncate">
                {user?.displayName || 'Alex Chen'}
              </p>
              {isDemoMode && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  DEMO
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 truncate font-mono">
              {user?.email || 'alex.chen@carriermantra.demo'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050508] overflow-hidden text-gray-100 relative">
      {/* Ambient Moving Gradient Orbs */}
      <AtmosphericBackground />

      {/* Desktop Glass Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#07070d]/85 backdrop-blur-2xl border-r border-white/[0.08] flex-shrink-0 z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        <SidebarContent />
      </aside>

      {/* Mobile Glass Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#07070d]/95 backdrop-blur-2xl border-r border-white/[0.08] z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#07070d]/70 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-6 flex-shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-colors"
            >
              <Menu size={20} />
            </button>

            <Link to="/dashboard" className="lg:hidden flex items-center gap-2 mr-1">
              <div className="w-7 h-7 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-sm border border-white/80">
                <img src="/carrier-mantra-mark.png" alt="Carrier Mantra" className="w-5 h-5 object-contain" />
              </div>
            </Link>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono hidden sm:inline">Platform</span>
              <span className="text-gray-600 hidden sm:inline">/</span>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Header Status Controls */}
          <div className="flex items-center gap-3.5">
            {/* Live AI Engine Status Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.035] border border-white/[0.08] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="text-xs font-mono text-gray-300">
                AI Agent Mesh <span className="text-cyan-400 font-semibold">Active</span>
              </span>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] transition-all">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full shadow-[0_0_8px_#6366f1]" />
            </button>

            {/* User Profile Avatar Pill */}
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.16] transition-all"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-accent-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
                  {user?.displayName?.[0] || 'A'}
                </div>
              )}
              <span className="text-xs font-semibold text-gray-200 hidden sm:inline">
                {user?.displayName || 'Alex Chen'}
              </span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content with Smooth Transition */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
