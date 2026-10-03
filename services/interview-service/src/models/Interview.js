const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    type: { type: String, enum: ['technical', 'hr', 'behavioral', 'situational'], default: 'technical' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    topic: { type: String, default: '' },
    expectedConcepts: [String],
    answer: { type: String, default: '' },
    score: { type: Number, min: 0, max: 100, default: 0 },
    feedback: { type: String, default: '' },
    timeSpent: { type: Number, default: 0 }, // seconds
  },
  { _id: true }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['Technical', 'HR', 'Mixed'],
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'abandoned'],
      default: 'pending',
    },
    duration: {
      type: Number, // planned duration in minutes
      default: 30,
    },
    actualDuration: {
      type: Number, // actual duration in minutes
      default: 0,
    },
    resumeId: {
      type: String,
      default: null,
    },
    questions: [questionSchema],
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    technicalScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    problemSolvingScore: { type: Number, default: 0 },
    feedback: {
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      topicScores: [{ topic: String, score: Number }],
    },
    sessionId: {
      type: String, // Redis session key
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

interviewSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Interview', interviewSchema);
