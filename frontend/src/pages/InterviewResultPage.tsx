import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award, Brain, CheckCircle, AlertTriangle, Target,
  Map, MessageSquare, ChevronRight, Star, TrendingUp,
  BarChart3, Clock, Zap, ArrowRight, Sparkles, CheckCircle2,
  RefreshCw, Compass
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import AppLayout from '../layouts/AppLayout';
import { interviewService } from '../services';

const generateMockResult = (type: string, role: string, difficulty: string) => ({
  interview: { type, role, difficulty, duration: 32 },
  score: 82,
  technicalScore: 84,
  communicationScore: 86,
  problemSolvingScore: 78,
  strengths: [
    'Strong conceptual foundation in data structures and state complexity',
    'Systematic breakdown of problem requirements before proposing implementations',
    'Clear and articulate verbal communication of software tradeoffs',
  ],
  weaknesses: [
    'Expand on caching invalidation patterns (Redis / distributed caches)',
    'Proactively formulate an edge-case checklist before finalizing solutions',
  ],
  topicScores: [
    { topic: 'DSA', score: 86 },
    { topic: 'DBMS', score: 80 },
    { topic: 'OOP', score: 88 },
    { topic: 'OS', score: 68 },
    { topic: 'System Design', score: 72 },
    { topic: 'Behavioral', score: 85 },
  ],
  recommendations: [
    'Review distributed cache patterns and cache stampede mitigation',
    'Practice designing high-throughput queues and message consumers',
    'Familiarize yourself with virtual memory, paging, and kernel vs user space',
  ],
  nextSteps: [
    { action: 'Generate Learning Roadmap', to: '/roadmap', icon: Map, desc: 'Turn weak areas into a milestone plan' },
    { action: 'View Detailed Feedback', to: '/feedback', icon: MessageSquare, desc: 'Deep dive into full evaluation history' },
    { action: 'Start Another Interview', to: '/interview', icon: Brain, desc: 'Test improved skills on a new round' },
  ],
});

function ScoreMetricCard({ label, score, color, icon: Icon }: { label: string; score: number; color: string; icon: React.ElementType }) {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-5 flex items-center gap-4 border border-white/[0.08]">
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg width="80" height="80" className="-rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <motion.circle
            cx="40" cy="40" r="36" fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black font-mono text-white">{score}%</span>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <Icon size={14} style={{ color }} />
          <p className="text-xs font-bold text-white tracking-tight">{label}</p>
        </div>
        <p className="text-[11px] text-gray-400 font-mono">
          {score >= 80 ? 'Exceptional' : score >= 65 ? 'Proficient' : 'Developing'}
        </p>
      </div>
    </div>
  );
}

export default function InterviewResultPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isDemo = id?.startsWith('demo-');
  const type = searchParams.get('type') || 'Technical';
  const role = decodeURIComponent(searchParams.get('role') || 'Full Stack Engineer');
  const difficulty = searchParams.get('difficulty') || 'Medium';

  useEffect(() => {
    const loadResult = async () => {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 600));
        setResult(generateMockResult(type, role, difficulty));
      } else {
        try {
          const res = await interviewService.getResult(id!);
          setResult(res.data);
        } catch {
          setResult(generateMockResult(type, role, difficulty));
        }
      }
      setLoading(false);
    };
    loadResult();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-center space-y-4 glass-card p-8 border border-white/10 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto shadow-glow-md">
              <Brain size={28} className="text-white animate-pulse" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Synthesizing Performance Evaluation</p>
              <p className="text-gray-400 text-xs font-mono mt-1">Aggregating metric scores & radar insights...</p>
            </div>
            <div className="flex gap-1.5 justify-center pt-2">
              <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const overallScore = result?.score || 82;
  const scoreColor = overallScore >= 80 ? '#34d399' : overallScore >= 65 ? '#f59e0b' : '#ef4444';

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Session Evaluation Completed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {result?.interview?.role || role} — {result?.interview?.type || type}
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Difficulty: <span className="text-cyan-400 font-semibold">{result?.interview?.difficulty || difficulty}</span> · Duration: {result?.interview?.duration || 30} mins
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/interview" className="btn-secondary text-xs px-4 py-2.5">
              New Interview
            </Link>
            <Link to="/roadmap" className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 shadow-glow-sm">
              <Map size={14} />
              <span>Generate Roadmap</span>
            </Link>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* HERO SCORECARD */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 relative overflow-hidden border border-white/[0.09]"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 14, 28, 0.9) 0%, rgba(10, 10, 20, 0.95) 100%)',
          }}
        >
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Concentric Radial Gauge */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative w-40 h-40">
                <svg width="160" height="160" className="-rotate-90">
                  <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                  <motion.circle
                    cx="80" cy="80" r="68" fill="none"
                    stroke={scoreColor} strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 68}
                    initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 68 - (overallScore / 100) * 2 * Math.PI * 68 }}
                    transition={{ duration: 1.8, ease: 'easeOut', delay: 0.2 }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black font-mono text-white tracking-tight">{overallScore}%</span>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">Readiness</span>
                </div>
              </div>

              <div className={`mt-3 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                overallScore >= 80 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                overallScore >= 65 ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                'bg-red-500/15 text-red-300 border-red-500/30'
              }`}>
                {overallScore >= 80 ? 'Tier 1 Strong Hire' : overallScore >= 65 ? 'Competent Pass' : 'Further Practice Needed'}
              </div>
            </div>

            {/* 3 Dimension Sub-Score Metric Cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <ScoreMetricCard
                label="Technical Depth"
                score={result?.technicalScore || 84}
                color="#6366f1"
                icon={Target}
              />
              <ScoreMetricCard
                label="Communication"
                score={result?.communicationScore || 86}
                color="#c084fc"
                icon={MessageSquare}
              />
              <ScoreMetricCard
                label="Problem Solving"
                score={result?.problemSolvingScore || 78}
                color="#34d399"
                icon={Zap}
              />
            </div>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* TOPIC BREAKDOWN & RADAR */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Topic-Wise Performance</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Scored competencies across examined subjects</p>
              </div>
              <BarChart3 size={17} className="text-gray-400" />
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result?.topicScores || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" domain={[0, 100]} stroke="#4b5563" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis dataKey="topic" type="category" stroke="#4b5563" tick={{ fontSize: 11, fill: '#e5e7eb' }} width={90} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(14, 14, 26, 0.95)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: '#f9fafb',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Competency Balance</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Multi-axis evaluation</p>
              </div>
              <Compass size={17} className="text-brand-400" />
            </div>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={result?.topicScores?.map((t: any) => ({ subject: t.topic, value: t.score })) || []}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                  <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* STRENGTHS & AREAS TO IMPROVE */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Key Strengths Identified</h3>
            </div>
            <div className="space-y-3">
              {result?.strengths?.map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                  <Star size={15} className="text-emerald-400 mt-0.5 flex-shrink-0 fill-emerald-400/30" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Areas to Strengthen</h3>
            </div>
            <div className="space-y-3">
              {result?.weaknesses?.map((w: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                  <Zap size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* ACTIONABLE RECOMMENDATIONS & NEXT STEPS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-brand-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Actionable Recommendations</h3>
            </div>
            <div className="space-y-3">
              {result?.recommendations?.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                  <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-[10px] font-bold font-mono text-brand-300 flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-base font-bold text-white tracking-tight mb-4">Recommended Next Steps</h3>
              <div className="space-y-3">
                {result?.nextSteps?.map((step: any, i: number) => (
                  <Link
                    key={i}
                    to={step.to}
                    className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.025] hover:bg-white/[0.06] border border-white/[0.06] hover:border-brand-500/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <step.icon size={18} className="text-brand-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-200 transition-colors">
                        {step.action}
                      </p>
                      <p className="text-[11px] text-gray-400 font-mono truncate">{step.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-500 group-hover:text-brand-300 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </AppLayout>
  );
}
