import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Shield, Palette, Globe,
  Moon, Sun, Monitor, ChevronRight, Save, Loader2,
  Sliders, SlidersHorizontal, Sparkles, Check
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'en',
    notifications: {
      interviewReminders: true,
      feedbackUpdates: true,
      progressReports: false,
      emails: false,
    },
    interview: {
      defaultDifficulty: 'Medium',
      defaultDuration: 30,
      showTips: true,
      aiEvaluationFeedback: true,
      voiceTtsEnabled: true,
      speechRecognitionEnabled: true,
    },
    privacy: {
      shareProgress: false,
      analyticsOptIn: true,
    },
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Workspace preferences saved!');
    setSaving(false);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
        checked ? 'bg-brand-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-white/10'
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono text-brand-400 uppercase tracking-wider font-semibold">Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Workspace Configuration
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Configure audio engines, notification thresholds, and AI interview defaults</p>
        </motion.div>

        <div className="space-y-5">
          {/* Interview Runtime Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <SlidersHorizontal size={16} className="text-brand-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Interview Session Defaults</h2>
                <p className="text-xs text-gray-400">Control default difficulty, duration, and AI behavior</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Default Difficulty</label>
                  <select
                    value={settings.interview.defaultDifficulty}
                    onChange={(e) => setSettings((s) => ({ ...s, interview: { ...s.interview, defaultDifficulty: e.target.value } }))}
                    className="input-field text-xs sm:text-sm"
                  >
                    <option value="Easy">Easy (Foundational)</option>
                    <option value="Medium">Medium (Industry Standard)</option>
                    <option value="Hard">Hard (Staff / Principal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Default Session Duration</label>
                  <select
                    value={settings.interview.defaultDuration}
                    onChange={(e) => setSettings((s) => ({ ...s, interview: { ...s.interview, defaultDuration: parseInt(e.target.value) } }))}
                    className="input-field text-xs sm:text-sm"
                  >
                    {[15, 30, 45, 60].map((d) => (
                      <option key={d} value={d}>{d} minutes ({Math.round(d / 4)} questions)</option>
                    ))}
                  </select>
                </div>
              </div>

              {[
                { label: 'Real-time Answer Scoring', desc: 'Display instant evaluation feedback after each submitted response', key: 'aiEvaluationFeedback' },
                { label: 'Display Answer Scaffold Tips', desc: 'Show quick scaffolds (+ Technical Breakdown, + STAR Method) in response editor', key: 'showTips' },
                { label: 'Web Speech Audio Synthesis (TTS)', desc: 'Automatically speak out questions using synthetic voice', key: 'voiceTtsEnabled' },
                { label: 'Microphone Dictation (STT)', desc: 'Allow answering questions verbally via speech recognition', key: 'speechRecognitionEnabled' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2 border-t border-white/[0.04] first:border-0">
                  <div className="pr-4">
                    <p className="text-xs font-semibold text-white">{item.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle
                    checked={settings.interview[item.key as keyof typeof settings.interview] as boolean}
                    onChange={() => setSettings((s) => ({
                      ...s,
                      interview: { ...s.interview, [item.key]: !s.interview[item.key as keyof typeof s.interview] },
                    }))}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Bell size={16} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Notification Channels</h2>
                <p className="text-xs text-gray-400">Control system alerts and progress telemetry</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Interview Cadence Reminders', desc: 'Receive automated reminders to maintain preparation streak', key: 'interviewReminders' },
                { label: 'Feedback Diagnostic Readiness', desc: 'Get alerted as soon as the Feedback Agent completes synthesis', key: 'feedbackUpdates' },
                { label: 'Weekly Performance Summaries', desc: 'Digest of technical score velocity and completed roadmap milestones', key: 'progressReports' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <div className="pr-4">
                    <p className="text-xs font-semibold text-white">{item.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle
                    checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                    onChange={() => setSettings((s) => ({
                      ...s,
                      notifications: { ...s.notifications, [item.key]: !s.notifications[item.key as keyof typeof s.notifications] },
                    }))}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Privacy & Telemetry */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Shield size={16} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Privacy & Data Sharing</h2>
                <p className="text-xs text-gray-400">Configure anonymous telemetry and performance sharing</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Anonymous Model Calibration', desc: 'Allow Carrier Mantra to use de-identified answer evaluations to refine grading algorithms', key: 'shareProgress' },
                { label: 'Telemetry & Error Diagnostics', desc: 'Transmit crash reports and latency signals to enhance platform reliability', key: 'analyticsOptIn' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <div className="pr-4">
                    <p className="text-xs font-semibold text-white">{item.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle
                    checked={settings.privacy[item.key as keyof typeof settings.privacy]}
                    onChange={() => setSettings((s) => ({
                      ...s,
                      privacy: { ...s.privacy, [item.key]: !s.privacy[item.key as keyof typeof s.privacy] },
                    }))}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            id="save-settings-btn"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold shadow-glow-sm"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Workspace Configuration
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
