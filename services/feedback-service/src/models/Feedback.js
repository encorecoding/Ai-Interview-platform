const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    interviewId: { type: String, index: true },
    role: { type: String, default: 'Software Engineer' },
    type: { type: String, default: 'Technical' },
    overallScore: { type: Number, default: 75 },
    totalInterviews: { type: Number, default: 1 },
    strengths: [
      {
        category: String,
        feedback: String,
        examples: [String],
      },
    ],
    weaknesses: [
      {
        category: String,
        feedback: String,
        actionItems: [String],
      },
    ],
    technicalFeedback: {
      dsa: { type: Number, default: 75 },
      dbms: { type: Number, default: 70 },
      os: { type: Number, default: 65 },
      oop: { type: Number, default: 80 },
      systemDesign: { type: Number, default: 60 },
      networking: { type: Number, default: 65 },
    },
    communicationFeedback: {
      clarity: { type: Number, default: 75 },
      structure: { type: Number, default: 75 },
      confidence: { type: Number, default: 70 },
      examples: { type: Number, default: 72 },
    },
    practiceRecommendations: [
      {
        resource: String,
        focus: String,
        priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
