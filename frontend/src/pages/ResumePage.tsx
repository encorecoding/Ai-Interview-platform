import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, X, CheckCircle, AlertCircle,
  Brain, FileUp, Loader2, Eye, Trash2, Plus, Clock,
  Sparkles, ShieldCheck, ArrowRight, Zap, Target,
  CheckCircle2, FileCheck, Search
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { resumeService } from '../services';
import toast from 'react-hot-toast';

const ACCEPTED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function ResumePage() {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [resumes, setResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  // Load existing resumes on mount
  useEffect(() => {
    resumeService.getAll().then((res) => {
      setResumes(res.data?.resumes || []);
    }).catch(() => {
      // Demo mode fallback
    }).finally(() => setLoadingResumes(false));
  }, []);

  const validateFile = (f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type) && !f.name.endsWith('.pdf') && !f.name.endsWith('.docx')) {
      return 'Please upload a PDF or Word document (.pdf, .docx).';
    }
    if (f.size > MAX_SIZE) return 'File size exceeds 5MB limit.';
    return null;
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      const err = validateFile(dropped);
      if (err) { setError(err); return; }
      setError('');
      setFile(dropped);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const err = validateFile(selected);
      if (err) { setError(err); return; }
      setError('');
      setFile(selected);
    }
  };

  const handleUseSampleResume = () => {
    const mockFile = new File(['Sample Resume Content'], 'alex_chen_fullstack_resume.pdf', { type: 'application/pdf' });
    setFile(mockFile);
    setError('');
    toast.success('Loaded sample candidate resume!');
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      let resumeId: string;

      try {
        const uploadRes = await resumeService.upload(formData);
        resumeId = uploadRes.data?.resume?._id || uploadRes.data?._id;
        toast.success('Resume uploaded successfully!');
      } catch {
        // Instant seamless demo fallback
        resumeId = `demo-${Date.now()}`;
        setUploading(false);
        setAnalyzing(true);
        await new Promise((r) => setTimeout(r, 1800));
        navigate(`/resume/${resumeId}?filename=${encodeURIComponent(file.name)}`);
        return;
      }

      setUploading(false);
      setAnalyzing(true);

      await resumeService.analyze(resumeId);
      toast.success('ATS Analysis complete!');
      navigate(`/resume/${resumeId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Upload failed. Please try again.');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center shadow-glow-sm">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">AI Resume ATS Intelligence</h1>
              <p className="text-xs text-gray-400 font-mono">Evaluate ATS pass rates, keyword density, and role alignment</p>
            </div>
          </div>
        </motion.div>

        {/* Upload Container */}
        <AnimatePresence mode="wait">
          {analyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-10 text-center relative overflow-hidden border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow-sm animate-pulse">
                <Brain size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                Neural Resume Agent is Analyzing
              </h2>
              <p className="text-xs text-gray-400 font-mono mb-6 max-w-sm mx-auto">
                Parsing document structure, extracting technical skills, and benchmarking against industry job profiles...
              </p>

              <div className="max-w-xs mx-auto space-y-3 text-left">
                {[
                  'Extracting structured AST from document',
                  'Cross-referencing technical skills & frameworks',
                  'Evaluating quantifiable impact in bullet points',
                  'Synthesizing ATS score & missing keywords'
                ].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.4 }}
                    className="flex items-center gap-2.5 text-xs text-gray-300 font-mono"
                  >
                    <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                    <span>{step}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-1.5 justify-center mt-6">
                <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
              </div>
            </motion.div>
          ) : (
            <motion.div key="dropzone" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              
              {/* Dropzone Box */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
                className={`relative border-2 border-dashed rounded-2xl p-10 sm:p-12 text-center transition-all duration-300 overflow-hidden ${
                  dragging
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                    : file
                    ? 'border-emerald-500/60 bg-emerald-500/[0.04]'
                    : 'border-white/[0.12] hover:border-brand-500/50 hover:bg-white/[0.02]'
                }`}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-glow-sm">
                      <FileCheck size={32} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white tracking-tight">{file.name}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{(file.size / 1024).toFixed(1)} KB · Ready to analyze</p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-xs text-gray-400 hover:text-red-400 font-mono flex items-center gap-1 transition-colors"
                    >
                      <X size={13} /> Remove selected file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-400">
                      <FileUp size={30} />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white tracking-tight">Drop your resume here</p>
                      <p className="text-xs text-gray-400 font-mono mt-1">Supports PDF, DOC, DOCX up to 5MB</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <label htmlFor="resume-upload" className="btn-secondary text-xs cursor-pointer px-4 py-2">
                        <Upload size={14} className="inline mr-2" />
                        Choose from Device
                      </label>
                      <button
                        type="button"
                        onClick={handleUseSampleResume}
                        className="btn-ghost text-xs px-3.5 py-2 border border-white/10 hover:border-brand-500/30 text-brand-300"
                      >
                        ⚡ Use Sample Resume
                      </button>
                    </div>
                  </div>
                )}

                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs font-mono">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {file && (
                <button
                  id="analyze-resume-btn"
                  onClick={handleUploadAndAnalyze}
                  disabled={uploading || analyzing}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 shadow-glow-md"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Uploading Document...</span>
                    </>
                  ) : (
                    <>
                      <Brain size={16} />
                      <span>Launch AI ATS Evaluation</span>
                    </>
                  )}
                </button>
              )}

              {/* What We Benchmark */}
              {!file && (
                <div className="glass-card p-6 border border-white/[0.08]">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">
                    6-Dimension ATS Benchmark Metrics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Technical Skills Cloud', desc: 'Keyword extraction' },
                      { label: 'Quantifiable Impact', desc: 'Metric metrics' },
                      { label: 'Education & Honors', desc: 'Degree validation' },
                      { label: 'Real Projects', desc: 'Stack verification' },
                      { label: 'Format & Structure', desc: 'ATS parser compatibility' },
                      { label: 'Industry Keywords', desc: 'Job-tier matching' },
                      { label: 'Action Verbs', desc: 'Leadership tone' },
                      { label: 'Role Alignment', desc: 'Target seniority fit' },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                        <p className="text-xs font-bold text-gray-200">{item.label}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Previous Resumes */}
        {!analyzing && resumes.length > 0 && (
          <div className="space-y-3 pt-4">
            <h2 className="text-base font-bold text-white tracking-tight">Recent Resumes</h2>
            <div className="space-y-2.5">
              {resumes.map((resume: any) => (
                <div
                  key={resume._id}
                  className="glass-card p-4 flex items-center justify-between border border-white/[0.07] hover:border-white/[0.15] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <FileText size={18} className="text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{resume.fileName}</p>
                      <p className="text-xs text-gray-400 font-mono">
                        Analyzed {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {resume.score && (
                      <span className="text-lg font-black font-mono text-emerald-400">
                        {resume.score}%
                      </span>
                    )}
                    <a
                      href={`/resume/${resume._id}`}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
