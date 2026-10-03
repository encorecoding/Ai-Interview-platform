/**
 * Interview Agent using LangGraph
 *
 * This agent maintains stateful interview sessions through a graph workflow:
 *
 * StartInterview
 *     ↓
 * LoadCandidateProfile
 *     ↓
 * CreateInterviewPlan
 *     ↓
 * GenerateQuestion
 *     ↓
 * [User Answers]
 *     ↓
 * EvaluateAnswer
 *     ↓
 * DetermineNextAction ──────────────────┐
 *     ↓                                 │
 * GenerateFollowUp (if needed)          │
 *     │                                 │
 *     └─────────────────────────────────┘
 *     ↓ (all questions done)
 * GenerateFinalEvaluation
 *     ↓
 * End
 */

const { StateGraph, END } = require('@langchain/langgraph');
const { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } = require('@langchain/core/prompts');
const { getLLM, isAIAvailable } = require('../../providers/llmProvider');
const { INTERVIEW_PROMPTS } = require('../../prompts/interviewPrompts');

// Interview question banks for fallback
const QUESTION_BANKS = require('../../data/questionBanks');

/**
 * Interview State Schema for LangGraph
 */
const interviewStateSchema = {
  // Candidate info
  candidateProfile: null,
  resumeContext: null,
  targetRole: null,
  interviewType: null,
  difficulty: null,

  // Interview state
  questionsAsked: [],
  answers: [],
  scores: [],
  skillsTested: new Set(),
  weakAreas: [],
  conversationHistory: [],
  currentQuestion: null,
  currentTopic: null,
  interviewProgress: 0,
  totalQuestions: 8,
  isComplete: false,

  // Results
  overallScore: 0,
  topicScores: {},
  finalFeedback: null,
};

/**
 * Node: Create interview plan based on candidate profile and type
 */
async function createInterviewPlan(state) {
  const { interviewType, difficulty, targetRole } = state;

  let topics = [];
  if (interviewType === 'Technical') {
    topics = difficulty === 'Easy'
      ? ['Arrays & Strings', 'Basic OOP', 'DBMS Basics', 'Basic OS']
      : difficulty === 'Medium'
      ? ['DSA', 'DBMS', 'OS', 'OOP', 'System Design', 'Networking']
      : ['Advanced DSA', 'System Design', 'DBMS Advanced', 'OS Advanced', 'Architecture'];
  } else if (interviewType === 'HR') {
    topics = ['Introduction', 'Strengths & Weaknesses', 'Career Goals', 'Behavioral STAR', 'Situational'];
  } else {
    topics = ['Introduction', 'Technical DSA', 'DBMS', 'Behavioral', 'System Design', 'Career Goals'];
  }

  return {
    ...state,
    interviewPlan: { topics, questionsPerTopic: Math.ceil(8 / topics.length) },
    topicsQueue: [...topics],
    currentTopic: topics[0],
  };
}

/**
 * Node: Generate next interview question using LLM or fallback
 */
async function generateQuestion(state) {
  const { interviewType, difficulty, targetRole, currentTopic, questionsAsked, conversationHistory } = state;

  if (isAIAvailable()) {
    try {
      const llm = getLLM({ temperature: 0.8 });
      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(INTERVIEW_PROMPTS.INTERVIEWER_SYSTEM),
        HumanMessagePromptTemplate.fromTemplate(INTERVIEW_PROMPTS.GENERATE_QUESTION),
      ]);

      const chain = prompt.pipe(llm);
      const response = await chain.invoke({
        interviewType,
        difficulty,
        targetRole,
        currentTopic,
        questionsAsked: questionsAsked.map((q) => q.question).join('\n'),
        conversationHistory: conversationHistory.slice(-4).map((m) => `${m.role}: ${m.content}`).join('\n'),
      });

      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

      // Try to parse JSON response, fallback to text
      let question = { question: content, topic: currentTopic, difficulty };
      try {
        const parsed = JSON.parse(content);
        question = { ...question, ...parsed };
      } catch {
        // Use as plain text question
      }

      return { ...state, currentQuestion: question };
    } catch (err) {
      console.warn('LLM question generation failed:', err.message);
    }
  }

  // Fallback: use question bank
  const bankKey = `${interviewType}_${difficulty}`;
  const bankForType = QUESTION_BANKS[interviewType] || QUESTION_BANKS.Technical;
  const topicQuestions = bankForType.filter((q) => q.topic === currentTopic);
  const usedQuestions = questionsAsked.map((q) => q.question);
  const available = topicQuestions.filter((q) => !usedQuestions.includes(q.question));
  const selected = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : bankForType[Math.floor(Math.random() * bankForType.length)];

  return { ...state, currentQuestion: { ...selected, topic: currentTopic } };
}

/**
 * Node: Evaluate the candidate's answer using LLM
 */
async function evaluateAnswer(state) {
  const { currentQuestion, currentAnswer, interviewType, difficulty, targetRole } = state;

  let evaluation = { score: 70, feedback: 'Good answer.', strengths: [], improvements: [] };

  if (isAIAvailable()) {
    try {
      const llm = getLLM({ temperature: 0.3 });
      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(INTERVIEW_PROMPTS.EVALUATOR_SYSTEM),
        HumanMessagePromptTemplate.fromTemplate(INTERVIEW_PROMPTS.EVALUATE_ANSWER),
      ]);

      const chain = prompt.pipe(llm);
      const response = await chain.invoke({
        question: currentQuestion.question,
        topic: currentQuestion.topic,
        difficulty,
        targetRole,
        answer: currentAnswer,
        interviewType,
      });

      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
      try {
        evaluation = JSON.parse(content);
      } catch {
        // Parse score from text
        const scoreMatch = content.match(/score[:\s]+(\d+)/i);
        evaluation.score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
        evaluation.feedback = content.substring(0, 500);
      }
    } catch (err) {
      console.warn('LLM evaluation failed:', err.message);
      // Score based on answer length as heuristic
      const words = currentAnswer.trim().split(' ').length;
      evaluation.score = Math.min(85, Math.max(45, 40 + words * 0.8));
      evaluation.feedback = words > 30
        ? 'Good detailed response. Make sure to back up your explanation with concrete examples.'
        : 'Consider providing more depth and specific examples in your answer.';
    }
  } else {
    const words = currentAnswer.trim().split(' ').length;
    evaluation.score = Math.min(85, Math.max(45, 40 + words * 0.8));
    evaluation.feedback = words > 30
      ? 'Solid answer. Consider adding more real-world examples next time.'
      : 'Good start. Try to elaborate more with technical specifics.';
  }

  // Update state
  const updatedScores = [...state.scores, evaluation.score];
  const updatedAnswers = [...state.answers, { question: currentQuestion.question, answer: currentAnswer, score: evaluation.score, feedback: evaluation.feedback }];
  const updatedConversationHistory = [
    ...state.conversationHistory,
    { role: 'interviewer', content: currentQuestion.question },
    { role: 'candidate', content: currentAnswer },
    { role: 'evaluation', content: `Score: ${evaluation.score}. ${evaluation.feedback}` },
  ];

  const updatedTopicScores = { ...state.topicScores };
  const topic = currentQuestion.topic;
  if (!updatedTopicScores[topic]) updatedTopicScores[topic] = { total: 0, count: 0 };
  updatedTopicScores[topic].total += evaluation.score;
  updatedTopicScores[topic].count += 1;

  // Identify weak areas
  const weakAreas = Object.entries(updatedTopicScores)
    .filter(([, v]) => v.total / v.count < 60)
    .map(([k]) => k);

  return {
    ...state,
    currentEvaluation: evaluation,
    scores: updatedScores,
    answers: updatedAnswers,
    conversationHistory: updatedConversationHistory,
    topicScores: updatedTopicScores,
    weakAreas,
    questionsAsked: [...state.questionsAsked, { question: currentQuestion.question, topic, score: evaluation.score }],
    interviewProgress: state.questionsAsked.length + 1,
  };
}

/**
 * Node: Determine next action
 */
function determineNextAction(state) {
  const { interviewProgress, totalQuestions, weakAreas } = state;
  const isComplete = interviewProgress >= totalQuestions;

  // Advance to next topic
  let nextTopic = state.currentTopic;
  if (state.interviewPlan?.topics) {
    const topics = state.interviewPlan.topics;
    const currentIndex = topics.indexOf(state.currentTopic);
    const questionsPerTopic = state.interviewPlan.questionsPerTopic;
    const questionsInCurrentTopic = state.questionsAsked.filter((q) => q.topic === state.currentTopic).length;
    if (questionsInCurrentTopic >= questionsPerTopic && currentIndex < topics.length - 1) {
      nextTopic = topics[currentIndex + 1];
    }
  }

  return { ...state, isComplete, currentTopic: nextTopic };
}

/**
 * Node: Generate final evaluation
 */
async function generateFinalEvaluation(state) {
  const { answers, topicScores, interviewType, targetRole, difficulty, weakAreas } = state;

  const allScores = state.scores.filter((s) => s > 0);
  const overallScore = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b) / allScores.length)
    : 0;

  const topicScoresFormatted = Object.entries(topicScores).map(([topic, data]) => ({
    topic,
    score: Math.round(data.total / data.count),
  }));

  let finalFeedback = null;

  if (isAIAvailable()) {
    try {
      const llm = getLLM({ temperature: 0.4 });
      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(INTERVIEW_PROMPTS.FEEDBACK_SYSTEM),
        HumanMessagePromptTemplate.fromTemplate(INTERVIEW_PROMPTS.GENERATE_FEEDBACK),
      ]);

      const chain = prompt.pipe(llm);
      const response = await chain.invoke({
        targetRole,
        interviewType,
        difficulty,
        overallScore,
        weakAreas: weakAreas.join(', '),
        topicScores: JSON.stringify(topicScoresFormatted),
        answersJson: JSON.stringify(answers.slice(0, 5)), // Limit context
      });

      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
      try {
        finalFeedback = JSON.parse(content);
      } catch {
        finalFeedback = {
          strengths: ['Good overall performance'],
          weaknesses: weakAreas.length > 0 ? weakAreas.map((a) => `${a} needs more practice`) : ['Keep practicing'],
          recommendations: ['Continue practicing with PrepAI mock interviews'],
        };
      }
    } catch (err) {
      console.warn('Final evaluation generation failed:', err.message);
    }
  }

  if (!finalFeedback) {
    finalFeedback = generateFallbackFeedback(topicScoresFormatted, weakAreas, overallScore);
  }

  return {
    ...state,
    overallScore,
    topicScoresFormatted,
    finalFeedback,
    isComplete: true,
  };
}

function generateFallbackFeedback(topicScores, weakAreas, score) {
  const strongTopics = topicScores.filter((t) => t.score >= 75).map((t) => t.topic);
  return {
    strengths: strongTopics.length > 0
      ? strongTopics.map((t) => `Demonstrated good understanding of ${t}`)
      : ['Showed problem-solving initiative throughout the interview'],
    weaknesses: weakAreas.length > 0
      ? weakAreas.map((a) => `${a} concepts need deeper study and practice`)
      : ['Consider adding more technical depth to answers'],
    recommendations: [
      'Practice with PrepAI mock interviews regularly',
      'Study the topics identified as weak areas',
      'Use the Roadmap Agent to get a personalized learning plan',
    ],
  };
}

/**
 * Build the Interview LangGraph
 */
function buildInterviewGraph() {
  const graph = new StateGraph({
    channels: {
      candidateProfile: null,
      resumeContext: null,
      targetRole: null,
      interviewType: null,
      difficulty: null,
      interviewPlan: null,
      topicsQueue: null,
      questionsAsked: null,
      answers: null,
      scores: null,
      skillsTested: null,
      weakAreas: null,
      conversationHistory: null,
      currentQuestion: null,
      currentAnswer: null,
      currentEvaluation: null,
      currentTopic: null,
      interviewProgress: null,
      totalQuestions: null,
      topicScores: null,
      isComplete: null,
      overallScore: null,
      topicScoresFormatted: null,
      finalFeedback: null,
    },
  });

  // Add nodes
  graph.addNode('createPlan', createInterviewPlan);
  graph.addNode('generateQuestion', generateQuestion);
  graph.addNode('evaluateAnswer', evaluateAnswer);
  graph.addNode('determineNext', determineNextAction);
  graph.addNode('finalEvaluation', generateFinalEvaluation);

  // Set entry point
  graph.setEntryPoint('createPlan');

  // Add edges
  graph.addEdge('createPlan', 'generateQuestion');
  graph.addEdge('generateQuestion', END); // Question sent to client; resume on answer

  graph.addEdge('evaluateAnswer', 'determineNext');
  graph.addConditionalEdges('determineNext', (state) => {
    return state.isComplete ? 'finalEvaluation' : 'generateQuestion';
  });
  graph.addEdge('finalEvaluation', END);

  return graph.compile();
}

// Singleton graph instance
let interviewGraph = null;

function getInterviewGraph() {
  if (!interviewGraph) {
    interviewGraph = buildInterviewGraph();
  }
  return interviewGraph;
}

module.exports = {
  getInterviewGraph,
  generateQuestion,
  evaluateAnswer,
  generateFinalEvaluation,
  createInterviewPlan,
};
