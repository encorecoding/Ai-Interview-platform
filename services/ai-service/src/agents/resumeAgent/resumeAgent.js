/**
 * Resume Agent
 *
 * Workflow:
 * ExtractText → ParseStructure → IdentifySkills → AnalyzeContent → GenerateScore → GenerateRecommendations
 */

const { isAIAvailable, generateText } = require('../../providers/llmProvider');

const RESUME_ANALYSIS_PROMPT = `Analyze this resume and provide a comprehensive evaluation.

Resume Text:
{resumeText}

Target Role (if specified): {targetRole}

Evaluate and return a JSON object with this exact structure:
{{
  "score": <0-100 overall score>,
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {{
      "company": "...",
      "role": "...",
      "duration": "...",
      "highlights": ["..."]
    }}
  ],
  "education": [
    {{
      "institution": "...",
      "degree": "...",
      "year": "..."
    }}
  ],
  "projects": [
    {{
      "name": "...",
      "tech": ["..."],
      "desc": "..."
    }}
  ],
  "categoryScores": [
    {{"subject": "Skills", "value": <0-100>}},
    {{"subject": "Experience", "value": <0-100>}},
    {{"subject": "Education", "value": <0-100>}},
    {{"subject": "Projects", "value": <0-100>}},
    {{"subject": "Structure", "value": <0-100>}},
    {{"subject": "Keywords", "value": <0-100>}}
  ],
  "strengths": ["specific strength 1", "specific strength 2", ...],
  "improvements": ["specific improvement 1", "specific improvement 2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...]
}}

Be specific and reference actual content from the resume. Do not give generic feedback.`;

/**
 * Parse resume text using simple heuristics
 */
function parseResumeText(text) {
  const skills = extractSkills(text);
  const email = text.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '';
  const phone = text.match(/[\+]?[\d\s\-\(\)]{10,}/)?.[0] || '';

  return { rawText: text, skills, email, phone };
}

/**
 * Extract skills using keyword matching
 */
function extractSkills(text) {
  const TECH_KEYWORDS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'FastAPI',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB',
    'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Jenkins',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP',
    'REST', 'GraphQL', 'gRPC', 'Microservices', 'System Design', 'Git',
    'Linux', 'Bash', 'HTML', 'CSS', 'Tailwind', 'Bootstrap',
    'Agile', 'Scrum', 'JIRA', 'Figma',
  ];

  return TECH_KEYWORDS.filter((kw) =>
    new RegExp(`\\b${kw.replace(/[+.]/g, '\\$&')}\\b`, 'i').test(text)
  );
}

/**
 * Calculate a basic resume score from structure analysis
 */
function calculateBaseScore(text, skills) {
  let score = 30; // Base

  // Sections
  if (/experience|work history|employment/i.test(text)) score += 15;
  if (/education|degree|bachelor|master/i.test(text)) score += 10;
  if (/projects?|portfolio/i.test(text)) score += 10;
  if (/skills?|technologies/i.test(text)) score += 5;
  if (/summary|objective|about/i.test(text)) score += 5;

  // Skills count
  if (skills.length >= 10) score += 10;
  else if (skills.length >= 5) score += 5;

  // Length (reasonable resume)
  const wordCount = text.split(' ').length;
  if (wordCount >= 300 && wordCount <= 1000) score += 10;

  // Numbers/metrics
  if (/\d+%|\d+ years?|\d+ months?|\d+k|\$\d+/i.test(text)) score += 5;

  return Math.min(95, score);
}

/**
 * Main resume analysis function
 */
async function analyzeResume(resumeText, targetRole = '') {
  if (isAIAvailable()) {
    try {
      const prompt = RESUME_ANALYSIS_PROMPT
        .replace('{resumeText}', resumeText.substring(0, 4000)) // Limit context
        .replace('{targetRole}', targetRole || 'Software Engineer');

      const response = await generateText(prompt, { temperature: 0.3, maxTokens: 3000 });

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
    } catch (err) {
      console.warn('Resume AI analysis failed:', err.message);
    }
  }

  // Fallback: structural analysis
  const parsed = parseResumeText(resumeText);
  const score = calculateBaseScore(resumeText, parsed.skills);

  return {
    score,
    skills: parsed.skills,
    experience: [],
    education: [],
    projects: [],
    categoryScores: [
      { subject: 'Skills', value: Math.min(90, parsed.skills.length * 6) },
      { subject: 'Experience', value: /experience|work/i.test(resumeText) ? 70 : 40 },
      { subject: 'Education', value: /education|degree/i.test(resumeText) ? 75 : 50 },
      { subject: 'Projects', value: /project/i.test(resumeText) ? 72 : 40 },
      { subject: 'Structure', value: score },
      { subject: 'Keywords', value: Math.min(85, parsed.skills.length * 5) },
    ],
    strengths: [
      parsed.skills.length > 5 ? 'Good range of technical skills' : 'Has relevant technical skills',
      'Resume submitted for analysis',
    ],
    improvements: [
      'Add quantifiable achievements with metrics (e.g., "improved performance by 40%")',
      'Include more role-specific keywords',
      'Ensure consistent formatting throughout',
    ],
    missingKeywords: ['AWS', 'System Design', 'Redis'].filter((kw) => !parsed.skills.includes(kw)),
  };
}

module.exports = { analyzeResume, parseResumeText, extractSkills };
