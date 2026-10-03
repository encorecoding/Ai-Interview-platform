const express = require('express');
const router = express.Router();
const {
  createInterviewPlan,
  generateQuestion,
  evaluateAnswer,
} = require('../agents/interviewAgent/interviewAgent');
const { analyzeResume } = require('../agents/resumeAgent/resumeAgent');
const { generateFeedback } = require('../agents/feedbackAgent/feedbackAgent');
const { generateRoadmap } = require('../agents/roadmapAgent/roadmapAgent');
const { isAIAvailable, generateText } = require('../providers/llmProvider');
const QUESTION_BANKS = require('../data/questionBanks');

/**
 * POST /api/ai/interview/start
 */
router.post('/interview/start', async (req, res) => {
  try {
    const { type = 'Technical', role = 'Software Engineer', difficulty = 'Medium', sessionId } = req.body;

    const planState = await createInterviewPlan({
      interviewType: type,
      difficulty,
      targetRole: role,
      questionsAsked: [],
      conversationHistory: [],
    });

    const questionState = await generateQuestion({
      ...planState,
      currentTopic: planState.currentTopic || 'General',
    });

    return res.json({
      question: questionState.currentQuestion,
      topics: planState.interviewPlan?.topics || ['Technical', 'Problem Solving', 'Behavioral'],
    });
  } catch (err) {
    console.error('AI /interview/start error:', err);
    return res.status(500).json({ error: 'Failed to initialize AI interview' });
  }
});

/**
 * POST /api/ai/interview/answer
 */
router.post('/interview/answer', async (req, res) => {
  try {
    const { sessionId, questionIndex = 0, answer, interviewState = {} } = req.body;

    const currentTopic = interviewState.questions?.[questionIndex]?.topic || 'Technical';
    const currentQuestion = interviewState.questions?.[questionIndex] || {
      question: req.body.questionText || 'Explain your approach.',
      topic: currentTopic,
    };

    const state = {
      interviewType: interviewState.type || 'Technical',
      difficulty: interviewState.difficulty || 'Medium',
      targetRole: interviewState.role || 'Software Engineer',
      currentQuestion,
      currentAnswer: answer,
      scores: interviewState.scores || [],
      answers: interviewState.answers || [],
      conversationHistory: interviewState.conversationHistory || [],
      topicScores: interviewState.topicScores || {},
      questionsAsked: interviewState.questions || [],
      interviewProgress: questionIndex + 1,
      totalQuestions: 8,
    };

    const evalResult = await evaluateAnswer(state);
    const isCompleted = questionIndex >= 7;

    let nextQuestion = null;
    if (!isCompleted) {
      const nextTopicIndex = Math.min(questionIndex + 1, (evalResult.interviewPlan?.topics?.length || 1) - 1);
      const nextTopic = evalResult.interviewPlan?.topics?.[nextTopicIndex] || currentTopic;
      const nextState = await generateQuestion({
        ...evalResult,
        currentTopic: nextTopic,
      });
      nextQuestion = nextState.currentQuestion;
    }

    return res.json({
      feedback: evalResult.currentEvaluation?.feedback || 'Good response.',
      score: evalResult.currentEvaluation?.score || 75,
      nextQuestion,
      completed: isCompleted,
      topics: Object.keys(evalResult.topicScores || {}),
    });
  } catch (err) {
    console.error('AI /interview/answer error:', err);
    return res.status(500).json({ error: 'Failed to evaluate answer' });
  }
});

/**
 * POST /api/ai/resume/analyze
 */
router.post('/resume/analyze', async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'resumeText is required' });
    }

    const analysis = await analyzeResume(resumeText, targetRole);
    return res.json(analysis);
  } catch (err) {
    console.error('AI /resume/analyze error:', err);
    return res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

/**
 * POST /api/ai/feedback/generate
 */
router.post('/feedback/generate', async (req, res) => {
  try {
    const { interviewId, userId, type, role, questions, score, topicScores, weakAreas } = req.body;
    const feedback = await generateFeedback({
      interviewId,
      userId,
      type,
      role,
      questions,
      score,
      topicScores,
      weakAreas,
    });
    return res.json(feedback);
  } catch (err) {
    console.error('AI /feedback/generate error:', err);
    return res.status(500).json({ error: 'Failed to generate feedback' });
  }
});

/**
 * POST /api/ai/roadmap/generate
 */
router.post('/roadmap/generate', async (req, res) => {
  try {
    const { targetRole, existingSkills, weakAreas, careerGoal } = req.body;
    const roadmap = await generateRoadmap({
      targetRole: targetRole || 'Software Engineer',
      existingSkills: existingSkills || [],
      weakAreas: weakAreas || [],
      careerGoal: careerGoal || '',
    });
    return res.json(roadmap);
  } catch (err) {
    console.error('AI /roadmap/generate error:', err);
    return res.status(500).json({ error: 'Failed to generate roadmap' });
  }
});

/**
 * POST /api/ai/chat
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    if (isAIAvailable()) {
      const systemPrompt = `You are PrepAI, an empathetic and highly knowledgeable AI Career Coach and Technical Interview Mentor.
Provide concise, constructive, actionable advice tailored for candidates preparing for engineering, tech, and HR interviews.`;
      const reply = await generateText(`${systemPrompt}\nUser: ${message}\nAssistant:`, {
        temperature: 0.7,
        maxTokens: 1000,
      });
      return res.json({ reply });
    }

    // Fallback mentor replies
    const fallbackReplies = [
      "Focus on explaining your thought process step-by-step using the STAR method for behavioral questions and pseudocode-first for technical challenges.",
      "A great tip for system design interviews is to start by clarifying non-functional requirements (throughput, latency, availability) before diagramming architecture.",
      "Consistency is key! Spend 45 minutes daily on Data Structures & Algorithms, and do 1-2 full mock interviews weekly to build confidence.",
    ];
    const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    return res.json({ reply });
  } catch (err) {
    console.error('AI /chat error:', err);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
});

module.exports = router;
