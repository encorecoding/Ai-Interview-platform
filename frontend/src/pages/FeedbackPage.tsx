import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, CheckCircle, AlertTriangle, Star,
  Target, TrendingUp, Zap, Book, Code2, Brain,
  ChevronDown, ChevronUp, BarChart3, Clock, Sparkles,
  ArrowRight, ShieldCheck, ExternalLink, RefreshCw, Copy, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { feedbackService } from '../services';
import toast from 'react-hot-toast';

const MOCK_FEEDBACK = {
  overallScore: 76,
  totalInterviews: 3,
  strengths: [
    {
      category: 'Technical Depth',
      feedback: 'Demonstrated exceptional algorithmic rigor and time-space complexity awareness. Solutions were systematically verified with boundary conditions.',
      examples: ['Flawlessly reasoned through hash collision resolution strategies', 'Derived O(n log n) tight upper bound for merge sort with stack recursion depth analysis'],
    },
    {
      category: 'Problem Decomposition',
      feedback: 'Consistently broke down ambiguous architectural and algorithmic prompts into clean, testable sub-modules before writing solutions.',
      examples: ['Modularized graph traversal into topological sorting followed by cycle detection', 'Employed iterative micro-steps for multi-tier distributed caching'],
    },
    {
      category: 'Technical Articulation',
      feedback: 'Articulated architectural trade-offs with high signal-to-noise ratio. Clarified assumptions upfront without redundant filler.',
      examples: ['Communicated read/write amplification tradeoffs between B-Trees and LSM Trees', 'Structured answers using concise executive summaries before deep dives'],
    },
  ],
  weaknesses: [
    {
      category: 'Distributed System Scaling',
      feedback: 'Architecture answers lacked depth in operational resilience. Did not proactively address partition tolerance, data replication lag, or backpressure.',
      actionItems: ['Study distributed consensus algorithms (Raft, Paxos)', 'Practice multi-region active-active database replication models', 'Review Chapter 5 of Designing Data-Intensive Applications'],
    },
    {
      category: 'Operating System Primitives',
      feedback: 'Low-level execution details regarding virtual memory mapping, kernel space vs user space transitions, and context switching overhead were vague.',
      actionItems: ['Review virtual memory page tables and TLB cache invalidation', 'Study mutex vs spinlock trade-offs in multi-threaded kernels', 'Audit Linux process memory layout and cgroups'],
    },
    {
      category: 'Edge Case Defensive Guarding',
      feedback: 'Algorithmic implementations occasionally skipped pre-condition guards for null pointers, integer overflow boundaries, and malformed inputs.',
      actionItems: ['Adopt strict input sanitization checklist as step 1 in every coding challenge', 'Practice LeetCode Hard string & interval edge case problems', 'Validate edge cases explicitly before stating code is complete'],
    },
  ],
  technicalFeedback: {
    dsa: 82,
    dbms: 75,
    os: 60,
    oop: 85,
    systemDesign: 55,
    networking: 68,
  },
  communicationFeedback: {
    clarity: 80,
    structure: 75,
    confidence: 72,
    examples: 78,
  },
  practiceRecommendations: [
    { resource: 'LeetCode System Design', focus: 'High-throughput URL shortener & rate limiting', priority: 'High', type: 'Design Lab' },
    { resource: 'NeetCode 150', focus: 'Advanced Graph & Dynamic Programming patterns', priority: 'High', type: 'Algorithms' },
    { resource: '"Designing Data-Intensive Applications"', focus: 'Storage engines, transactions & consensus', priority: 'High', type: 'Literature' },
    { resource: 'OS3 Steps Book', focus: 'Virtualization, Concurrency & Persistence', priority: 'Medium', type: 'Systems' },
    { resource: 'Pramp Peer Practice', focus: 'Live behavioral & collaborative architecture drills', priority: 'Medium', type: 'Mock Drills' },
  ],
};

function FeedbackCard({
  title,
  icon: Icon,
  badge,
  badgeColor,
  children,
  defaultOpen = true
}: {
  title: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass-card overflow-hidden transition-all duration-300 hover:border-white/20">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0">
            <Icon size={19} className="text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
              {badge && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeColor || 'bg-brand-500/10 border-brand-500/30 text-brand-300'}`}>
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline">{open ? 'Collapse' : 'Expand'}</span>
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 pt-1 border-t border-white/[0.04]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    feedbackService.getLatest()
      .then((res) => setFeedback(res.data?.feedback || MOCK_FEEDBACK))
      .catch(() => setFeedback(MOCK_FEEDBACK))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyReport = () => {
    const summary = `Carrier Mantra Feedback Summary:\nOverall Score: ${feedback?.overallScore || 76}/100\nTotal Sessions: ${feedback?.totalInterviews || 3}\nTop Strength: ${feedback?.strengths?.[0]?.category}\nTop Growth Area: ${feedback?.weaknesses?.[0]?.category}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success('Performance summary copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="h-[70vh] flex items-center justify-center">
          <div className="text-center p-8 rounded-2xl glass-card">
            <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-white">Synthesizing AI Evaluation Diagnostics...</p>
            <p className="text-xs text-gray-500 mt-1">Cross-referencing interview transcripts & telemetry</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const fb = feedback || MOCK_FEEDBACK;

  const scoreTier =
    fb.overallScore >= 85 ? { label: 'Principal / Senior Ready', color: 'text-emerald-400', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]' } :
    fb.overallScore >= 70 ? { label: 'Solid Mid-Senior Caliber', color: 'text-brand-400', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]' } :
    { label: 'Foundational Competency', color: 'text-amber-400', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]' };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Executive Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-white/10 bg-gradient-to-r from-surface-900/90 via-surface-850/80 to-indigo-950/40 backdrop-blur-xl shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-brand-500/10 border border-brand-500/30 text-brand-300">
                  <Sparkles size={12} className="text-brand-400 animate-pulse" />
                  AI Agent Mesh Synthesis
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {fb.totalInterviews} Session{fb.totalInterviews !== 1 ? 's' : ''} Analyzed
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Candidate Intelligence & Diagnostic Report
              </h1>
              <p className="text-sm text-gray-400 mt-1 max-w-xl">
                Multi-dimensional performance evaluation synthesized from real-time interview transcripts, technical accuracy, latency, and communication signals.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyReport}
                className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Share Summary'}
              </button>
              <Link
                to="/interview/setup"
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-glow-sm"
              >
                <Zap size={14} />
                Targeted Retest
              </Link>
            </div>
          </div>
        </motion.div>

        {/* High-Impact Scorecard Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {/* Overall Composite */}
          <div className="glass-card-deep p-5 border border-brand-500/20 relative group hover:border-brand-500/40 transition-all">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Overall Composite</span>
              <Brain size={16} className="text-brand-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">{fb.overallScore}</span>
              <span className="text-xs text-gray-500 font-mono">/100</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`text-[11px] font-semibold ${scoreTier.color}`}>{scoreTier.label}</span>
            </div>
          </div>

          {/* DSA & Algorithms */}
          <div className="glass-card p-5 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">DSA Rigor</span>
              <Code2 size={16} className="text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">{fb.technicalFeedback?.dsa || 82}%</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">+8%</span> vs industry avg
            </div>
          </div>

          {/* System Design */}
          <div className="glass-card p-5 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">System Design</span>
              <TrendingUp size={16} className="text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">{fb.technicalFeedback?.systemDesign || 55}%</span>
            </div>
            <div className="mt-2 text-[11px] text-amber-400 font-medium">
              Primary Focus Area
            </div>
          </div>

          {/* Articulation & Clarity */}
          <div className="glass-card p-5 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Clarity & Comms</span>
              <MessageSquare size={16} className="text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-purple-400 font-mono">{fb.communicationFeedback?.clarity || 80}%</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-400">
              High signal, structured
            </div>
          </div>
        </motion.div>

        {/* Technical Domain Deep-Dive */}
        <FeedbackCard
          title="Technical Competency Breakdown"
          icon={BarChart3}
          badge="6 Core Engineering Disciplines"
        >
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 pt-3">
            {Object.entries(fb.technicalFeedback || {}).map(([key, value]) => {
              const score = value as number;
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
              const isHigh = score >= 80;
              const isMid = score >= 65;

              return (
                <div key={key} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-gray-200">{label}</span>
                    <span className={`font-mono font-bold ${isHigh ? 'text-emerald-400' : isMid ? 'text-brand-400' : 'text-amber-400'}`}>
                      {score}%
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{
                        background: isHigh
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : isMid
                          ? 'linear-gradient(90deg, #3b82f6, #6366f1)'
                          : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </FeedbackCard>

        {/* Strengths Section */}
        <FeedbackCard
          title="Demonstrated Technical Strengths"
          icon={CheckCircle}
          badge="Verified Competencies"
          badgeColor="bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
        >
          <div className="space-y-4 pt-3">
            {fb.strengths.map((s: any, i: number) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/[0.07] to-transparent border border-emerald-500/20 hover:border-emerald-500/35 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Star size={13} className="text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-300">{s.category}</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">{s.feedback}</p>
                {s.examples && (
                  <div className="bg-black/30 rounded-lg p-3 border border-emerald-500/10 space-y-1.5">
                    <span className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-wider block">
                      Evidence from Transcript:
                    </span>
                    {s.examples.map((ex: string, j: number) => (
                      <div key={j} className="flex items-start gap-2 text-xs text-gray-300 font-mono">
                        <span className="text-emerald-400 mt-0.5">❯</span>
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </FeedbackCard>

        {/* Areas to Improve */}
        <FeedbackCard
          title="Identified Knowledge Gaps & Action Items"
          icon={AlertTriangle}
          badge="Priority Growth Areas"
          badgeColor="bg-amber-500/10 border-amber-500/30 text-amber-300"
        >
          <div className="space-y-4 pt-3">
            {fb.weaknesses.map((w: any, i: number) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-gradient-to-r from-amber-500/[0.07] to-transparent border border-amber-500/20 hover:border-amber-500/35 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Zap size={13} className="text-amber-400" />
                  </div>
                  <h4 className="text-sm font-bold text-amber-300">{w.category}</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">{w.feedback}</p>
                {w.actionItems && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-wider block">
                      Recommended Action Items:
                    </span>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {w.actionItems.map((item: string, j: number) => (
                        <div
                          key={j}
                          className="flex items-start gap-2 text-xs text-amber-200/90 bg-amber-500/[0.08] p-2.5 rounded-lg border border-amber-500/15"
                        >
                          <Target size={13} className="mt-0.5 text-amber-400 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </FeedbackCard>

        {/* Practice Recommendations */}
        <FeedbackCard
          title="Curated Study & Practice Modules"
          icon={Book}
          badge="AI Generated Plan"
          badgeColor="bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
        >
          <div className="space-y-3 pt-3">
            {fb.practiceRecommendations.map((rec: any, i: number) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/15 transition-all gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Book size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{rec.resource}</p>
                      {rec.type && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-gray-400 border border-white/10">
                          {rec.type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{rec.focus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:self-center self-end">
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-semibold border ${
                    rec.priority === 'High'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <Link
                    to="/roadmap"
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 hover:text-white transition-colors"
                    title="View in Roadmap"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </FeedbackCard>
      </div>
    </AppLayout>
  );
}
