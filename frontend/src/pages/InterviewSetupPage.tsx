import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Code2, Users, Layers, ChevronRight,
  Clock, Target, Zap, Info, Play, AlertCircle,
  Sparkles, CheckCircle2, Shield, ArrowRight,
  Compass, Laptop, Server, Database, Smartphone
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { interviewService } from '../services';
import toast from 'react-hot-toast';

const POPULAR_ROLES = [
  { name: 'Full Stack Engineer', category: 'Generalist' },
  { name: 'Frontend Engineer (React)', category: 'Client' },
  { name: 'Backend Engineer (Node/Go)', category: 'Server' },
  { name: 'System Architect', category: 'Scale' },
  { name: 'DevOps & Cloud Engineer', category: 'Infra' },
  { name: 'AI / Machine Learning Engineer', category: 'Intelligence' },
  { name: 'Engineering Manager', category: 'Leadership' },
  { name: 'Data Engineer', category: 'Data' },
  { name: 'Mobile Developer (React Native)', category: 'Mobile' },
];

const INTERVIEW_TYPES = [
  {
    id: 'Technical',
    icon: Code2,
    label: 'Technical Deep-Dive',
    tagline: 'DSA, System Design & Core CS',
    desc: 'Structured evaluation covering data structures, algorithmic complexity, DBMS internals, and distributed architectures.',
    accent: 'from-brand-500 via-indigo-600 to-purple-600',
    borderColor: 'border-brand-500/40',
    topics: ['Data Structures', 'Algorithms', 'System Design', 'DBMS', 'OS Internals', 'OOP'],
  },
  {
    id: 'HR',
    icon: Users,
    label: 'Behavioral & Leadership',
    tagline: 'STAR Method & Culture Fit',
    desc: 'Assesses situational judgment, engineering philosophy, cross-team conflict resolution, and career trajectory.',
    accent: 'from-emerald-500 via-teal-600 to-cyan-600',
    borderColor: 'border-emerald-500/40',
    topics: ['STAR Method', 'Conflict Resolution', 'Technical Ownership', 'Leadership', 'Communication'],
  },
  {
    id: 'Mixed',
    icon: Layers,
    label: 'Full Comprehensive Mock',
    tagline: 'Technical + Behavioral Synthesis',
    desc: 'Simulates an authentic end-to-end multi-stage interview round, seamlessly transitioning between technical design and team fit.',
    accent: 'from-purple-500 via-pink-600 to-amber-500',
    borderColor: 'border-purple-500/40',
    topics: ['System Architecture', 'Coding Logic', 'Tradeoff Analysis', 'Behavioral STAR', 'Culture Fit'],
  },
];

const DIFFICULTIES = [
  { id: 'Easy', label: 'Associate', exp: '0–2 yrs', desc: 'Core fundamentals & straightforward implementation', color: 'emerald' },
  { id: 'Medium', label: 'Mid-Level', exp: '2–5 yrs', desc: 'Algorithmic efficiency & production system considerations', color: 'amber' },
  { id: 'Hard', label: 'Senior / Staff', exp: '5+ yrs', desc: 'Distributed scalability, failure modes & edge case mastery', color: 'red' },
];

const DURATIONS = [
  { value: 15, label: '15 min', questions: '4 questions', desc: 'Sprint practice' },
  { value: 30, label: '30 min', questions: '8 questions', desc: 'Standard interview' },
  { value: 45, label: '45 min', questions: '10 questions', desc: 'In-depth evaluation' },
  { value: 60, label: '60 min', questions: '12 questions', desc: 'Full simulated round' },
];

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('Full Stack Engineer');
  const [customRole, setCustomRole] = useState('');
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  const selectedRole = role === 'custom' ? customRole.trim() || 'Software Engineer' : role;

  const handleStart = async () => {
    if (!selectedRole || !interviewType) {
      toast.error('Please complete role and round selection');
      return;
    }
    setLoading(true);
    try {
      const res = await interviewService.create({
        type: interviewType,
        role: selectedRole,
        difficulty,
        duration,
      });
      const interviewId = res.data?.interview?._id || res.data?._id;
      toast.success('AI Interview session generated!');
      navigate(`/interview/${interviewId}?type=${interviewType}&role=${encodeURIComponent(selectedRole)}&difficulty=${difficulty}&duration=${duration}`);
    } catch {
      // Seamless offline fallback
      navigate(`/interview/demo-${Date.now()}?type=${interviewType}&role=${encodeURIComponent(selectedRole)}&difficulty=${difficulty}&duration=${duration}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 via-indigo-600 to-accent-600 flex items-center justify-center shadow-glow-sm">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Configure AI Mock Session</h1>
              <p className="text-xs text-gray-400 font-mono">Calibrate domain topic, difficulty, and simulated time</p>
            </div>
          </div>
        </motion.div>

        {/* Stepper Bar */}
        <div className="glass-card p-4 flex items-center justify-between border border-white/[0.08]">
          {[
            { num: 1, label: 'Target Role' },
            { num: 2, label: 'Interview Type' },
            { num: 3, label: 'Difficulty & Time' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center gap-3">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all ${
                  step === s.num
                    ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)] border border-brand-300'
                    : s.num < step
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/[0.04] text-gray-400 border border-white/[0.08]'
                }`}
              >
                {s.num < step ? <CheckCircle2 size={16} /> : s.num}
              </button>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white tracking-tight">{s.label}</p>
                <p className="text-[10px] text-gray-400 font-mono">Step {s.num} of 3</p>
              </div>
              {idx < 2 && <ChevronRight size={16} className="text-gray-600 mx-2 hidden sm:inline" />}
            </div>
          ))}
        </div>

        {/* Step Views */}
        <AnimatePresence mode="wait">
          {/* STEP 1: TARGET ROLE */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Select your target engineering role</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">The AI interviewer tailors question banks and evaluation criteria to this position</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {POPULAR_ROLES.map((r) => {
                  const isSelected = role === r.name;
                  return (
                    <button
                      key={r.name}
                      onClick={() => { setRole(r.name); setCustomRole(''); }}
                      className={`p-4 rounded-xl text-left transition-all border group relative overflow-hidden ${
                        isSelected
                          ? 'bg-brand-500/15 border-brand-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                          : 'glass-card hover:border-white/20 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-gray-400">
                          {r.category}
                        </span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_6px_#818cf8]" />}
                      </div>
                      <p className={`text-sm font-bold tracking-tight ${isSelected ? 'text-brand-200' : 'text-white'}`}>
                        {r.name}
                      </p>
                    </button>
                  );
                })}

                <button
                  onClick={() => setRole('custom')}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    role === 'custom'
                      ? 'bg-brand-500/15 border-brand-500/50'
                      : 'glass-card hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-gray-400 mb-1 inline-block">
                    Custom
                  </span>
                  <p className="text-sm font-bold text-gray-300">+ Specify Custom Role</p>
                </button>
              </div>

              {role === 'custom' && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Distributed Database Specialist, SRE, Tech Lead..."
                    className="input-field"
                    autoFocus
                  />
                </motion.div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => selectedRole && setStep(2)}
                  disabled={!selectedRole}
                  className="btn-primary flex items-center gap-2 px-6"
                >
                  <span>Proceed to Interview Type</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: INTERVIEW TYPE */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Choose your evaluation domain</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Select technical challenges, behavioral assessment, or a full realistic mock</p>
              </div>

              <div className="space-y-4">
                {INTERVIEW_TYPES.map((type) => {
                  const isSelected = interviewType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setInterviewType(type.id)}
                      className={`w-full text-left p-6 rounded-2xl transition-all border relative overflow-hidden group ${
                        isSelected
                          ? `bg-white/[0.05] ${type.borderColor} shadow-[0_0_30px_rgba(99,102,241,0.2)]`
                          : 'glass-card hover:border-white/20 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.accent} flex items-center justify-center flex-shrink-0 shadow-glow-sm`}>
                          <type.icon size={22} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <h3 className="text-base font-bold text-white tracking-tight">{type.label}</h3>
                              <p className="text-xs font-semibold text-brand-300 font-mono">{type.tagline}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-brand-400 bg-brand-500' : 'border-gray-600'
                            }`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed mt-2">{type.desc}</p>
                          <div className="flex flex-wrap gap-1.5 mt-3.5">
                            {type.topics.map((t) => (
                              <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-gray-300 border border-white/[0.07]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(1)} className="btn-secondary">
                  Back
                </button>
                <button
                  onClick={() => interviewType && setStep(3)}
                  disabled={!interviewType}
                  className="btn-primary flex items-center gap-2 px-6"
                >
                  <span>Configure Settings</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: DIFFICULTY & DURATION */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Set interview difficulty & session time</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Fine-tune the complexity and pacing of questions</p>
              </div>

              {/* Difficulty Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DIFFICULTIES.map((d) => {
                  const isSelected = difficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={`p-4 rounded-xl text-left transition-all border ${
                        isSelected
                          ? d.color === 'emerald'
                            ? 'bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                            : d.color === 'amber'
                            ? 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                            : 'bg-red-500/15 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                          : 'glass-card hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-sm font-bold ${
                          isSelected
                            ? d.color === 'emerald' ? 'text-emerald-300' : d.color === 'amber' ? 'text-amber-300' : 'text-red-300'
                            : 'text-white'
                        }`}>
                          {d.label}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">{d.exp}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{d.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Duration Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DURATIONS.map((d) => {
                  const isSelected = duration === d.value;
                  return (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`p-4 rounded-xl text-center transition-all border ${
                        isSelected
                          ? 'bg-brand-500/20 border-brand-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                          : 'glass-card hover:border-white/20 text-gray-300'
                      }`}
                    >
                      <p className="text-xl font-black font-mono">{d.label}</p>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">{d.questions}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{d.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Summary Card */}
              <div className="glass-card p-5 border border-white/[0.08] relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Session Blueprint
                  </span>
                  <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    AI Engine Ready
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Role</span>
                    <span className="text-white font-semibold">{selectedRole}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Domain</span>
                    <span className="text-white font-semibold">{interviewType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Difficulty</span>
                    <span className="text-amber-300 font-semibold">{difficulty}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Allotted Time</span>
                    <span className="text-white font-semibold">{duration} minutes</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(2)} className="btn-secondary">
                  Back
                </button>
                <button
                  id="start-interview-btn"
                  onClick={handleStart}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2.5 px-8 shadow-glow-md"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Calibrating Agent...</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} className="fill-white" />
                      <span>Enter Live Interview Studio</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AppLayout>
  );
}
