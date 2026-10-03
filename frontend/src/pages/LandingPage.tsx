import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, FileText, MessageSquare, Map, ChevronRight,
  Star, Zap, Shield, Sparkles, BarChart3, Target,
  Play, CheckCircle, ArrowRight, Github, Twitter,
  Code2, Database, Globe, Cpu, Users, TrendingUp,
  Volume2, Mic, Check, Terminal, Layers, Activity, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AtmosphericBackground from '../components/ui/AtmosphericBackground';

const features = [
  {
    icon: Brain,
    title: 'Adaptive AI Interviewer',
    description: 'Multi-turn voice and text mock interviews that adjust question difficulty dynamically based on your answers and evaluate communication in real time.',
    badge: 'LangGraph Powered',
    color: 'from-brand-500 to-indigo-600',
    borderColor: 'group-hover:border-brand-500/40',
  },
  {
    icon: FileText,
    title: 'ATS Resume Intelligence',
    description: 'Parse PDF/DOCX resumes through 6-dimension benchmarking: technical skills, impact metrics, experience depth, and keyword density.',
    badge: 'ATS Score Engine',
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'group-hover:border-emerald-500/40',
  },
  {
    icon: MessageSquare,
    title: 'Diagnostic Feedback Matrix',
    description: 'Exhaustive post-interview evaluations highlighting algorithmic edge cases, system design scalability gaps, and verbal clarity.',
    badge: 'Real-Time Insights',
    color: 'from-amber-500 to-orange-600',
    borderColor: 'group-hover:border-amber-500/40',
  },
  {
    icon: Map,
    title: 'Skill Graph & Roadmaps',
    description: 'Personalized phase-by-phase curriculum synthesized to close identified skill gaps, complete with curated references and milestone tracking.',
    badge: 'Persistent Graph',
    color: 'from-purple-500 to-pink-600',
    borderColor: 'group-hover:border-purple-500/40',
  },
  {
    icon: BarChart3,
    title: 'Multi-Session Analytics',
    description: 'Track mastery velocity across DSA, System Design, Operating Systems, and DBMS with interactive radar charts and trend sparklines.',
    badge: 'Telemetry',
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'group-hover:border-cyan-500/40',
  },
  {
    icon: Volume2,
    title: 'Bi-Directional Voice Engine',
    description: 'Low-latency browser Speech-to-Text and natural Text-to-Speech synthesis simulating high-pressure live phone screens and on-sites.',
    badge: 'Web Speech API',
    color: 'from-rose-500 to-red-600',
    borderColor: 'group-hover:border-rose-500/40',
  },
];

const steps = [
  { step: '01', title: 'Target Role Selection', desc: 'Select target engineering seniority, company profile, and interview format.' },
  { step: '02', title: 'Resume Calibration', desc: 'Upload your resume to extract verified skills and calibrate question domains.' },
  { step: '03', title: 'High-Stakes AI Screen', desc: 'Engage with the voice-enabled AI agent through technical and behavioral rounds.' },
  { step: '04', title: 'Mastery Curriculum', desc: 'Receive structured diagnostics and an actionable roadmap to fix weak spots.' },
];

const stats = [
  { value: '50K+', label: 'Mock Sessions Run', subtext: 'Globally across 120 countries' },
  { value: '94.2%', label: 'Offer Conversion', subtext: 'For candidates completing 5+ sessions' },
  { value: '3.4x', label: 'Faster Preparation', subtext: 'Compared to passive LeetCoding' },
  { value: '< 200ms', label: 'Voice Response Latency', subtext: 'Natural conversational cadence' },
];

const techStack = [
  { icon: Brain, name: 'LangGraph' },
  { icon: Cpu, name: 'LangChain' },
  { icon: Code2, name: 'React 18 + Vite' },
  { icon: Database, name: 'MongoDB Mongoose' },
  { icon: Globe, name: 'Node Microservices' },
  { icon: Shield, name: 'Firebase & Bearer Auth' },
];

const faqs = [
  {
    q: 'How realistic is the AI Interview Agent compared to human tech screens?',
    a: 'Carrier Mantra utilizes LangGraph state machines that remember every answer you give during the session. If your answer is incomplete, it dynamically asks contextual follow-up questions, probes architectural trade-offs, and evaluates edge-case awareness just like a Staff Engineer at FAANG.',
  },
  {
    q: 'Can I practice with live voice input and audio question reading?',
    a: 'Yes! The interview studio features bi-directional voice: natural speech synthesis reads out questions and real-time Speech-to-Text transcribes your spoken answers so you can practice verbal articulation without touching the keyboard.',
  },
  {
    q: 'How does the ATS Resume Analyzer compute scores?',
    a: 'The Resume Agent analyzes syntax, structure, quantified metrics (e.g. X% latency reduction), verified tech stack keywords, and bullet point impact. It scores you out of 100 and highlights missing high-yield keywords for your target role.',
  },
  {
    q: 'Can I try the platform immediately without creating an account or adding API keys?',
    a: 'Absolutely. Click "Explore Demo Platform" anywhere on the site to enter the zero-config demo mode with pre-loaded candidate data, active roadmaps, and full offline fallback.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleLaunchDemo = () => {
    loginAsDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-x-hidden relative selection:bg-brand-500/30 selection:text-brand-200">
      {/* Dynamic atmospheric background with floating orbs and grid */}
      <AtmosphericBackground />

      {/* Floating Glass Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-surface-950/70 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-white/80 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-300">
              <img
                src="/carrier-mantra-mark.png"
                alt="Carrier Mantra"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white">Carrier<span className="text-brand-400">Mantra</span></span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-400 border border-white/10 hidden sm:inline">
                v2.0
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Agent Mesh</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchDemo}
              id="landing-quick-demo-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/35 text-brand-300 text-xs font-semibold shadow-glow-sm transition-all"
            >
              <Zap size={13} className="text-brand-400" />
              <span>Instant Demo</span>
            </button>
            <Link to="/login" className="text-xs font-semibold text-gray-300 hover:text-white px-3 py-2 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-xs py-2 px-3.5 shadow-glow-sm hidden sm:inline-flex">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden">
        <div className="relative max-w-5xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* AI Agent Mesh Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-gray-300 mb-8 backdrop-blur-md shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
              <span className="text-brand-300 font-semibold">Autonomous AI Career Mesh</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">LangGraph Multi-Turn Orchestration</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.08] tracking-tight mb-6">
              Master High-Stakes Tech Interviews with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-300">
                Adaptive AI Intelligence.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Practice voice-enabled technical screens that adapt in real time, audit your resume against 6 ATS benchmarks, and follow a personalized skill graph to offer day.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleLaunchDemo}
                id="hero-demo-cta"
                className="btn-primary text-sm py-3.5 px-7 flex items-center gap-2.5 shadow-[0_0_30px_rgba(59,130,246,0.35)] w-full sm:w-auto justify-center"
              >
                <Zap size={17} />
                <span>Explore Demo Platform</span>
                <span className="text-[10px] font-mono opacity-70 bg-white/20 px-1.5 py-0.5 rounded ml-1">No Login</span>
              </button>

              <Link
                to="/interview/setup"
                className="btn-secondary text-sm py-3.5 px-6 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Play size={16} className="text-brand-400" />
                <span>Launch Mock Interview</span>
              </Link>
            </div>
          </motion.div>

          {/* Interactive Hero Console Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-16 relative"
          >
            <div className="glass-card-deep p-5 sm:p-7 max-w-4xl mx-auto rounded-2xl border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.5)] text-left">
              {/* Terminal Window Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-gray-500 ml-2">session://carriermantra-adaptive-interviewer</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AI Interviewer Active
                  </div>
                  <span className="text-xs font-mono text-gray-500 hidden sm:inline">Round: System Design (Hard)</span>
                </div>
              </div>

              {/* Console Body: 2 Columns */}
              <div className="grid md:grid-cols-3 gap-5">
                {/* Left: Dynamic Question Stream */}
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center">
                          <Brain size={13} className="text-brand-400" />
                        </div>
                        <span className="text-xs font-mono text-brand-300 font-semibold">Question 3 of 8</span>
                      </div>
                      {/* Audio waveform mockup */}
                      <div className="flex items-center gap-1">
                        {[18, 28, 14, 22, 32, 16].map((h, i) => (
                          <div
                            key={i}
                            className="w-1 bg-brand-400/80 rounded-full animate-pulse"
                            style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
                      "In a distributed cache tier with 1,000 nodes, how would you prevent cache stampede during sudden traffic spikes when high-cardinality keys expire? Compare probabilistic early expiration with distributed mutex locks."
                    </p>
                  </div>

                  {/* Candidate Realtime Transcript */}
                  <div className="p-4 rounded-xl bg-brand-500/[0.03] border border-brand-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                        <Mic size={12} className="text-brand-400" />
                        Live Voice Transcript
                      </span>
                      <span className="text-[10px] font-mono text-brand-400">142 words • 0:48</span>
                    </div>
                    <p className="text-xs text-gray-300 font-mono leading-relaxed">
                      "I'd employ the XFetch algorithm for probabilistic early recomputation so background workers renew the key before hard TTL expiration. For catastrophic thundering herds, a distributed mutex via Redis Redlock ensures only one replica hits the backing database..."
                    </p>
                  </div>
                </div>

                {/* Right: Live Diagnostics Panel */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[11px] font-mono text-gray-400 mb-2 flex items-center justify-between">
                      <span>Evaluator Signal</span>
                      <span className="text-emerald-400 font-bold">92% Match</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'Algorithmic Depth', pct: 94, color: 'bg-emerald-400' },
                        { name: 'Scalability Vectors', pct: 88, color: 'bg-brand-400' },
                        { name: 'Verbal Signal/Noise', pct: 90, color: 'bg-indigo-400' },
                      ].map((item) => (
                        <div key={item.name}>
                          <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                            <span>{item.name}</span>
                            <span>{item.pct}%</span>
                          </div>
                          <div className="w-full bg-white/[0.06] rounded-full h-1">
                            <div className={`h-1 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-semibold mb-1">
                      <CheckCircle size={13} />
                      Strong Architecture Signal
                    </div>
                    <p className="text-[11px] text-gray-400">Correctly identified XFetch probabilistic caching equation.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Telemetry Stats Bar */}
      <section className="py-14 border-y border-white/[0.06] bg-surface-900/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center md:text-left border-l-2 border-brand-500/30 pl-4"
              >
                <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold text-gray-300 mt-1">{stat.label}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{stat.subtext}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core AI Features Grid */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-semibold">Engineered For Top Candidates</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mt-2 mb-4 tracking-tight">
              A Unified AI Career Intelligence Stack
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
              Replace disjointed question banks and blind interview prep with a coordinated mesh of stateful agents.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className={`glass-card p-6 sm:p-7 relative group transition-all duration-300 hover:border-white/20 ${feature.borderColor}`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-11 h-11 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                    <feature.icon size={20} className="text-white" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-gray-400 border border-white/10">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4-Agent Mesh Architecture */}
      <section id="workflow" className="py-20 px-6 bg-surface-900/30 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest font-semibold">Agentic Coordination</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-3">
              The 4 Specialized AI Agents
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              Each agent solves a distinct phase in your career journey, sharing memory and telemetry across microservices.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: FileText,
                name: 'Resume Agent',
                role: 'Ingestion & Benchmarks',
                desc: 'Extracts entities, analyzes keyword density, and produces ATS scores.',
                color: 'text-emerald-400',
                border: 'border-emerald-500/20'
              },
              {
                icon: Brain,
                name: 'Interview Agent',
                role: 'Conversational State',
                desc: 'Orchestrates dynamic technical questions and evaluates verbal answers.',
                color: 'text-brand-400',
                border: 'border-brand-500/20'
              },
              {
                icon: MessageSquare,
                name: 'Feedback Agent',
                role: 'Telemetry & Diagnosis',
                desc: 'Identifies systemic patterns across transcripts and grades edge cases.',
                color: 'text-amber-400',
                border: 'border-amber-500/20'
              },
              {
                icon: Map,
                name: 'Roadmap Agent',
                role: 'Curriculum Synthesis',
                desc: 'Generates structured multi-phase milestones to systematically close skill gaps.',
                color: 'text-purple-400',
                border: 'border-purple-500/20'
              },
            ].map((agent, i) => (
              <div
                key={agent.name}
                className={`glass-card p-5 border ${agent.border} hover:border-white/20 transition-all`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
                  <agent.icon size={20} className={agent.color} />
                </div>
                <h4 className="text-sm font-bold text-white">{agent.name}</h4>
                <p className="text-[11px] font-mono text-gray-400 mb-2">{agent.role}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Stepper */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">Step-By-Step Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-3">From Diagnostic to Offer</h2>
            <p className="text-sm text-gray-400">Structured system to bring you to principal engineer readiness.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.step} className="glass-card p-5 relative group">
                <span className="text-2xl font-black font-mono text-brand-400/80 mb-3 block">
                  {step.step}
                </span>
                <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Everything you need to know about the platform.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={faq.q}
                className="glass-card overflow-hidden border border-white/[0.07] hover:border-white/15 transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <div className="w-6 h-6 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 flex-shrink-0">
                    <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 sm:px-5 pb-5 text-xs text-gray-400 leading-relaxed border-t border-white/[0.04] pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action Hero Card */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card-deep p-8 sm:p-12 text-center rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white p-2 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(255,255,255,0.3)] border border-white/90">
                <img
                  src="/carrier-mantra-mark.png"
                  alt="Carrier Mantra"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
                Ready to Experience Next-Gen Career AI?
              </h2>
              <p className="text-sm text-gray-400 max-w-lg mx-auto mb-8">
                Join thousands of software engineers practicing smarter with stateful conversational intelligence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleLaunchDemo}
                  id="final-demo-cta"
                  className="btn-primary py-3.5 px-8 text-sm flex items-center gap-2 shadow-glow-md w-full sm:w-auto justify-center"
                >
                  <Zap size={16} />
                  <span>Launch Demo Studio</span>
                </button>
                <Link
                  to="/register"
                  className="btn-secondary py-3.5 px-6 text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <span>Create Account</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sleek Minimal Glass Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.06] text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-sm border border-white/80">
              <img
                src="/carrier-mantra-mark.png"
                alt="Carrier Mantra"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="font-bold text-white">Carrier Mantra Intelligence</span>
            <span className="text-gray-600">•</span>
            <span>Production Grade Microservices</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
