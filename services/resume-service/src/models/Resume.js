const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    fileType: { type: String, default: '' },
    rawText: { type: String, default: '' },
    score: { type: Number, default: 0 },
    skills: [{ type: String }],
    experience: [
      {
        company: String,
        role: String,
        duration: String,
        highlights: [String],
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        year: String,
      },
    ],
    projects: [
      {
        name: String,
        tech: [String],
        desc: String,
      },
    ],
    categoryScores: [
      {
        subject: String,
        value: Number,
      },
    ],
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    missingKeywords: [{ type: String }],
    parsedData: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['uploaded', 'analyzed', 'failed'],
      default: 'uploaded',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
