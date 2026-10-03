import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, CheckCircle, Lock, ChevronDown, ChevronUp,
  Target, BookOpen, Code2, Brain, Zap, Trophy,
  Loader2, Play, Plus, TrendingUp, Sparkles, Compass,
  ArrowRight, Check, ExternalLink, Bookmark, Flame, Award,
  Youtube, PlayCircle, Video, ListFilter
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { roadmapService } from '../services';
import toast from 'react-hot-toast';

const MOCK_ROADMAP = {
  targetRole: 'Software Engineer (Full Stack & Distributed Systems)',
  progress: 32,
  phases: [
    {
      id: 1,
      title: 'Phase 1 — DSA Fundamentals & Time Complexity',
      duration: '3 weeks',
      completed: true,
      description: 'Master core memory structures, hash tables, and algorithm efficiency analysis.',
      topics: [
        { name: 'Dynamic Arrays, Two Pointers & Sliding Window', done: true, resources: ["Striver's A2Z Sheet (takeUforward)", 'Neetcode Arrays Playlist', 'LeetCode 75'] },
        { name: 'Linked Lists, Fast & Slow Pointers, Cycle Detection', done: true, resources: ["Striver's SDE Sheet (takeUforward)", 'CS Dojo Linked List Playlist', 'LeetCode Linked List'] },
        { name: 'Monotonic Stacks & Queues', done: true, resources: ['Aditya Verma Stack Playlist', "Striver's A2Z Sheet (takeUforward)", 'LeetCode Daily'] },
        { name: 'Hash Map Collision Resolution & Frequency Counting', done: true, resources: ["Striver's SDE Sheet (takeUforward)", 'Neetcode Hashing Playlist'] },
      ],
    },
    {
      id: 2,
      title: 'Phase 2 — Advanced Graph Algorithms & Dynamic Programming',
      duration: '4 weeks',
      completed: false,
      active: true,
      description: 'Navigate complex state machines, memoization tables, and topological graphs.',
      topics: [
        { name: 'Binary Trees, Lowest Common Ancestor & BST Validation', done: true, resources: ["Striver's Tree Series Playlist (takeUforward)", 'Abdul Bari Algorithms Playlist', 'LeetCode Trees'] },
        { name: 'Graphs: BFS, DFS, Topological Sort & Dijkstra', done: true, active: false, resources: ["Striver's Graph Series Playlist (takeUforward)", 'Neetcode Graph Playlist', 'LeetCode Graphs'] },
        { name: '1D & 2D Dynamic Programming (Knapsack, LCS, Grids)', done: false, active: true, resources: ["Striver's DP Masterclass Playlist (takeUforward)", 'Aditya Verma DP Playlist', 'LeetCode DP'] },
        { name: 'Greedy Heuristics & Interval Scheduling', done: false, resources: ["Striver's SDE Sheet (takeUforward)", 'Abdul Bari Greedy Playlist'] },
        { name: 'Backtracking, N-Queens & Subsets', done: false, resources: ["Striver's Recursion & Backtracking Playlist (takeUforward)", 'LeetCode Backtracking'] },
      ],
    },
    {
      id: 3,
      title: 'Phase 3 — High-Scale System Design & Microservices',
      duration: '4 weeks',
      completed: false,
      description: 'Architect fault-tolerant systems handling millions of concurrent operations.',
      topics: [
        { name: 'Horizontal Scalability, L4/L7 Load Balancing & Reverse Proxies', done: false, resources: ['Gaurav Sen System Design Playlist', 'System Design Primer', 'Nginx Docs'] },
        { name: 'Multi-Tier Caching (Redis/Memcached) & Invalidation Strategies', done: false, resources: ['Gaurav Sen Caching Playlist', 'Redis In-Depth', 'DDIA Ch 5'] },
        { name: 'Relational Sharding, Replication Lag & NoSQL Consistency Models', done: false, resources: ['Designing Data-Intensive Applications', 'Arpit Bhayani System Design'] },
        { name: 'Distributed Consensus (Raft/Paxos) & CAP Theorem Realities', done: false, resources: ['MIT 6.824 Distributed Systems Playlist', 'DDIA Book'] },
        { name: 'Event-Driven Architectures & Asynchronous Message Queues', done: false, resources: ['Kafka The Definitive Guide', 'RabbitMQ Video Architecture'] },
      ],
    },
    {
      id: 4,
      title: 'Phase 4 — OS Primitives, Concurrency & DBMS Internals',
      duration: '3 weeks',
      completed: false,
      description: 'Deep dive into virtual memory, thread contention, and B-Tree indexing engines.',
      topics: [
        { name: 'Virtual Memory, Page Faults, TLB & Cache Locality', done: false, resources: ['Gate Smashers OS Playlist', 'OSTEP Book (Remzi)'] },
        { name: 'Thread Synchronization, Mutexes, Semaphores & Deadlock', done: false, resources: ['NPTEL OS Concurrency Playlist', 'Java Concurrency in Practice'] },
        { name: 'ACID Guarantees, MVCC & WAL (Write-Ahead Logging)', done: false, resources: ['Gate Smashers DBMS Playlist', 'PostgreSQL Internals'] },
        { name: 'B+ Tree Indexing vs LSM Trees & Query Optimization', done: false, resources: ['Use The Index Luke', 'Hussein Nasser Database Playlist'] },
      ],
    },
    {
      id: 5,
      title: 'Phase 5 — High-Pressure Mock Drills & Final Calibration',
      duration: '2 weeks',
      completed: false,
      description: 'Simulate high-stakes technical phone screens and on-site engineering loops.',
      topics: [
        { name: 'Carrier Mantra Adaptive AI Technical Screens (Hard Difficulty)', done: false, resources: ['Carrier Mantra Interview Agent', 'Live Voice Mode'] },
        { name: 'System Architecture Whiteboard Defense', done: false, resources: ['Exponent Mock Interview Playlist', 'System Design Drills'] },
        { name: 'Leadership Principles & Cross-Functional Collaboration', done: false, resources: ['Amazon 16 LP Behavioral Guide', 'STAR Method Practice'] },
      ],
    },
  ],
};

const STRIVER_TRACKS = [
  {
    title: "Striver's A2Z DSA Sheet",
    badge: '455 Problems',
    provider: 'takeUforward',
    desc: 'Complete step 1 to 18 roadmap covering fundamentals, recursion, trees, graphs, and dynamic programming.',
    url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    accent: 'border-brand-500/30 text-brand-300',
    btnColor: 'bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 border-brand-500/30'
  },
  {
    title: "Striver's SDE Sheet",
    badge: '191 Top Problems',
    provider: 'takeUforward',
    desc: 'The industry-standard coding interview sheet for Google, Amazon, Microsoft, and high-growth startups.',
    url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/',
    accent: 'border-amber-500/30 text-amber-300',
    btnColor: 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
  },
  {
    title: "Striver's 79 Sheet",
    badge: '79 Core Patterns',
    provider: 'takeUforward',
    desc: 'High-yield rapid interview revision track targeting the most frequent algorithmic patterns and edge cases.',
    url: 'https://takeuforward.org/interview-sheets/strivers-79-last-moment-dsa-sheet-ace-interviews/',
    accent: 'border-emerald-500/30 text-emerald-300',
    btnColor: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
  }
];

const YOUTUBE_PLAYLISTS = [
  {
    id: 'striver-graphs',
    title: "Striver's Complete Graph Series",
    creator: 'takeUforward',
    topic: 'Graphs & BFS/DFS',
    category: 'Graphs',
    videoCount: '56 Videos',
    desc: 'Complete traversal, topological sort, Dijkstra, Bellman-Ford, Floyd-Warshall, Disjoint Sets, and Prim/Kruskal algorithms.',
    url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oE3gA41TKO2rx534qs7eqK',
    featured: true
  },
  {
    id: 'striver-dp',
    title: "Striver's Dynamic Programming Masterclass",
    creator: 'takeUforward',
    topic: 'Dynamic Programming',
    category: 'Dynamic Programming',
    videoCount: '56 Videos',
    desc: '1D DP, 2D Grid DP, DP on Subsequences, DP on Strings, Stocks, LIS, MCM, and Partition DP explained with recursion to space optimization.',
    url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0qUlt5H_kiKGl20_cU8u9UL',
    featured: true
  },
  {
    id: 'striver-trees',
    title: "Striver's Binary Trees & BST Series",
    creator: 'takeUforward',
    topic: 'Trees & BST',
    category: 'Trees',
    videoCount: '45 Videos',
    desc: 'Traversals, views, maximum path sum, lowest common ancestor, diameter, construct from traversals, BST iterator, and recovery.',
    url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0q8Hkd7bK2Bpryj2xVJk8Vk',
    featured: true
  },
  {
    id: 'striver-bs',
    title: "Striver's Binary Search A to Z",
    creator: 'takeUforward',
    topic: 'Binary Search',
    category: 'Arrays & Binary Search',
    videoCount: '32 Videos',
    desc: '1D binary search, search on answers (Koko eating bananas, Book allocation, Aggressive cows), and 2D matrix binary search.',
    url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma',
    featured: false
  },
  {
    id: 'aditya-dp',
    title: 'Aditya Verma Dynamic Programming',
    creator: 'Aditya Verma',
    topic: 'Dynamic Programming',
    category: 'Dynamic Programming',
    videoCount: '50 Videos',
    desc: 'Intuitive pattern-based breakdown of 0-1 Knapsack, Unbounded Knapsack, LCS, Matrix Chain Multiplication, and DP on Trees.',
    url: 'https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqh307U4EYxEGE4SyVDlo',
    featured: false
  },
  {
    id: 'aditya-stack',
    title: 'Aditya Verma Stack Series',
    creator: 'Aditya Verma',
    topic: 'Monotonic Stacks & Queues',
    category: 'Arrays & Binary Search',
    videoCount: '15 Videos',
    desc: 'Nearest greater to left/right, stock span problem, maximum area histogram, and rain water trapping patterns.',
    url: 'https://www.youtube.com/playlist?list=PL_z_8CaSLPWdeOezg68SKkeQI4-Z_j2hW',
    featured: false
  },
  {
    id: 'abdul-bari-algo',
    title: 'Abdul Bari Algorithms Masterclass',
    creator: 'Abdul Bari',
    topic: 'Analysis & Core Paradigms',
    category: 'Core Algorithms',
    videoCount: '84 Videos',
    desc: 'Foundational asymptotic analysis, Divide & Conquer, Greedy method, Dynamic Programming, and Backtracking mathematical proofs.',
    url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O',
    featured: false
  },
  {
    id: 'neetcode-150',
    title: 'NeetCode Blind 75 / 150 Explained',
    creator: 'NeetCode',
    topic: 'All Top LeetCode Patterns',
    category: 'All',
    videoCount: '150 Videos',
    desc: 'Crystal clear Python and visual walkthroughs of the 150 most common technical coding interview problems.',
    url: 'https://www.youtube.com/@NeetCode/playlists',
    featured: false
  },
  {
    id: 'gaurav-sen-sysdesign',
    title: 'Gaurav Sen System Design Primer',
    creator: 'Gaurav Sen',
    topic: 'System Design & Scalability',
    category: 'System Design',
    videoCount: '25 Videos',
    desc: 'High-level architectural breakdowns: load balancing, consistent hashing, caching, rate limiting, and database sharding.',
    url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX',
    featured: false
  },
  {
    id: 'gate-smashers-os',
    title: 'Gate Smashers Operating Systems',
    creator: 'Gate Smashers',
    topic: 'OS Primitives & Memory',
    category: 'OS & DBMS',
    videoCount: '90 Videos',
    desc: 'Comprehensive visual explanations of process scheduling, semaphores, deadlock algorithms, paging, and virtual memory.',
    url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p',
    featured: false
  }
];

const SUGGESTED_ROLES = [
  'Senior Software Engineer',
  'Software Engineer (Striver SDE Track)',
  'Distributed Systems Engineer',
  'Full Stack Architect',
  'Machine Learning Engineer'
];

function getResourceLink(resourceName: string): { url: string; isYoutube: boolean; isStriver: boolean } {
  const lower = resourceName.toLowerCase();
  if (lower.includes('graph') && (lower.includes('striver') || lower.includes('takeuforward'))) {
    return { url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oE3gA41TKO2rx534qs7eqK', isYoutube: true, isStriver: true };
  }
  if (lower.includes('dp') && (lower.includes('striver') || lower.includes('takeuforward'))) {
    return { url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0qUlt5H_kiKGl20_cU8u9UL', isYoutube: true, isStriver: true };
  }
  if (lower.includes('tree') && (lower.includes('striver') || lower.includes('takeuforward'))) {
    return { url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0q8Hkd7bK2Bpryj2xVJk8Vk', isYoutube: true, isStriver: true };
  }
  if (lower.includes('sde sheet') && lower.includes('striver')) {
    return { url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', isYoutube: false, isStriver: true };
  }
  if (lower.includes('a2z') && lower.includes('striver')) {
    return { url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/', isYoutube: false, isStriver: true };
  }
  if (lower.includes('aditya verma') && lower.includes('dp')) {
    return { url: 'https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqh307U4EYxEGE4SyVDlo', isYoutube: true, isStriver: false };
  }
  if (lower.includes('aditya verma') && lower.includes('stack')) {
    return { url: 'https://www.youtube.com/playlist?list=PL_z_8CaSLPWdeOezg68SKkeQI4-Z_j2hW', isYoutube: true, isStriver: false };
  }
  if (lower.includes('abdul bari')) {
    return { url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O', isYoutube: true, isStriver: false };
  }
  if (lower.includes('gaurav sen')) {
    return { url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX', isYoutube: true, isStriver: false };
  }
  if (lower.includes('gate smashers')) {
    return { url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p', isYoutube: true, isStriver: false };
  }
  if (lower.includes('neetcode')) {
    return { url: 'https://www.youtube.com/@NeetCode/playlists', isYoutube: true, isStriver: false };
  }
  if (lower.includes('cs dojo')) {
    return { url: 'https://www.youtube.com/c/CSDojo/playlists', isYoutube: true, isStriver: false };
  }
  if (lower.includes('mit 6.824')) {
    return { url: 'https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB', isYoutube: true, isStriver: false };
  }
  if (lower.includes('system design primer')) {
    return { url: 'https://github.com/donnemartin/system-design-primer', isYoutube: false, isStriver: false };
  }
  if (lower.includes('leetcode')) {
    return { url: 'https://leetcode.com/problemset/all/', isYoutube: false, isStriver: false };
  }

  return { url: `https://www.youtube.com/results?search_query=${encodeURIComponent(resourceName + ' dsa tutorial')}`, isYoutube: true, isStriver: false };
}

function PhaseTimelineNode({
  phase,
  index,
  totalPhases,
  onToggleTopic
}: {
  phase: any;
  index: number;
  totalPhases: number;
  onToggleTopic: (phaseId: number, topicIndex: number) => void;
}) {
  const [open, setOpen] = useState(phase.active || phase.completed);
  const completedCount = phase.topics.filter((t: any) => t.done).length;
  const progressPct = Math.round((completedCount / phase.topics.length) * 100);
  const isLast = index === totalPhases - 1;

  return (
    <div className="relative pl-8 sm:pl-12">
      {/* Vertical glowing connecting line */}
      {!isLast && (
        <div
          className={`absolute left-[15px] sm:left-[23px] top-10 bottom-0 w-[2px] transition-colors ${
            phase.completed
              ? 'bg-gradient-to-b from-emerald-500/60 to-emerald-500/20'
              : phase.active
              ? 'bg-gradient-to-b from-brand-500/80 to-surface-700/50'
              : 'bg-white/[0.08]'
          }`}
        />
      )}

      {/* Node indicator */}
      <div
        className={`absolute left-0 sm:left-2 top-3 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
          phase.completed
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            : phase.active
            ? 'bg-brand-950/80 border-brand-400 text-brand-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-pulse'
            : 'bg-surface-900 border-white/20 text-gray-500'
        }`}
      >
        {phase.completed ? (
          <Check size={14} className="stroke-[3]" />
        ) : phase.active ? (
          <Play size={12} className="fill-brand-400 text-brand-400 ml-0.5" />
        ) : (
          <Lock size={12} />
        )}
      </div>

      {/* Phase Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        className={`glass-card overflow-hidden transition-all duration-300 mb-6 ${
          phase.active
            ? 'border-brand-500/40 shadow-[0_10px_35px_rgba(59,130,246,0.1)]'
            : phase.completed
            ? 'border-emerald-500/20'
            : 'hover:border-white/15'
        }`}
      >
        {/* Card Header Accordion */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-semibold">
                Phase {index + 1}
              </span>
              {phase.active && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-brand-500/20 border border-brand-500/40 text-brand-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
                  Active Milestone
                </span>
              )}
              {phase.completed && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  Completed
                </span>
              )}
              <span className="text-xs font-mono text-gray-500 ml-auto sm:ml-0">{phase.duration}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{phase.title}</h3>
            {phase.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">{phase.description}</p>
            )}

            {/* Progress bar */}
            <div className="flex items-center gap-3 mt-3 max-w-md">
              <div className="flex-1 bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    phase.completed
                      ? 'bg-emerald-400'
                      : 'bg-gradient-to-r from-brand-500 to-indigo-400'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs font-mono text-gray-400">
                {completedCount}/{phase.topics.length}
              </span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 flex-shrink-0 mt-1 sm:mt-0">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* Phase Topics List */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-white/[0.04] px-5 sm:px-6 pb-6 pt-3 space-y-2.5"
            >
              {phase.topics.map((topic: any, i: number) => {
                const isCurrent = topic.active && !topic.done;
                return (
                  <div
                    key={i}
                    onClick={() => onToggleTopic(phase.id, i)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      topic.done
                        ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-gray-400 hover:bg-emerald-500/[0.08]'
                        : isCurrent
                        ? 'bg-brand-500/[0.08] border-brand-500/40 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'bg-white/[0.02] border-white/[0.06] text-gray-200 hover:bg-white/[0.05] hover:border-white/15'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTopic(phase.id, i);
                      }}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        topic.done
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-white/20 hover:border-brand-400 bg-white/[0.04]'
                      }`}
                    >
                      {topic.done && <Check size={12} className="stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-semibold ${topic.done ? 'line-through text-gray-500' : isCurrent ? 'text-brand-300' : 'text-gray-100'}`}>
                          {topic.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40">
                            Current Focus
                          </span>
                        )}
                      </div>

                      {topic.resources && topic.resources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {topic.resources.map((r: string, rIdx: number) => {
                            const meta = getResourceLink(r);
                            return (
                              <a
                                key={rIdx}
                                href={meta.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1.5 transition-all hover:scale-105 ${
                                  meta.isStriver
                                    ? 'bg-gradient-to-r from-brand-500/15 to-purple-500/15 text-brand-300 border-brand-500/35 hover:border-brand-400 font-semibold shadow-sm'
                                    : meta.isYoutube
                                    ? 'bg-red-500/10 text-red-300 border-red-500/25 hover:bg-red-500/20 hover:border-red-500/40'
                                    : 'bg-white/[0.04] text-gray-300 border-white/[0.06] hover:bg-white/[0.08] hover:border-white/20'
                                }`}
                                title={`Open: ${r}`}
                              >
                                {meta.isStriver ? (
                                  <Flame size={10} className="text-amber-400 flex-shrink-0" />
                                ) : meta.isYoutube ? (
                                  <Youtube size={10} className="text-red-400 flex-shrink-0" />
                                ) : (
                                  <Bookmark size={10} className="text-gray-400 flex-shrink-0" />
                                )}
                                <span className="truncate max-w-[200px]">{r}</span>
                                <ExternalLink size={9} className="opacity-60 flex-shrink-0" />
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<any>(MOCK_ROADMAP);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [selectedPlaylistCategory, setSelectedPlaylistCategory] = useState('All');

  useEffect(() => {
    roadmapService.getActive()
      .then((res) => {
        if (res.data?.roadmap) setRoadmap(res.data.roadmap);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (roleOverride?: string) => {
    const roleToUse = roleOverride || targetRole;
    if (!roleToUse.trim()) {
      toast.error('Please enter a target role');
      return;
    }
    setGenerating(true);
    try {
      const res = await roadmapService.generate({ targetRole: roleToUse });
      setRoadmap(res.data?.roadmap || MOCK_ROADMAP);
      toast.success(`Generated personalized roadmap for ${roleToUse}!`);
    } catch {
      toast('Generated demo roadmap curriculum — connect AI service for customized paths', { icon: 'ℹ️' });
      setRoadmap({ ...MOCK_ROADMAP, targetRole: roleToUse });
    } finally {
      setGenerating(false);
      setTargetRole('');
    }
  };

  const handleToggleTopic = (phaseId: number, topicIndex: number) => {
    const phaseIndex = roadmap.phases?.findIndex((p: any) => p.id === phaseId);
    if (phaseIndex !== -1 && roadmap.phases?.[phaseIndex]?.topics?.[topicIndex]) {
      const currentDone = roadmap.phases[phaseIndex].topics[topicIndex].done;
      if (roadmap?._id) {
        roadmapService.updateProgress(
          roadmap._id,
          phaseIndex,
          topicIndex,
          !currentDone
        ).catch(() => {});
      }
    }

    setRoadmap((prev: any) => ({
      ...prev,
      phases: prev.phases.map((p: any) =>
        p.id === phaseId
          ? {
              ...p,
              topics: p.topics.map((t: any, i: number) =>
                i === topicIndex ? { ...t, done: !t.done } : t
              ),
            }
          : p
      ),
    }));
  };

  // Calculations
  const totalTopics = roadmap?.phases?.reduce((acc: number, p: any) => acc + p.topics.length, 0) || 0;
  const doneTopics = roadmap?.phases?.reduce((acc: number, p: any) => acc + p.topics.filter((t: any) => t.done).length, 0) || 0;
  const overallProgress = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;

  // Filtered Playlists
  const playlistCategories = ['All', 'Graphs', 'Dynamic Programming', 'Trees', 'Arrays & Binary Search', 'System Design'];
  const filteredPlaylists = selectedPlaylistCategory === 'All'
    ? YOUTUBE_PLAYLISTS
    : YOUTUBE_PLAYLISTS.filter((p) => p.category === selectedPlaylistCategory || p.category === 'All');

  if (loading) {
    return (
      <AppLayout>
        <div className="h-[70vh] flex items-center justify-center">
          <div className="text-center p-8 rounded-2xl glass-card">
            <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-white">Synthesizing Career Graph & Skill Curriculum...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Roadmap Command Hero */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-white/10 bg-gradient-to-r from-surface-900/90 via-surface-850/80 to-purple-950/40 backdrop-blur-xl shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  <Compass size={12} className="text-purple-400" />
                  Personalized Career Graph
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {roadmap.phases?.length || 5} Mastery Phases
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {roadmap.targetRole}
              </h1>
              <p className="text-sm text-gray-400 mt-1 max-w-lg">
                Curated learning graph synthesized to eliminate skill bottlenecks, featuring verified YouTube DSA video series and Striver's sheets.
              </p>
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 p-4 rounded-2xl backdrop-blur-md self-start md:self-auto">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-white/10 fill-none"
                    strokeWidth="5"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-brand-400 fill-none transition-all duration-1000 ease-out"
                    strokeWidth="5"
                    strokeDasharray={163.36}
                    strokeDashoffset={163.36 - (163.36 * overallProgress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-mono font-black text-white">{overallProgress}%</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Curriculum Progress</p>
                <p className="text-base font-bold text-white font-mono">{doneTopics} / {totalTopics}</p>
                <p className="text-[11px] text-brand-400">Topics Mastered</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured Striver DSA Sheet Showcase from takeUforward */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="relative overflow-hidden rounded-2xl p-6 border border-brand-500/30 bg-gradient-to-r from-brand-950/40 via-surface-900/80 to-purple-950/30 backdrop-blur-xl shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300">
                  <Flame size={12} className="text-amber-400 animate-pulse" />
                  Featured Partner • takeUforward
                </span>
                <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                  By Raj Vikramaditya (Striver)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Striver's DSA Preparation Sheets
              </h2>
              <p className="text-xs text-gray-300 mt-1 max-w-xl">
                The most respected algorithmic interview preparation tracks in the industry, integrated directly into your Carrier Mantra learning path.
              </p>
            </div>

            <a
              href="https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-gray-200 transition-all self-start sm:self-center"
            >
              <span>Visit takeUforward.org</span>
              <ExternalLink size={13} className="text-gray-400" />
            </a>
          </div>

          {/* 3 Striver Track Cards */}
          <div className="grid sm:grid-cols-3 gap-3.5">
            {STRIVER_TRACKS.map((track) => (
              <div
                key={track.title}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-300 border border-white/10">
                      {track.badge}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">{track.provider}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{track.title}</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed mb-3">{track.desc}</p>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <a
                    href={track.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[11px] font-mono px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${track.btnColor}`}
                  >
                    <span>Open Sheet</span>
                    <ExternalLink size={11} />
                  </a>

                  <button
                    onClick={() => handleGenerate(`Software Engineer (${track.title})`)}
                    className="text-[11px] font-mono text-gray-400 hover:text-white px-2 py-1 transition-colors"
                    title="Set as target roadmap"
                  >
                    + Apply Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* YouTube Video Playlists Module by Topic */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="glass-card p-6 border border-red-500/20 bg-gradient-to-r from-red-950/20 via-surface-900/90 to-surface-850/80"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-red-500/15 border border-red-500/35 text-red-300">
                  <Youtube size={12} className="text-red-400" />
                  Curated Video Masterclasses
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {YOUTUBE_PLAYLISTS.length} Top Playlists
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Recommended YouTube DSA Playlists by Topic
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Direct links to complete video playlists from top educators: Striver (takeUforward), Aditya Verma, Abdul Bari, NeetCode & Gaurav Sen.
              </p>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {playlistCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedPlaylistCategory(cat)}
                className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border transition-all ${
                  selectedPlaylistCategory === cat
                    ? 'bg-red-500/20 border-red-500/50 text-red-200 font-semibold shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                    : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Video Playlist Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPlaylists.map((pl) => (
              <div
                key={pl.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-red-500/30 hover:bg-white/[0.04] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20">
                      <PlayCircle size={10} className="text-red-400" />
                      {pl.videoCount}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{pl.creator}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-red-200 transition-colors">
                    {pl.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed mb-3">{pl.desc}</p>
                </div>

                <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-500">{pl.topic}</span>
                  <a
                    href={pl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-semibold transition-all shadow-sm"
                  >
                    <Youtube size={12} className="text-red-400" />
                    <span>Watch Playlist</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Generate / Switch Curriculum Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Brain size={14} className="text-brand-400" />
              Recalibrate Target Architecture
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Software Engineer (Striver SDE Track), Staff Distributed Systems Engineer..."
              className="input-field flex-1 text-xs sm:text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={() => handleGenerate()}
              disabled={generating || !targetRole.trim()}
              id="generate-roadmap-btn"
              className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap text-xs font-semibold py-2.5 px-5 shadow-glow-sm"
            >
              {generating ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
              Generate Path
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.04]">
            <span className="text-[10px] font-mono text-gray-500 mr-1">Quick Presets:</span>
            {SUGGESTED_ROLES.map((role) => (
              <button
                key={role}
                onClick={() => handleGenerate(role)}
                className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-1"
              >
                {role.includes('Striver') && <Flame size={10} className="text-amber-400" />}
                <span>+ {role}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Vertical Connected Node Timeline */}
        <div className="pt-2">
          {roadmap.phases.map((phase: any, index: number) => (
            <PhaseTimelineNode
              key={phase.id}
              phase={phase}
              index={index}
              totalPhases={roadmap.phases.length}
              onToggleTopic={handleToggleTopic}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
