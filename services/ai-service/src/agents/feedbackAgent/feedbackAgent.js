/**
 * Feedback Agent
 *
 * Analyzes interview performance and generates comprehensive, specific feedback.
 * Uses LangGraph workflow to process multiple interview results.
 */

const { isAIAvailable, generateText } = require('../../providers/llmProvider');

const FEEDBACK_PROMPT = `You are an expert career coach analyzing interview performance.

Candidate Performance Data:
Role: {role}
Interview Type: {type}
Difficulty: {difficulty}
Overall Score: {score}/100

Topic Scores: {topicScores}
Weak Areas: {weakAreas}

Questions & Answers:
{qaPairs}

Generate specific, actionable feedback in this JSON format:
{{
  "strengths": [
    {{
      "category": "Category Name",
      "feedback": "Specific feedback about what the candidate did well",
      "examples": ["Specific example from their answers"]
    }}
  ],
  "weaknesses": [
    {{
      "category": "Category Name",
      "feedback": "Specific weakness observed with evidence",
      "actionItems": ["Concrete action to take", "Resource to study"]
    }}
  ],
  "technicalFeedback": {{
    "dsa": <score>,
    "dbms": <score>,
    "os": <score>,
    "oop": <score>,
    "systemDesign": <score>,
    "networking": <score>
  }},
  "communicationFeedback": {{
    "clarity": <score>,
    "structure": <score>,
    "confidence": <score>,
    "examples": <score>
  }},
  "practiceRecommendations": [
    {{
      "resource": "Resource Name",
      "focus": "What to focus on",
      "priority": "High|Medium|Low"
    }}
  ]
}}

Be SPECIFIC. Reference actual topics and scores. Do not give generic advice like "practice more".`;

async function generateFeedback(interviewData) {
  const {
    role = 'Software Engineer',
    type = 'Technical',
    difficulty = 'Medium',
    score = 70,
    questions = [],
    topicScores = [],
    weakAreas = [],
  } = interviewData;

  const qaPairs = questions
    .slice(0, 6)
    .map((q, i) => `Q${i + 1} [${q.topic || 'General'}, Score: ${q.score || 'N/A'}]: ${q.question}\nA: ${(q.answer || '').substring(0, 200)}`)
    .join('\n\n');

  if (isAIAvailable()) {
    try {
      const prompt = FEEDBACK_PROMPT
        .replace('{role}', role)
        .replace('{type}', type)
        .replace('{difficulty}', difficulty)
        .replace('{score}', score)
        .replace('{topicScores}', JSON.stringify(topicScores))
        .replace('{weakAreas}', weakAreas.join(', ') || 'None identified')
        .replace('{qaPairs}', qaPairs || 'No answers recorded');

      const response = await generateText(prompt, { temperature: 0.4, maxTokens: 3000 });
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn('Feedback AI generation failed:', err.message);
    }
  }

  // Fallback feedback
  return generateFallbackFeedback(score, topicScores, weakAreas, type);
}

function generateFallbackFeedback(score, topicScores, weakAreas, type) {
  const strongTopics = topicScores.filter((t) => t.score >= 75);
  const weakTopics = topicScores.filter((t) => t.score < 60);

  return {
    overallScore: score,
    strengths: [
      {
        category: strongTopics.length > 0 ? strongTopics[0].topic : 'Problem Solving',
        feedback: strongTopics.length > 0
          ? `Strong performance in ${strongTopics[0].topic} (${strongTopics[0].score}/100)`
          : 'Demonstrated logical thinking and problem decomposition',
        examples: ['See detailed Q&A for specifics'],
      },
    ],
    weaknesses: weakAreas.length > 0 ? weakAreas.map((area) => ({
      category: area,
      feedback: `Performance in ${area} needs improvement. Focus on fundamental concepts.`,
      actionItems: [
        `Study ${area} fundamentals using structured resources`,
        `Practice ${area} problems on LeetCode or similar platforms`,
      ],
    })) : [{
      category: 'Depth of Explanation',
      feedback: 'Answers could benefit from more technical depth and specific examples',
      actionItems: ['Practice explaining concepts with real-world scenarios', 'Use STAR method for behavioral questions'],
    }],
    technicalFeedback: buildTechnicalScores(topicScores, score),
    communicationFeedback: { clarity: score, structure: score - 5, confidence: score - 8, examples: score - 3 },
    practiceRecommendations: [
      { resource: 'PrepAI Mock Interviews', focus: 'Regular practice with AI evaluation', priority: 'High' },
      { resource: 'LeetCode', focus: weakTopics.length > 0 ? weakTopics[0].topic : 'DSA problems', priority: 'High' },
      { resource: 'System Design Primer', focus: 'Distributed systems concepts', priority: 'Medium' },
    ],
  };
}

function buildTechnicalScores(topicScores, baseScore) {
  const lookup = {};
  topicScores.forEach((t) => { lookup[t.topic.toLowerCase()] = t.score; });
  return {
    dsa: lookup['dsa'] || lookup['data structures'] || baseScore,
    dbms: lookup['dbms'] || lookup['database'] || baseScore - 5,
    os: lookup['os'] || lookup['operating systems'] || baseScore - 10,
    oop: lookup['oop'] || lookup['object-oriented'] || baseScore + 5,
    systemDesign: lookup['system design'] || baseScore - 15,
    networking: lookup['networking'] || lookup['networks'] || baseScore - 5,
  };
}

module.exports = { generateFeedback };
