/**
 * Roadmap Agent
 *
 * Creates personalized learning roadmaps based on:
 * - Resume analysis (existing skills)
 * - Interview results (weak areas)
 * - Target role requirements
 * - Career goals
 *
 * Workflow:
 * AnalyzeSkillGap → IdentifyMissingSkills → PrioritizeSkills → CreatePhases → GenerateTopics
 */

const { isAIAvailable, generateText } = require('../../providers/llmProvider');

const ROADMAP_PROMPT = `You are a senior software engineering mentor creating a personalized learning roadmap.

Candidate Profile:
Target Role: {targetRole}
Existing Skills: {existingSkills}
Weak Areas (from interviews): {weakAreas}
Career Goal: {careerGoal}

Create a realistic, phased learning roadmap in this JSON format:
{{
  "targetRole": "{targetRole}",
  "estimatedDuration": "X weeks",
  "phases": [
    {{
      "id": 1,
      "title": "Phase 1 — Descriptive Title",
      "duration": "X weeks",
      "completed": false,
      "topics": [
        {{
          "name": "Topic Name",
          "done": false,
          "resources": ["Resource 1", "Resource 2"]
        }}
      ]
    }}
  ]
}}

Guidelines:
- Create 4-6 phases progressing from fundamentals to advanced
- Prioritize weak areas identified from interviews
- Include specific, real resources (LeetCode, books, courses, etc.)
- First phase should be completable in 2-3 weeks
- Be realistic about what a candidate needs to learn
- Tailor specifically for the target role

Respond with valid JSON only.`;

const DEFAULT_ROADMAPS = {
  'Software Engineer': [
    {
      id: 1, title: 'Phase 1 — DSA Fundamentals', duration: '3 weeks',
      topics: [
        { name: 'Arrays & Strings', resources: ['LeetCode Array problems (Easy)', 'Neetcode Arrays playlist'] },
        { name: 'Linked Lists', resources: ['LeetCode Linked List', 'CS Dojo playlist'] },
        { name: 'Stacks & Queues', resources: ['LeetCode Stack problems'] },
        { name: 'Hash Maps & Sets', resources: ['LeetCode Hashing', 'Neetcode Hashing'] },
      ],
    },
    {
      id: 2, title: 'Phase 2 — Advanced DSA', duration: '4 weeks',
      topics: [
        { name: 'Trees & BST', resources: ['LeetCode Trees', 'Abdul Bari Trees playlist'] },
        { name: 'Graphs & BFS/DFS', resources: ['LeetCode Graph problems', 'Neetcode Graphs'] },
        { name: 'Dynamic Programming', resources: ['LeetCode DP', 'Aditya Kumar DP playlist'] },
        { name: 'Greedy Algorithms', resources: ['LeetCode Greedy'] },
        { name: 'Backtracking', resources: ['LeetCode Backtracking', 'Neetcode Backtracking'] },
      ],
    },
    {
      id: 3, title: 'Phase 3 — System Design', duration: '4 weeks',
      topics: [
        { name: 'Scalability & Load Balancing', resources: ['Gaurav Sen YouTube', 'System Design Primer GitHub'] },
        { name: 'Caching & CDN', resources: ['Redis documentation', 'Cloudflare Learning Center'] },
        { name: 'Databases & Sharding', resources: ['DDIA Book Ch 5-6', 'Designing Data-Intensive Applications'] },
        { name: 'Distributed Systems', resources: ['MIT 6.824 course', 'DDIA Book'] },
        { name: 'Message Queues & Event Streaming', resources: ['Kafka documentation', 'RabbitMQ guide'] },
      ],
    },
    {
      id: 4, title: 'Phase 4 — Core CS Fundamentals', duration: '3 weeks',
      topics: [
        { name: 'Virtual Memory & Paging', resources: ['Operating System Concepts (Silberschatz)', 'Gate Smashers OS'] },
        { name: 'Process Synchronization & Deadlock', resources: ['NPTEL OS lectures'] },
        { name: 'Database Transactions & ACID', resources: ['PostgreSQL docs', 'High Performance MySQL'] },
        { name: 'Indexing & Query Optimization', resources: ['Use The Index, Luke (free book)'] },
      ],
    },
    {
      id: 5, title: 'Phase 5 — Mock Interviews & Refinement', duration: '2 weeks',
      topics: [
        { name: 'PrepAI AI Mock Interviews', resources: ['PrepAI Interview Agent — Technical Hard'] },
        { name: 'Peer Mock Interviews', resources: ['Pramp', 'Interviewing.io'] },
        { name: 'Company-specific Preparation', resources: ['LeetCode Company filter', 'Glassdoor reviews'] },
        { name: 'Resume Finalization', resources: ['PrepAI Resume Agent'] },
      ],
    },
  ],
  'ML Engineer': [
    {
      id: 1, title: 'Phase 1 — Python & Mathematics', duration: '3 weeks',
      topics: [
        { name: 'Python for ML', resources: ['Python Official docs', 'Real Python tutorials'] },
        { name: 'Linear Algebra', resources: ['3Blue1Brown Essence of Linear Algebra', 'Gilbert Strang lectures'] },
        { name: 'Statistics & Probability', resources: ['StatQuest YouTube', 'Khan Academy Stats'] },
        { name: 'Calculus for ML', resources: ['3Blue1Brown Essence of Calculus'] },
      ],
    },
    {
      id: 2, title: 'Phase 2 — Core ML Algorithms', duration: '4 weeks',
      topics: [
        { name: 'Supervised Learning', resources: ['scikit-learn docs', 'Hands-On ML (Géron)'] },
        { name: 'Neural Networks Basics', resources: ['fast.ai course', 'Neural Networks Zero to Hero'] },
        { name: 'Deep Learning', resources: ['deeplearning.ai specialization', 'PyTorch tutorials'] },
        { name: 'Model Evaluation & Tuning', resources: ['scikit-learn user guide'] },
      ],
    },
  ],
};

async function generateRoadmap({ targetRole, existingSkills = [], weakAreas = [], careerGoal = '' }) {
  if (isAIAvailable()) {
    try {
      const prompt = ROADMAP_PROMPT
        .replace(/{targetRole}/g, targetRole)
        .replace('{existingSkills}', existingSkills.join(', ') || 'Not specified')
        .replace('{weakAreas}', weakAreas.join(', ') || 'None identified')
        .replace('{careerGoal}', careerGoal || `Become a ${targetRole}`);

      const response = await generateText(prompt, { temperature: 0.5, maxTokens: 4000 });
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Normalize phases to add done: false and resources if missing
        if (parsed.phases) {
          parsed.phases = parsed.phases.map((phase, i) => ({
            ...phase,
            id: i + 1,
            completed: false,
            active: i === 0,
            topics: (phase.topics || []).map((t) => ({
              ...t,
              done: false,
              resources: t.resources || [],
            })),
          }));
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Roadmap AI generation failed:', err.message);
    }
  }

  // Fallback: use predefined roadmap
  const roleKey = Object.keys(DEFAULT_ROADMAPS).find(
    (key) => key.toLowerCase().includes(targetRole.toLowerCase().split(' ')[0])
  ) || 'Software Engineer';

  const phases = DEFAULT_ROADMAPS[roleKey].map((phase, i) => ({
    ...phase,
    active: i === 0,
    completed: false,
    topics: phase.topics.map((t) => ({ ...t, done: false })),
  }));

  // Prioritize weak areas by moving related topics earlier
  if (weakAreas.length > 0) {
    // Move weak area topics to phase 1 if they're in later phases
    // (simplified — in production this would be more sophisticated)
  }

  return {
    targetRole,
    estimatedDuration: `${phases.reduce((acc, p) => acc + parseInt(p.duration), 0)} weeks`,
    phases,
  };
}

module.exports = { generateRoadmap };
