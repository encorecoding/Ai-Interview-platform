import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Clock, ChevronRight, CheckCircle, AlertCircle,
  Send, Loader2, StopCircle, BarChart3, MessageSquare,
  Lightbulb, Target, Volume2, VolumeX, Mic, MicOff,
  Sparkles, Radio, Code2, Copy, Check, ArrowRight,
  HelpCircle, ShieldAlert, Cpu, Award
} from 'lucide-react';
import { interviewService } from '../services';
import AtmosphericBackground from '../components/ui/AtmosphericBackground';
import toast from 'react-hot-toast';

// Offline demo questions
const DEMO_QUESTIONS: Record<string, any[]> = {
  Technical: [
    { question: 'Explain the difference between a stack and a queue. When would you choose one data structure over the other in real-world systems?', topic: 'DSA', difficulty: 'Easy' },
    { question: 'What is a hash collision and what are the standard strategies to resolve it in modern hash table implementations?', topic: 'DSA', difficulty: 'Medium' },
    { question: 'Explain the ACID properties of database transactions and describe how isolation levels prevent dirty reads and phantom reads.', topic: 'DBMS', difficulty: 'Medium' },
    { question: 'Walk me through process scheduling algorithms. Compare Round Robin with Priority scheduling in terms of throughput and starvation.', topic: 'OS', difficulty: 'Medium' },
    { question: 'Explain runtime vs compile-time polymorphism with practical code design patterns.', topic: 'OOP', difficulty: 'Easy' },
    { question: 'How would you architect a distributed URL shortener service handling 100M daily active requests? Address database scaling and caching.', topic: 'System Design', difficulty: 'Hard' },
    { question: 'What constitutes a deadlock condition in concurrent programming? List the Coffman conditions and describe prevention strategies.', topic: 'OS', difficulty: 'Medium' },
    { question: 'Why are B-trees and B+ trees preferred over standard binary search trees for disk-based relational database indexes?', topic: 'DBMS', difficulty: 'Hard' },
  ],
  HR: [
    { question: 'Tell me about yourself, your core engineering philosophy, and why you are interested in this role.', topic: 'Introduction', difficulty: 'Easy' },
    { question: 'What are your greatest technical strengths and how do they impact cross-functional teams?', topic: 'Strengths', difficulty: 'Easy' },
    { question: 'Describe a challenging production outage or architectural hurdle you resolved. Walk me through your methodical approach.', topic: 'Behavioral', difficulty: 'Medium' },
    { question: 'Where do you envision your technical leadership in the next 3 to 5 years?', topic: 'Career Goals', difficulty: 'Easy' },
    { question: 'Describe a situation where you had a strong technical disagreement with a peer or stakeholder. How did you align?', topic: 'Behavioral', difficulty: 'Medium' },
    { question: 'What is an area of software engineering you find challenging and what deliberate practice are you taking to improve?', topic: 'Weaknesses', difficulty: 'Medium' },
  ],
  Mixed: [
    { question: 'Tell me about yourself and your proudest full-stack software engineering project.', topic: 'Introduction', difficulty: 'Easy' },
    { question: 'Compare RESTful architectural style with GraphQL and gRPC. In what scenarios would you choose each?', topic: 'Technical', difficulty: 'Medium' },
    { question: 'Describe a time you had to adopt a brand new framework under tight production deadlines.', topic: 'Behavioral', difficulty: 'Medium' },
    { question: 'Explain average and worst-case time complexities of Quicksort, and how median-of-three pivot selection helps.', topic: 'DSA', difficulty: 'Medium' },
    { question: 'How do you structure code reviews and automated CI/CD checks to ensure system reliability in a high-velocity team?', topic: 'Behavioral', difficulty: 'Medium' },
    { question: 'Design a real-time event notification pipeline with message queues, websockets, and failover handling.', topic: 'System Design', difficulty: 'Hard' },
  ],
};

interface Question {
  question: string;
  topic: string;
  difficulty: string;
  index?: number;
}

interface SessionState {
  currentQuestion: Question | null;
  questions: Question[];
  currentIndex: number;
  totalQuestions: number;
  isLoading: boolean;
  isEvaluating: boolean;
  topics: { name: string; status: 'done' | 'active' | 'pending' }[];
}

export default function InterviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isDemo = id?.startsWith('demo-');
  const demoType = searchParams.get('type') || 'Technical';
  const demoRole = searchParams.get('role') || 'Software Engineer';
  const demoDifficulty = searchParams.get('difficulty') || 'Medium';
  const demoDuration = parseInt(searchParams.get('duration') || '30');

  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(demoDuration * 60);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'ai' | 'user'; content: string; topic?: string; score?: number }[]>([]);
  const [session, setSession] = useState<SessionState>({
    currentQuestion: null,
    questions: [],
    currentIndex: 0,
    totalQuestions: 8,
    isLoading: true,
    isEvaluating: false,
    topics: [],
  });
  const [evalFeedback, setEvalFeedback] = useState<{ feedback: string; score?: number } | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedQuestion, setCopiedQuestion] = useState(false);

  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Web Speech API Text-to-Speech
  const speakText = useCallback((text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, [ttsEnabled]);

  // Voice Input Speech-to-Text
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser. Please type your answer or use Chrome/Edge.');
      return;
    }
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast('Listening to your voice...', { icon: '🎙️' });
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswer((prev) => {
          const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
          return prev + space + transcript;
        });
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (interviewEnded) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [interviewEnded]);

  // Initialize session
  useEffect(() => {
    const initInterview = async () => {
      if (isDemo) {
        const questions = DEMO_QUESTIONS[demoType] || DEMO_QUESTIONS.Technical;
        const topics = Array.from(new Set(questions.map((q) => q.topic)));
        setSession({
          questions,
          currentQuestion: questions[0],
          currentIndex: 0,
          totalQuestions: questions.length,
          isLoading: false,
          isEvaluating: false,
          topics: topics.map((t, i) => ({
            name: t,
            status: i === 0 ? 'active' : 'pending',
          })),
        });
        setChatHistory([
          {
            role: 'ai',
            content: `Welcome to your ${demoType} interview for the ${demoRole} position (${demoDifficulty} difficulty). I am your AI interviewer. Take your time to structure each response clearly.`,
          },
          { role: 'ai', content: questions[0].question, topic: questions[0].topic },
        ]);
        speakText(questions[0].question);
      } else {
        try {
          const res = await interviewService.startSession(id!);
          const data = res.data;
          const firstQ = data.question || data.currentQuestion;
          setSession({
            questions: [],
            currentQuestion: firstQ,
            currentIndex: 0,
            totalQuestions: data.totalQuestions || 8,
            isLoading: false,
            isEvaluating: false,
            topics: data.topics || [],
          });
          setChatHistory([
            { role: 'ai', content: data.greeting || `Welcome! Let's begin your ${demoType} interview.` },
            { role: 'ai', content: firstQ?.question || '', topic: firstQ?.topic },
          ]);
          if (firstQ?.question) {
            speakText(firstQ.question);
          }
        } catch {
          toast.error('Failed to load interview session. Switching to offline simulator.');
          navigate(`/interview/demo-offline?type=${demoType}&role=${encodeURIComponent(demoRole)}&difficulty=${demoDifficulty}`);
        }
      }
    };

    initInterview();

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      recognitionRef.current?.stop();
    };
  }, [id, isDemo, demoType, demoRole, demoDifficulty]);

  // Handle submit answer
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || submitting) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userAnswer = answer.trim();
    setAnswer('');
    setSubmitting(true);

    // Add candidate response to chat
    setChatHistory((prev) => [...prev, { role: 'user', content: userAnswer }]);
    setSession((s) => ({ ...s, isEvaluating: true }));

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 1200));

      const nextIndex = session.currentIndex + 1;
      const hasMore = nextIndex < session.questions.length;
      const scores = [82, 88, 75, 90, 84];
      const randomScore = scores[Math.floor(Math.random() * scores.length)];

      const feedbackPool = [
        'Solid response. You demonstrated a clear technical foundation and structured thinking.',
        'Good explanation of the core concept. Consider expanding on edge cases and memory complexity.',
        'Articulate answer with strong conceptual clarity. Great real-world architectural reference.',
        'Well reasoned. Next time, proactively address tradeoff analysis between throughput and latency.',
      ];
      const fb = feedbackPool[Math.floor(Math.random() * feedbackPool.length)];
      setEvalFeedback({ feedback: fb, score: randomScore });

      setChatHistory((prev) => [...prev, { role: 'ai', content: `[Evaluation: ${randomScore}%] ${fb}`, score: randomScore }]);

      if (hasMore) {
        const nextQ = session.questions[nextIndex];
        setTimeout(() => {
          setEvalFeedback(null);
          setChatHistory((prev) => [...prev, { role: 'ai', content: nextQ.question, topic: nextQ.topic }]);
          speakText(nextQ.question);
          setSession((s) => ({
            ...s,
            currentIndex: nextIndex,
            currentQuestion: nextQ,
            isEvaluating: false,
            topics: s.topics.map((t, i) => {
              if (t.name === nextQ.topic) return { ...t, status: 'active' as const };
              if (i < nextIndex) return { ...t, status: 'done' as const };
              return t;
            }),
          }));
        }, 1000);
      } else {
        setTimeout(() => {
          setEvalFeedback(null);
          setInterviewEnded(true);
          setSession((s) => ({ ...s, isEvaluating: false }));
          setTimeout(() => {
            navigate(`/interview/${id}/result?type=${demoType}&role=${encodeURIComponent(demoRole)}&difficulty=${demoDifficulty}`);
          }, 2000);
        }, 1000);
      }
    } else {
      try {
        const res = await interviewService.submitAnswer(id!, {
          questionIndex: session.currentIndex,
          answer: userAnswer,
          questionText: session.currentQuestion?.question,
        });
        const data = res.data;
        if (data.feedback) {
          setEvalFeedback({ feedback: data.feedback, score: data.score });
          setChatHistory((prev) => [
            ...prev,
            { role: 'ai', content: `[Score: ${data.score || 75}%] ${data.feedback}`, score: data.score },
          ]);
        }
        if (data.nextQuestion) {
          setTimeout(() => {
            setEvalFeedback(null);
            setChatHistory((prev) => [...prev, { role: 'ai', content: data.nextQuestion.question, topic: data.nextQuestion.topic }]);
            speakText(data.nextQuestion.question);
            setSession((s) => ({
              ...s,
              currentQuestion: data.nextQuestion,
              currentIndex: s.currentIndex + 1,
              isEvaluating: false,
              topics: data.topics || s.topics,
            }));
          }, 1000);
        } else if (data.completed) {
          setInterviewEnded(true);
          setSession((s) => ({ ...s, isEvaluating: false }));
          setTimeout(() => navigate(`/interview/${id}/result`), 2000);
        }
      } catch {
        toast.error('Failed to submit answer');
        setSession((s) => ({ ...s, isEvaluating: false }));
      }
    }

    setSubmitting(false);
  };

  const handleEndInterview = async () => {
    if (interviewEnded) return;
    setInterviewEnded(true);
    if (!isDemo) {
      try {
        await interviewService.complete(id!);
      } catch { /* ignore */ }
    }
    navigate(`/interview/${id}/result?type=${demoType}&role=${encodeURIComponent(demoRole)}&difficulty=${demoDifficulty}`);
  };

  const injectTemplate = (snippet: string) => {
    setAnswer((prev) => {
      const space = prev.length > 0 ? '\n\n' : '';
      return prev + space + snippet;
    });
    textareaRef.current?.focus();
  };

  const copyCurrentQuestion = () => {
    if (!session.currentQuestion?.question) return;
    navigator.clipboard.writeText(session.currentQuestion.question);
    setCopiedQuestion(true);
    setTimeout(() => setCopiedQuestion(false), 2000);
    toast.success('Question copied to clipboard');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, session.isEvaluating]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round(wordCount * 0.45);

  if (session.isLoading) {
    return (
      <div className="h-screen bg-[#050508] flex items-center justify-center relative overflow-hidden">
        <AtmosphericBackground />
        <div className="relative z-10 text-center space-y-4 glass-card p-8 border border-white/10 max-w-sm mx-auto shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 via-indigo-600 to-accent-600 rounded-2xl flex items-center justify-center mx-auto shadow-glow-md">
            <Brain size={28} className="text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Initializing AI Interviewer</h2>
            <p className="text-xs text-gray-400 font-mono mt-1">Calibrating role questions & state machine...</p>
          </div>
          <div className="flex gap-1.5 justify-center pt-2">
            <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050508] flex flex-col overflow-hidden text-gray-100 relative">
      <AtmosphericBackground />

      {/* ======================================================== */}
      {/* ZONE 1: TOP SESSION COMMAND BAR */}
      {/* ======================================================== */}
      <header className="h-16 bg-[#07070d]/80 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        {/* Left: Role & Type */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 via-indigo-600 to-accent-600 flex items-center justify-center shadow-glow-sm">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">{demoRole}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold">
                {demoType} Round
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono">
              Adaptive Level: <span className="text-cyan-400 font-medium">{demoDifficulty}</span>
            </p>
          </div>
        </div>

        {/* Center: Question Progress Pills */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono mr-1">Progress:</span>
          {Array.from({ length: session.totalQuestions }).map((_, idx) => {
            const isCompleted = idx < session.currentIndex;
            const isCurrent = idx === session.currentIndex;
            return (
              <div
                key={idx}
                className={`w-7 h-7 rounded-lg font-mono text-[11px] font-semibold flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-brand-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.6)] border border-brand-300'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/[0.04] text-gray-400 border border-white/[0.07]'
                }`}
              >
                {isCompleted ? <Check size={12} className="stroke-[3]" /> : idx + 1}
              </div>
            );
          })}
        </div>

        {/* Right: Audio Toggle, Timer, End Interview */}
        <div className="flex items-center gap-3">
          {/* TTS Audio Toggle */}
          <button
            onClick={() => {
              if (ttsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              setTtsEnabled(!ttsEnabled);
            }}
            title={ttsEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-2 transition-all ${
              ttsEnabled
                ? 'bg-brand-500/15 border-brand-500/30 text-brand-300 hover:bg-brand-500/25 shadow-sm'
                : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-gray-300'
            }`}
          >
            {ttsEnabled ? <Volume2 size={15} className="text-cyan-400" /> : <VolumeX size={15} />}
            <span className="hidden sm:inline">{ttsEnabled ? 'AI Voice ON' : 'Muted'}</span>
          </button>

          {/* Countdown Clock */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.035] border border-white/[0.08] font-mono text-xs font-bold ${
            timeLeft < 300 ? 'text-red-400 border-red-500/30 animate-pulse' : 'text-gray-300'
          }`}>
            <Clock size={14} className="text-gray-400" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* End Button */}
          <button
            onClick={handleEndInterview}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-300 text-xs font-semibold transition-all duration-200"
          >
            <StopCircle size={14} />
            <span>Finish</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN TWO-COLUMN SPLIT: LEFT AI ZONE & RIGHT CANDIDATE ZONE */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">

        {/* ---------------------------------------------------- */}
        {/* ZONE 2: AI INTERVIEWER PERSONA & ACTIVE QUESTION */}
        {/* ---------------------------------------------------- */}
        <div className="lg:w-[48%] flex flex-col border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#07070d]/50 backdrop-blur-md overflow-hidden">
          
          {/* AI Persona Header & Equalizer Aura */}
          <div className="p-4 sm:p-5 border-b border-white/[0.07] bg-white/[0.015] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isSpeaking ? 'ring-4 ring-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.5)]' : ''
                }`}>
                  <Brain size={20} className="text-white" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#07070d] ${
                  isSpeaking ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-emerald-400'
                }`} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">AI Interviewer Core</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {isSpeaking ? 'Speaking' : 'Listening'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-mono">Neural Evaluator v2.4</p>
              </div>
            </div>

            {/* Audio Wave Equalizer Visualizer */}
            <div className="flex items-end gap-1 h-7 px-3 py-1 rounded-xl bg-black/40 border border-white/[0.06]">
              {isSpeaking ? (
                <>
                  <div className="ai-wave-bar" />
                  <div className="ai-wave-bar" />
                  <div className="ai-wave-bar" />
                  <div className="ai-wave-bar" />
                  <div className="ai-wave-bar" />
                  <div className="ai-wave-bar" />
                </>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                  <Radio size={12} className="text-emerald-400" />
                  <span>Ready</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Question Highlight Card */}
          {session.currentQuestion && (
            <div className="p-4 sm:p-5 border-b border-white/[0.07] bg-brand-500/[0.03]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="badge-info text-[11px] font-mono">
                    Topic: {session.currentQuestion.topic}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    Q{session.currentIndex + 1} of {session.totalQuestions}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(session.currentQuestion?.question || '')}
                    title="Repeat question audio"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <Volume2 size={15} />
                  </button>
                  <button
                    onClick={copyCurrentQuestion}
                    title="Copy question text"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    {copiedQuestion ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                "{session.currentQuestion.question}"
              </h2>
            </div>
          )}

          {/* Conversation Dialogue Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
            <AnimatePresence initial={false}>
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'ai' ? (
                    <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Brain size={15} className="text-brand-300" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Code2 size={15} className="text-purple-300" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-1.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
                      msg.role === 'ai'
                        ? msg.score
                          ? 'bg-emerald-500/[0.07] border-emerald-500/25 text-emerald-200'
                          : 'bg-white/[0.035] border-white/[0.08] text-gray-200 shadow-sm'
                        : 'bg-brand-600/25 border-brand-500/35 text-white'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* AI Real-time Evaluating Card */}
            {session.isEvaluating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                  <Brain size={15} className="text-brand-300 animate-pulse" />
                </div>
                <div className="glass-card p-4 border border-brand-500/30 flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
                  </div>
                  <span className="text-xs font-mono text-gray-300">
                    Evaluating answer complexity, concepts, and communication...
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* ZONE 3: CANDIDATE RESPONSE STUDIO & EDITOR */}
        {/* ---------------------------------------------------- */}
        <div className="lg:w-[52%] flex flex-col bg-[#050508]/80 backdrop-blur-xl overflow-hidden">
          
          {/* Candidate Editor Header */}
          <div className="p-4 border-b border-white/[0.07] bg-white/[0.015] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 size={16} className="text-brand-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Your Response Studio
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
              <span>{wordCount} words</span>
              <span className="text-gray-600">·</span>
              <span>~{estimatedSeconds}s verbal</span>
            </div>
          </div>

          {/* Scaffolding Quick Helpers */}
          <div className="px-4 py-2.5 border-b border-white/[0.06] bg-black/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-mono text-gray-400 whitespace-nowrap">Scaffold:</span>
            <button
              onClick={() => injectTemplate('Approach:\n1. Core Concept:\n2. Complexity (Time/Space):\n3. Edge Cases:')}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-gray-300 transition-colors whitespace-nowrap"
            >
              + Technical Breakdown
            </button>
            <button
              onClick={() => injectTemplate('Situation & Context:\nTask & Challenges:\nAction & Implementation:\nResult & Learnings:')}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-gray-300 transition-colors whitespace-nowrap"
            >
              + STAR Method
            </button>
            <button
              onClick={() => injectTemplate('Tradeoffs considered:\n- Approach A vs Approach B:\n- Bottlenecks & Caching:')}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-gray-300 transition-colors whitespace-nowrap"
            >
              + Tradeoff Matrix
            </button>
          </div>

          {/* Text Editor Area */}
          <div className="flex-1 p-4 flex flex-col relative">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmitAnswer();
              }}
              placeholder="Type your structured answer here, or click the microphone to speak... (Press Ctrl + Enter to submit)"
              disabled={session.isEvaluating || submitting || interviewEnded}
              className="flex-1 w-full bg-white/[0.02] border border-white/[0.08] focus:border-brand-500/50 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-sans leading-relaxed resize-none transition-all disabled:opacity-50"
            />

            {/* Listening Indicator Overlay */}
            {isListening && (
              <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Listening to speech...
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#07070d]/80 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Mic STT button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={session.isEvaluating || submitting || interviewEnded}
                title={isListening ? 'Stop voice recording' : 'Dictate answer (Speech-to-Text)'}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isListening
                    ? 'bg-red-500/25 border-red-500/50 text-red-300 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-gray-300 hover:text-white'
                }`}
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} className="text-cyan-400" />}
                <span>{isListening ? 'Stop Mic' : 'Voice Input'}</span>
              </button>

              <span className="text-[11px] font-mono text-gray-400 hidden sm:inline">
                Ctrl + Enter to submit
              </span>
            </div>

            {/* Submit Button */}
            <button
              id="submit-answer-btn"
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || session.isEvaluating || submitting || interviewEnded}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-2.5 text-xs font-semibold shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              {submitting || session.isEvaluating ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Submit Answer</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
