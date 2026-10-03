const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  done: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  resources: [{ type: String }],
});

const phaseSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  duration: { type: String, default: '3 weeks' },
  completed: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  topics: [topicSchema],
});

const roadmapSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    targetRole: { type: String, required: true },
    careerGoal: { type: String, default: '' },
    estimatedDuration: { type: String, default: '16 weeks' },
    progress: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    phases: [phaseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
