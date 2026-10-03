import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, FileText, MessageSquare, Map, TrendingUp,
  Clock, Target, Award, Plus, ChevronRight,
  BarChart3, Zap, CheckCircle, AlertTriangle,
  ArrowUpRight, Play, Star, Sparkles, Cpu,
  ShieldCheck, Activity, Compass, ArrowRight,
  CheckCircle2, Flame
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../layouts/AppLayout';
import { userService, interviewService, feedbackService } from '../services';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

// Mock performance data for chart
const performanceData = [
  { week: 'W1', technical: 58, communication: 62, problem: 54 },
  { week: 'W2', technical: 65, communication: 67, problem: 60 },
  { week: 'W3', technical: 72, communication: 73, problem: 68 },
  { week: 'W4', technical: 78, communication: 75, problem: 76 },
  { week: 'W5', technical: 82, communication: 82, problem: 79 },
  { week: 'W6', technical: 86, communication: 85, problem: 83 },
];

const radarData = [
  { subject: 'DSA', value: 85 },
  { subject: 'DBMS', value: 80 },
  { subject: 'OS', value: 68 },
  { subject: 'OOP', value: 88 },
  { subject: 'System Design', value: 65 },
  { subject: 'Architecture', value: 74 },
];

const initialInterviews = [
  { _id: '1', type: 'Technical', role: 'Full Stack Engineer', score: 82, difficulty: 'Medium', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { _id: '2', type: 'Technical', role: 'Frontend Specialist', score: 79, difficulty: 'Hard', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { _id: '3', type: 'HR', role: 'Engineering Lead', score: 91, difficulty: 'Medium', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

const initialFeedback = {
  strengths: [
    'Excellent understanding of React reactivity and virtual DOM diffing',
    'Systematic decomposition of complex algorithmic problems',
    'Clear verbal articulation of engineering tradeoffs'
  ],
  weaknesses: [
    'Expand on caching invalidation patterns (Redis / CDN)',
    'Proactively state space-complexity boundaries before coding'
  ],
};

function MiniSparkline({ color }: { color: string }) {
  return (
    <div className="w-16 h-7 opacity-75">
      <svg viewBox="0 0 64 24" className="w-full h-full overflow-visible">
        <path
          d="M 2 18 Q 16 20 24 12 T 42 10 T 62 4"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="62" cy="4" r="2.5" fill={color} />
      </svg>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  glowColor,
  accentColor,
  trend,
  suffix = '',
  detail
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  glowColor: string;
  accentColor: string;
  trend?: number;
  suffix?: string;
  detail: string;
}) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-5 relative overflow-hidden group cursor-default"
    >
      {/* Background glow spot on hover */}
      <div
        className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
        style={{ background: glowColor }}
      />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-sm"
          style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.06), ${glowColor}25)` }}
        >
          <Icon size={19} style={{ color: accentColor }} />
        </div>

        <div className="flex items-center gap-1.5">
          <MiniSparkline color={accentColor} />
          {trend !== undefined && (
            <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center">
              +{trend}%
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
            {value}
          </span>
          <span className="text-sm font-semibold text-gray-400">{suffix}</span>
        </div>
        <p className="text-xs font-medium text-gray-300 mt-1">{label}</p>
        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{detail}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [interviews, setInterviews] = useState(initialInterviews);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, interviewsRes, fbRes] = await Promise.all([
          userService.getDashboardStats().catch(() => null),
          interviewService.getAll().catch(() => null),
          feedbackService.getLatest().catch(() => null),
        ]);
        if (statsRes?.data?.stats) {
          setStats(statsRes.data.stats);
        }
        if (interviewsRes?.data?.interviews && interviewsRes.data.interviews.length > 0) {
          setInterviews(interviewsRes.data.interviews.slice(0, 3));
        }
        if (fbRes?.data?.feedback) {
          setFeedback({
            strengths: fbRes.data.feedback.strengths?.map((s: any) => typeof s === 'string' ? s : s.feedback) || initialFeedback.strengths,
            weaknesses: fbRes.data.feedback.weaknesses?.map((w: any) => typeof w === 'string' ? w : w.feedback) || initialFeedback.weaknesses,
          });
        }
      } catch {
        // Fallback to rich pre-loaded data
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const statCards = [
    {
      label: 'Avg Interview Score',
      value: stats?.avgScore ?? 82,
      suffix: '%',
      icon: Award,
      glowColor: '#6366f1',
      accentColor: '#818cf8',
      trend: 7,
      detail: 'Top 15% of candidates'
    },
    {
      label: 'Mock Interviews',
      value: stats?.totalInterviews ?? 8,
      suffix: ' sessions',
      icon: Brain,
      glowColor: '#8b5cf6',
      accentColor: '#c084fc',
      trend: 12,
      detail: '2 technical completed this week'
    },
    {
      label: 'Resume ATS Score',
      value: stats?.resumeScore ?? 85,
      suffix: '/100',
      icon: FileText,
      glowColor: '#10b981',
      accentColor: '#34d399',
      trend: 5,
      detail: 'Full Stack Engineer target'
    },
    {
      label: 'Skills Mastered',
      value: stats?.skillsMastered ?? 14,
      suffix: ' topics',
      icon: Target,
      glowColor: '#06b6d4',
      accentColor: '#22d3ee',
      trend: 3,
      detail: 'DSA & System Design active'
    },
  ];

  const agentCards = [
    {
      to: '/interview',
      icon: Brain,
      title: 'Interview Agent',
      tagline: 'Realistic Voice & Code Studio',
      description: 'Dynamic technical & behavioral rounds with speech synthesis, voice input, and instant AI scoring.',
      gradient: 'from-brand-500/20 via-indigo-600/10 to-transparent',
      borderColor: 'group-hover:border-brand-500/40',
      iconColor: 'text-brand-300',
      iconBg: 'bg-brand-500/20',
      status: 'Adaptive Engine v2.4',
      cta: 'Launch Mock Round'
    },
    {
      to: '/resume',
      icon: FileText,
      title: 'Resume Agent',
      tagline: 'ATS & Skill Gap Intelligence',
      description: 'Upload PDF or DOCX. Extract missing high-impact tech keywords, benchmark against top job tiers.',
      gradient: 'from-emerald-500/20 via-teal-600/10 to-transparent',
      borderColor: 'group-hover:border-emerald-500/40',
      iconColor: 'text-emerald-300',
      iconBg: 'bg-emerald-500/20',
      status: 'ATS Scanner Ready',
      cta: 'Analyze Resume'
    },
    {
      to: '/feedback',
      icon: MessageSquare,
      title: 'Feedback Agent',
      tagline: 'Strengths & Deep Analytics',
      description: 'Examine detailed breakdowns across communication clarity, system scalability, and technical depth.',
      gradient: 'from-amber-500/20 via-orange-600/10 to-transparent',
      borderColor: 'group-hover:border-amber-500/40',
      iconColor: 'text-amber-300',
      iconBg: 'bg-amber-500/20',
      status: 'Insights Updated',
      cta: 'View Performance'
    },
    {
      to: '/roadmap',
      icon: Map,
      title: 'Roadmap Agent',
      tagline: 'Personalized Learning Paths',
      description: 'Step-by-step career path tailored to your identified interview gaps. Check off milestones live.',
      gradient: 'from-purple-500/20 via-pink-600/10 to-transparent',
      borderColor: 'group-hover:border-purple-500/40',
      iconColor: 'text-purple-300',
      iconBg: 'bg-purple-500/20',
      status: 'Phase 2 in Progress',
      cta: 'Track Roadmap'
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* ======================================================== */}
        {/* HERO COMMAND CENTER */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl p-6 sm:p-8 overflow-hidden border border-white/[0.09] shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 14, 28, 0.85) 0%, rgba(10, 10, 20, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Subtle Ambient Glow Effect inside Hero */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.09] text-xs font-mono text-gray-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                <span>AI Career Coach Engine Online</span>
                <span className="text-gray-600">|</span>
                <span className="text-brand-300">Target: Full Stack Engineer</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Practice smarter. Master interviews. <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Accelerate your dream tech career.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-xl">
                Simulate realistic mock rounds with voice synthesis, diagnose technical gaps with automated ATS scoring, and level up with tailored roadmaps.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 flex-shrink-0">
              <Link
                to="/interview"
                className="btn-primary flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)]"
              >
                <Play size={16} className="fill-white" />
                <span>Start Live Interview</span>
              </Link>
              <Link
                to="/resume"
                className="btn-secondary flex items-center gap-2 px-5 py-3.5 text-sm"
              >
                <FileText size={16} className="text-emerald-400" />
                <span>Analyze Resume</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* INTERACTIVE STATS GRID */}
        {/* ======================================================== */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </motion.div>

        {/* ======================================================== */}
        {/* AI AGENT TILES (LINEAR / VERCEL STYLE) */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Cpu size={18} className="text-brand-400" />
                <span>AI Agent Mesh</span>
              </h2>
              <p className="text-xs text-gray-400 font-mono">Specialized intelligence agents tailored to your preparation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agentCards.map((card) => (
              <Link
                key={card.to}
                to={card.to}
                className={`group relative glass-card p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${card.borderColor}`}
              >
                {/* Dynamic Ambient Gradient Reveal on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none`}
                />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Header: Icon & Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg} border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                        <card.icon size={22} className={card.iconColor} />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-gray-400 border border-white/[0.08]">
                        {card.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-brand-200 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-medium text-brand-300/80 mb-2">
                      {card.tagline}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">
                    <span>{card.cta}</span>
                    <ArrowRight size={14} className="text-gray-500 group-hover:text-brand-300 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* ANALYTICS: PERFORMANCE TREND & SKILL RADAR */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 lg:col-span-2 relative"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity size={17} className="text-brand-400" />
                  <span>Performance Trajectory</span>
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Scored progression across the last 6 simulated rounds</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Technical
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Communication
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Problem Solving
                </span>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" stroke="#4b5563" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 11, fill: '#9ca3af' }} domain={[40, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(14, 14, 26, 0.95)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      color: '#f9fafb',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="technical" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} name="Technical" />
                  <Line type="monotone" dataKey="communication" stroke="#c084fc" strokeWidth={2} dot={{ r: 3, fill: '#c084fc' }} name="Communication" />
                  <Line type="monotone" dataKey="problem" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: '#34d399' }} name="Problem Solving" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Skill Radar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Compass size={17} className="text-cyan-400" />
                  <span>Technical Radar</span>
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Competency distribution</p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Balanced
              </span>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                  <Radar name="Skills" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.22} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-gray-400 text-center font-mono mt-2">
              Strongest: <span className="text-white font-semibold">OOP & DSA</span> · Growth: <span className="text-amber-300">System Design</span>
            </p>
          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* RECENT SESSIONS & ACTIONABLE AI DIAGNOSTICS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Mock Interviews */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Recent Sessions</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Review previous answers & audio transcripts</p>
              </div>
              <Link to="/interview" className="text-xs font-semibold text-brand-300 hover:text-brand-200 flex items-center gap-1 font-mono">
                View all <ChevronRight size={13} />
              </Link>
            </div>

            <div className="space-y-3">
              {interviews.map((interview: any) => (
                <Link
                  key={interview._id}
                  to={`/interview/${interview._id}/result`}
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-brand-500/30 hover:bg-white/[0.04] transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center flex-shrink-0 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
                    <Brain size={18} className="text-brand-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover:text-brand-200 transition-colors">
                      {interview.role}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono text-gray-400">{interview.type}</span>
                      <span className="text-gray-600">·</span>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        interview.difficulty === 'Hard'
                          ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                          : interview.difficulty === 'Medium'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {interview.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xl font-extrabold font-mono ${
                      interview.score >= 80 ? 'text-emerald-400' : interview.score >= 60 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {interview.score}%
                    </p>
                    <p className="text-[10px] font-mono text-gray-400">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              to="/interview"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/[0.09] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-gray-200 hover:text-white transition-all"
            >
              <Plus size={15} />
              <span>Configure New Mock Session</span>
            </Link>
          </motion.div>

          {/* AI Diagnostic Strengths & Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">AI Diagnostic Highlights</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">Synthesized from recent evaluations</p>
                </div>
                <Link to="/feedback" className="text-xs font-semibold text-brand-300 hover:text-brand-200 flex items-center gap-1 font-mono">
                  Full diagnosis <ChevronRight size={13} />
                </Link>
              </div>

              <div className="space-y-4">
                {/* Strengths */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      Demonstrated Strengths
                    </span>
                  </div>
                  <div className="space-y-2">
                    {feedback.strengths.slice(0, 2).map((s, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20 text-xs text-emerald-200/90 leading-relaxed"
                      >
                        <Star size={13} className="text-emerald-400 mt-0.5 flex-shrink-0 fill-emerald-400/30" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Focus Areas */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={15} className="text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      Priority Growth Focus
                    </span>
                  </div>
                  <div className="space-y-2">
                    {feedback.weaknesses.slice(0, 2).map((w, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed"
                      >
                        <Zap size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/roadmap"
              className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-xs font-semibold text-purple-300 transition-all"
            >
              <Map size={15} />
              <span>Review Tailored Study Roadmap</span>
            </Link>
          </motion.div>
        </div>

      </div>
    </AppLayout>
  );
}
