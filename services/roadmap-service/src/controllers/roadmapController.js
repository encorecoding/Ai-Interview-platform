const Roadmap = require('../models/Roadmap');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5004';

const DEFAULT_ROADMAP_PHASES = [
  {
    id: 1,
    title: 'Phase 1 — DSA Fundamentals',
    duration: '3 weeks',
    completed: true,
    active: false,
    topics: [
      { name: 'Arrays & Strings', done: true, resources: ["Striver's A2Z Sheet (takeUforward)", 'LeetCode Array problems', 'Neetcode Arrays'] },
      { name: 'Linked Lists', done: true, resources: ["Striver's SDE Sheet (takeUforward)", 'LeetCode Linked List', 'CS Dojo playlist'] },
      { name: 'Stacks & Queues', done: true, resources: ["Striver's A2Z Sheet (takeUforward)", 'LeetCode Stack problems'] },
      { name: 'Hash Maps & Sets', done: true, resources: ["Striver's SDE Sheet (takeUforward)", 'LeetCode Hashing'] },
    ],
  },
  {
    id: 2,
    title: 'Phase 2 — Advanced DSA',
    duration: '4 weeks',
    completed: false,
    active: true,
    topics: [
      { name: 'Trees & BST', done: true, resources: ["Striver's Tree Series (takeUforward)", 'LeetCode Trees', 'Abdul Bari Trees'] },
      { name: 'Graphs & BFS/DFS', done: false, active: true, resources: ["Striver's Graph Series (takeUforward)", 'LeetCode Graph problems'] },
      { name: 'Dynamic Programming', done: false, resources: ["Striver's DP Masterclass (takeUforward)", 'Aditya Kumar DP', 'LeetCode DP'] },
      { name: 'Greedy Algorithms', done: false, resources: ["Striver's SDE Sheet (takeUforward)", 'LeetCode Greedy'] },
      { name: 'Backtracking', done: false, resources: ["Striver's Recursion & Backtracking (takeUforward)", 'LeetCode Backtracking'] },
    ],
  },
  {
    id: 3,
    title: 'Phase 3 — System Design',
    duration: '4 weeks',
    completed: false,
    active: false,
    topics: [
      { name: 'Scalability & Load Balancing', done: false, resources: ['Gaurav Sen YouTube', 'System Design Primer'] },
      { name: 'Caching & CDN', done: false, resources: ['Redis documentation', 'DDIA Book Ch 5'] },
      { name: 'Databases & Sharding', done: false, resources: ['DDIA Book', 'Designing Data-Intensive Applications'] },
      { name: 'Distributed Systems', done: false, resources: ['MIT 6.824', 'DDIA Book'] },
      { name: 'Message Queues', done: false, resources: ['Kafka documentation', 'RabbitMQ guide'] },
    ],
  },
  {
    id: 4,
    title: 'Phase 4 — OS & DBMS Deep Dive',
    duration: '3 weeks',
    completed: false,
    active: false,
    topics: [
      { name: 'Virtual Memory & Paging', done: false, resources: ['Operating System Concepts (Silberschatz)', 'Gate Smashers OS'] },
      { name: 'Process Synchronization', done: false, resources: ['NPTEL OS lectures'] },
      { name: 'ACID & Transactions', done: false, resources: ['PostgreSQL docs', 'MySQL 8.0 reference'] },
      { name: 'Indexing & Query Optimization', done: false, resources: ['Use The Index, Luke'] },
    ],
  },
  {
    id: 5,
    title: 'Phase 5 — Mock Interviews',
    duration: '2 weeks',
    completed: false,
    active: false,
    topics: [
      { name: 'PrepAI Mock Interviews', done: false, resources: ['PrepAI Interview Agent'] },
      { name: 'Peer Mock Interviews', done: false, resources: ['Pramp', 'Interviewing.io'] },
      { name: 'Company-specific Prep', done: false, resources: ['LeetCode Company filter', 'Glassdoor'] },
    ],
  },
];

function calculateProgress(phases) {
  let totalTopics = 0;
  let completedTopics = 0;

  for (const phase of phases) {
    if (phase.topics && phase.topics.length > 0) {
      totalTopics += phase.topics.length;
      completedTopics += phase.topics.filter((t) => t.done).length;
    }
  }

  return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
}

/**
 * GET /api/roadmaps/active
 */
async function getActive(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    let roadmap = await Roadmap.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });

    if (!roadmap) {
      // Create initial active roadmap
      roadmap = await Roadmap.create({
        userId,
        targetRole: 'Software Engineer',
        careerGoal: 'Crack SDE-2 Interview at top tech company',
        estimatedDuration: '16 weeks',
        progress: 28,
        status: 'active',
        phases: DEFAULT_ROADMAP_PHASES,
      });
    }

    return res.json({ roadmap });
  } catch (err) {
    console.error('getActive roadmap error:', err);
    return res.status(500).json({ error: 'Failed to fetch active roadmap' });
  }
}

/**
 * GET /api/roadmaps
 */
async function getAll(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    const roadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 });
    return res.json({ roadmaps });
  } catch (err) {
    console.error('getAll roadmaps error:', err);
    return res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
}

/**
 * GET /api/roadmaps/:id
 */
async function getById(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId });
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }
    return res.json({ roadmap });
  } catch (err) {
    console.error('getById roadmap error:', err);
    return res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
}

/**
 * POST /api/roadmaps/generate
 */
async function generate(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    const { targetRole, resumeId, interviewId, careerGoal } = req.body;

    if (!targetRole) {
      return res.status(400).json({ error: 'targetRole is required' });
    }

    let generatedData = null;
    try {
      const aiRes = await axios.post(
        `${AI_SERVICE_URL}/api/ai/roadmap/generate`,
        { targetRole, careerGoal },
        { timeout: 35000 }
      );
      generatedData = aiRes.data;
    } catch {
      generatedData = {
        targetRole,
        estimatedDuration: '16 weeks',
        phases: DEFAULT_ROADMAP_PHASES,
      };
    }

    // Set any previously active roadmaps to archived
    await Roadmap.updateMany({ userId, status: 'active' }, { status: 'archived' });

    const phases = generatedData.phases || DEFAULT_ROADMAP_PHASES;
    const progress = calculateProgress(phases);

    const roadmap = await Roadmap.create({
      userId,
      targetRole: generatedData.targetRole || targetRole,
      careerGoal: careerGoal || `Master skills for ${targetRole}`,
      estimatedDuration: generatedData.estimatedDuration || '16 weeks',
      progress,
      status: 'active',
      phases,
    });

    return res.status(201).json({ roadmap });
  } catch (err) {
    console.error('generate roadmap error:', err);
    return res.status(500).json({ error: 'Failed to generate roadmap' });
  }
}

/**
 * PATCH /api/roadmaps/:id/progress
 */
async function updateProgress(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    const { phaseIndex, topicIndex, completed } = req.body;

    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId });
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    if (
      roadmap.phases[phaseIndex] &&
      roadmap.phases[phaseIndex].topics[topicIndex] !== undefined
    ) {
      roadmap.phases[phaseIndex].topics[topicIndex].done = !!completed;

      // Check if all topics in this phase are done
      const allDone = roadmap.phases[phaseIndex].topics.every((t) => t.done);
      roadmap.phases[phaseIndex].completed = allDone;

      // Update overall progress
      roadmap.progress = calculateProgress(roadmap.phases);

      // Save changes
      roadmap.markModified('phases');
      await roadmap.save();
    }

    return res.json({ roadmap });
  } catch (err) {
    console.error('updateProgress error:', err);
    return res.status(500).json({ error: 'Failed to update progress' });
  }
}

module.exports = {
  getActive,
  getAll,
  getById,
  generate,
  updateProgress,
};
