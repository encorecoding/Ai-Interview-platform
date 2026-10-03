const Feedback = require('../models/Feedback');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5004';

const DEFAULT_FEEDBACK = {
  overallScore: 76,
  totalInterviews: 1,
  strengths: [
    {
      category: 'Technical Depth',
      feedback: 'Demonstrated strong understanding of core concepts and principles.',
      examples: ['Clear explanation of problem decomposition'],
    },
    {
      category: 'Communication',
      feedback: 'Expressed thought process clearly and systematically.',
      examples: ['Structured responses well'],
    },
  ],
  weaknesses: [
    {
      category: 'System Design',
      feedback: 'Scalability and distributed architectural considerations need more detail.',
      actionItems: ['Review System Design Primer', 'Practice designing for high throughput'],
    },
    {
      category: 'Edge Cases',
      feedback: 'Take time to mention edge cases and boundary conditions proactively.',
      actionItems: ['Formulate an edge-case checklist before coding or explaining solutions'],
    },
  ],
  technicalFeedback: {
    dsa: 80,
    dbms: 74,
    os: 65,
    oop: 82,
    systemDesign: 58,
    networking: 68,
  },
  communicationFeedback: {
    clarity: 80,
    structure: 75,
    confidence: 72,
    examples: 78,
  },
  practiceRecommendations: [
    { resource: 'LeetCode', focus: 'DSA and Algorithm patterns', priority: 'High' },
    { resource: 'System Design Primer', focus: 'Scalability & Caching', priority: 'High' },
    { resource: 'PrepAI Mock Interviews', focus: 'Simulated technical rounds', priority: 'Medium' },
  ],
};

/**
 * GET /api/feedback/latest
 */
async function getLatest(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    let feedback = await Feedback.findOne({ userId }).sort({ createdAt: -1 });

    if (!feedback) {
      // Create initial feedback record for the user
      feedback = await Feedback.create({
        userId,
        ...DEFAULT_FEEDBACK,
      });
    }

    return res.json({ feedback });
  } catch (err) {
    console.error('getLatest feedback error:', err);
    return res.json({ feedback: DEFAULT_FEEDBACK });
  }
}

/**
 * GET /api/feedback/interview/:interviewId
 */
async function getByInterview(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    const { interviewId } = req.params;

    let feedback = await Feedback.findOne({ interviewId, userId });

    if (!feedback) {
      feedback = await Feedback.findOne({ userId }).sort({ createdAt: -1 });
    }

    if (!feedback) {
      feedback = await Feedback.create({
        userId,
        interviewId,
        ...DEFAULT_FEEDBACK,
      });
    }

    return res.json({ feedback });
  } catch (err) {
    console.error('getByInterview error:', err);
    return res.json({ feedback: DEFAULT_FEEDBACK });
  }
}

/**
 * GET /api/feedback
 */
async function getAll(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    const feedbackList = await Feedback.find({ userId }).sort({ createdAt: -1 });
    return res.json({ feedbackList });
  } catch (err) {
    console.error('getAll feedback error:', err);
    return res.status(500).json({ error: 'Failed to fetch feedback history' });
  }
}

/**
 * POST /api/feedback/generate
 * Generates and stores new feedback from interview data
 */
async function generate(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || req.body.userId || 'dev-user';
    const { interviewId, role, type, questions = [], score = 75 } = req.body;

    let generated = null;
    try {
      const aiRes = await axios.post(
        `${AI_SERVICE_URL}/api/ai/feedback/generate`,
        { ...req.body, userId },
        { timeout: 35000 }
      );
      generated = aiRes.data;
    } catch {
      generated = DEFAULT_FEEDBACK;
    }

    const feedback = await Feedback.findOneAndUpdate(
      { interviewId },
      {
        $set: {
          userId,
          interviewId,
          role: role || 'Software Engineer',
          type: type || 'Technical',
          overallScore: score,
          strengths: generated.strengths || DEFAULT_FEEDBACK.strengths,
          weaknesses: generated.weaknesses || DEFAULT_FEEDBACK.weaknesses,
          technicalFeedback: generated.technicalFeedback || DEFAULT_FEEDBACK.technicalFeedback,
          communicationFeedback: generated.communicationFeedback || DEFAULT_FEEDBACK.communicationFeedback,
          practiceRecommendations: generated.practiceRecommendations || DEFAULT_FEEDBACK.practiceRecommendations,
        },
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({ feedback });
  } catch (err) {
    console.error('generate feedback error:', err);
    return res.status(500).json({ error: 'Failed to generate feedback' });
  }
}

module.exports = {
  getLatest,
  getByInterview,
  getAll,
  generate,
};
