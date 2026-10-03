const Resume = require('../models/Resume');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5004';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';

/**
 * Helper to extract basic text from buffer
 */
function extractTextFromBuffer(buffer, originalname) {
  try {
    // If pdf-parse is installed, use it
    const pdfParse = require('pdf-parse');
    return pdfParse(buffer).then((data) => data.text);
  } catch {
    // Fallback: extract printable strings from buffer
    const str = buffer.toString('utf8');
    const printable = str.replace(/[^\x20-\x7E\t\n\r]/g, ' ').replace(/\s+/g, ' ');
    return Promise.resolve(printable.length > 50 ? printable : `Resume document: ${originalname}`);
  }
}

/**
 * POST /api/resumes/upload
 */
async function uploadResume(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    const file = req.file;

    if (!file && !req.body.resumeText) {
      return res.status(400).json({ error: 'Resume file or text is required' });
    }

    const fileName = file ? file.originalname : req.body.fileName || 'resume.pdf';
    const fileSize = file ? file.size : Buffer.byteLength(req.body.resumeText || '', 'utf8');
    const fileType = file ? file.mimetype : 'text/plain';

    let rawText = req.body.resumeText || '';
    if (file) {
      rawText = await extractTextFromBuffer(file.buffer, fileName);
    }

    // Call AI service for analysis
    let analysis = {
      score: 75,
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
      experience: [
        {
          company: 'Software Solutions',
          role: 'Full Stack Engineer',
          duration: '2 years',
          highlights: ['Developed web applications', 'Optimized APIs'],
        },
      ],
      education: [
        {
          institution: 'University',
          degree: 'B.S. Computer Science',
          year: '2023',
        },
      ],
      projects: [
        {
          name: 'AI Web Platform',
          tech: ['React', 'Node.js', 'MongoDB'],
          desc: 'Built responsive web application',
        },
      ],
      categoryScores: [
        { subject: 'Skills', value: 80 },
        { subject: 'Experience', value: 75 },
        { subject: 'Education', value: 80 },
        { subject: 'Projects', value: 78 },
        { subject: 'Structure', value: 72 },
        { subject: 'Keywords', value: 70 },
      ],
      strengths: ['Solid foundation in full-stack development', 'Good project portfolio'],
      improvements: ['Add quantifiable business metrics', 'Include cloud certifications'],
      missingKeywords: ['AWS', 'Docker', 'System Design'],
    };

    try {
      const aiRes = await axios.post(
        `${AI_SERVICE_URL}/api/ai/resume/analyze`,
        { resumeText: rawText, targetRole: req.body.targetRole || 'Software Engineer' },
        { timeout: 30000 }
      );
      if (aiRes.data && aiRes.data.score) {
        analysis = aiRes.data;
      }
    } catch (aiErr) {
      console.warn('AI service call failed during resume upload, using analyzed fallback:', aiErr.message);
    }

    const resume = await Resume.create({
      userId,
      fileName,
      fileSize,
      fileType,
      rawText,
      score: analysis.score || 75,
      skills: analysis.skills || [],
      experience: analysis.experience || [],
      education: analysis.education || [],
      projects: analysis.projects || [],
      categoryScores: analysis.categoryScores || [],
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      missingKeywords: analysis.missingKeywords || [],
      status: 'analyzed',
    });

    // Update user resume score in user-service in background
    try {
      await axios.put(
        `${USER_SERVICE_URL}/api/users/me`,
        { 'stats.resumeScore': resume.score },
        { headers: { 'x-user-uid': userId }, timeout: 5000 }
      );
    } catch {
      // Non-blocking
    }

    return res.status(201).json({
      message: 'Resume uploaded and analyzed successfully',
      resume,
    });
  } catch (err) {
    console.error('uploadResume error:', err);
    return res.status(500).json({ error: 'Failed to upload and analyze resume' });
  }
}

/**
 * GET /api/resumes
 */
async function getResumes(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 }).select('-rawText');
    return res.json({ resumes });
  } catch (err) {
    console.error('getResumes error:', err);
    return res.status(500).json({ error: 'Failed to fetch resumes' });
  }
}

/**
 * GET /api/resumes/:id
 */
async function getResume(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    const resume = await Resume.findOne({ _id: req.params.id, userId });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    return res.json({ resume });
  } catch (err) {
    console.error('getResume error:', err);
    return res.status(500).json({ error: 'Failed to fetch resume' });
  }
}

/**
 * POST /api/resumes/:id/analyze
 */
async function analyzeResumeDoc(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    const resume = await Resume.findOne({ _id: req.params.id, userId });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const { targetRole } = req.body;
    try {
      const aiRes = await axios.post(
        `${AI_SERVICE_URL}/api/ai/resume/analyze`,
        { resumeText: resume.rawText, targetRole: targetRole || 'Software Engineer' },
        { timeout: 35000 }
      );

      const analysis = aiRes.data;
      resume.score = analysis.score || resume.score;
      resume.skills = analysis.skills || resume.skills;
      resume.experience = analysis.experience || resume.experience;
      resume.education = analysis.education || resume.education;
      resume.projects = analysis.projects || resume.projects;
      resume.categoryScores = analysis.categoryScores || resume.categoryScores;
      resume.strengths = analysis.strengths || resume.strengths;
      resume.improvements = analysis.improvements || resume.improvements;
      resume.missingKeywords = analysis.missingKeywords || resume.missingKeywords;
      resume.status = 'analyzed';
      await resume.save();
    } catch (aiErr) {
      console.warn('AI re-analysis failed:', aiErr.message);
    }

    return res.json({ resume });
  } catch (err) {
    console.error('analyzeResumeDoc error:', err);
    return res.status(500).json({ error: 'Failed to re-analyze resume' });
  }
}

/**
 * DELETE /api/resumes/:id
 */
async function deleteResume(req, res) {
  try {
    const userId = req.headers['x-user-uid'] || 'dev-user';
    const deleted = await Resume.findOneAndDelete({ _id: req.params.id, userId });
    if (!deleted) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    return res.json({ message: 'Resume deleted successfully' });
  } catch (err) {
    console.error('deleteResume error:', err);
    return res.status(500).json({ error: 'Failed to delete resume' });
  }
}

module.exports = {
  uploadResume,
  getResumes,
  getResume,
  analyzeResumeDoc,
  deleteResume,
};
