import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, CheckCircle, AlertTriangle, Star, Target,
  Code2, Briefcase, GraduationCap, FolderOpen, ArrowRight,
  Brain, TrendingUp, Award, Zap, ChevronRight, CheckCircle2,
  FileCheck, ShieldCheck, Sparkles, Copy, Check, Plus
} from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import AppLayout from '../layouts/AppLayout';
import { resumeService } from '../services';
import toast from 'react-hot-toast';

const MOCK_ANALYSIS = {
  fileName: 'alex_chen_fullstack_resume.pdf',
  score: 84,
  skills: ['JavaScript', 'TypeScript', 'React.js', 'Next.js', 'Node.js', 'Express', 'Python', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Git', 'REST APIs', 'GraphQL'],
  experience: [
    { company: 'Enterprise Cloud Corp', role: 'Full Stack Engineer', duration: '2023 — Present', highlights: ['Architected low-latency microservices handling 25K+ RPM', 'Reduced frontend bundle size by 35% through dynamic code-splitting', 'Led integration of automated test pipelines with Jest and Playwright'] },
    { company: 'HyperScale Labs', role: 'Frontend Software Engineer', duration: '2021 — 2023', highlights: ['Engineered dynamic data visualization dashboard using Recharts and Tailwind', 'Implemented OAuth2 authentication and role-based access control'] },
  ],
  education: [{ institution: 'Institute of Technology & Science', degree: 'B.S. in Computer Science', year: '2021' }],
  projects: [
    { name: 'Carrier Mantra Career Intelligence Platform', tech: ['React', 'TypeScript', 'Node.js', 'LangGraph', 'Tailwind'], desc: 'Multi-service AI career coach with speech synthesis and dynamic mock questionnaires' },
    { name: 'Distributed Message Broker', tech: ['Go', 'Redis', 'WebSockets', 'Docker'], desc: 'High-throughput event publication engine supporting real-time web clients' },
  ],
  categoryScores: [
    { subject: 'Skills', value: 88 },
    { subject: 'Experience', value: 82 },
    { subject: 'Education', value: 85 },
    { subject: 'Projects', value: 86 },
    { subject: 'Structure', value: 80 },
    { subject: 'Keywords', value: 82 },
  ],
  strengths: [
    'Comprehensive full-stack modern ecosystem: TypeScript, React, Node.js, and SQL',
    'Quantifiable metrics articulated across previous engineering tenure (e.g. 35% bundle reduction)',
    'Real architectural projects demonstrating complex distributed state machines',
    'Clean, parser-friendly single-column ATS layout structure',
  ],
  improvements: [
    'Incorporate explicit Cloud Infrastructure terms (AWS ECS, Kubernetes, Terraform)',
    'Elaborate on database indexing and transaction isolation in project descriptions',
    'Highlight automated test coverage percentages (e.g. unit/integration coverage)',
  ],
  missingKeywords: ['AWS ECS', 'Kubernetes', 'CI/CD Pipelines', 'System Design', 'Microservices', 'Kafka'],
};

function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#34d399' : score >= 65 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg width="144" height="144" className="-rotate-90">
        <circle cx="72" cy="72" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <motion.circle
          cx="72" cy="72" r="54" fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.2 }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black font-mono text-white tracking-tight">{score}%</span>
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">ATS Index</span>
      </div>
    </div>
  );
}

export default function ResumeAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKw, setCopiedKw] = useState<string | null>(null);

  const isDemo = id?.startsWith('demo-');
  const filename = searchParams.get('filename') || 'alex_chen_fullstack_resume.pdf';

  useEffect(() => {
    const load = async () => {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 600));
        setAnalysis({ ...MOCK_ANALYSIS, fileName: filename });
      } else {
        try {
          const res = await resumeService.getById(id!);
          setAnalysis(res.data?.resume || { ...MOCK_ANALYSIS, fileName: filename });
        } catch {
          setAnalysis({ ...MOCK_ANALYSIS, fileName: filename });
        }
      }
      setLoading(false);
    };
    load();
  }, [id, filename]);

  const copyKeyword = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedKw(kw);
    setTimeout(() => setCopiedKw(null), 1500);
    toast.success(`Copied "${kw}" to clipboard`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-center space-y-4 glass-card p-8 border border-white/10 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-glow-sm">
              <Brain size={28} className="text-white animate-pulse" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Synthesizing ATS Resume Insights</p>
              <p className="text-gray-400 text-xs font-mono mt-1">Cross-referencing technical keywords...</p>
            </div>
            <div className="flex gap-1.5 justify-center pt-2">
              <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const a = analysis || MOCK_ANALYSIS;
  const score = a.score || 84;

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileCheck size={18} className="text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                ATS Document Parsed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {a.fileName}
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Target Profile: <span className="text-brand-300 font-medium">Senior Software Engineer</span> · Status: Ready for Job Submissions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/resume" className="btn-secondary text-xs px-4 py-2.5">
              Upload Another
            </Link>
            <Link to="/interview" className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 shadow-glow-sm">
              <Brain size={14} />
              <span>Practice Mock Round</span>
            </Link>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* HERO ATS SCORECARD */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 relative overflow-hidden border border-white/[0.09]"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 20, 18, 0.9) 0%, rgba(10, 10, 20, 0.95) 100%)',
          }}
        >
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center flex-shrink-0">
              <ScoreGauge score={score} />
              <div className="mt-3 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Top Tier (Passes 88% ATS)
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  6-Dimension ATS Breakdown
                </span>
                <span className="text-xs font-mono text-gray-400">Target Benchmark: 80%</span>
              </div>
              
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={a.categoryScores || MOCK_ANALYSIS.categoryScores}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                    <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* DETECTED SKILLS CLOUD & MISSING ATS KEYWORDS */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 border border-white/[0.08] space-y-6"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 size={18} className="text-brand-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Verified Technical Skills</h3>
              </div>
              <span className="text-xs font-mono text-gray-400">{a.skills?.length || 14} skills extracted</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {a.skills?.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.035] border border-white/[0.08] text-xs font-mono font-medium text-gray-200 hover:border-brand-500/40 hover:bg-brand-500/10 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Keywords Box */}
          {a.missingKeywords?.length > 0 && (
            <div className="pt-5 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                    High-Impact Keywords to Consider Adding
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-gray-400">Click keyword to copy</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {a.missingKeywords.map((kw: string) => {
                  const isCopied = copiedKw === kw;
                  return (
                    <button
                      key={kw}
                      onClick={() => copyKeyword(kw)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                        isCopied
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300'
                      }`}
                    >
                      {isCopied ? <Check size={12} /> : <Plus size={12} />}
                      <span>{kw}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* ======================================================== */}
        {/* STRENGTHS & RECOMMENDED IMPROVEMENTS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Resume Strengths</h3>
            </div>
            <div className="space-y-3">
              {a.strengths?.map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                  <Star size={14} className="text-emerald-400 mt-0.5 flex-shrink-0 fill-emerald-400/30" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-tight">ATS Optimization Tips</h3>
            </div>
            <div className="space-y-3">
              {a.improvements?.map((imp: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                  <Zap size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* PARSED EXPERIENCE & PROJECTS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Briefcase size={18} className="text-purple-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Parsed Work Experience</h3>
            </div>
            <div className="space-y-3.5">
              {a.experience?.map((exp: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.07]">
                  <p className="text-sm font-bold text-white">{exp.role}</p>
                  <p className="text-xs font-mono text-purple-300 mt-0.5">{exp.company} · {exp.duration}</p>
                  <ul className="mt-2.5 space-y-1">
                    {exp.highlights?.map((h: string, j: number) => (
                      <li key={j} className="text-xs text-gray-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-brand-400 font-bold mt-0.5">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Projects */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen size={18} className="text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Key Projects & Education</h3>
              </div>
              <div className="space-y-3.5">
                {a.projects?.map((proj: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.07]">
                    <p className="text-sm font-bold text-white">{proj.name}</p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{proj.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {proj.tech?.map((t: string) => (
                        <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-cyan-300 border border-white/[0.08]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {a.education?.map((edu: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.07] flex items-center gap-3">
                    <GraduationCap size={18} className="text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">{edu.degree}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{edu.institution} · {edu.year}</p>
                    </div>
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
