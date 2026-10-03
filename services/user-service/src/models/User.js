const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    targetRole: {
      type: String,
      default: '',
    },
    stats: {
      totalInterviews: { type: Number, default: 0 },
      avgScore: { type: Number, default: 0 },
      resumeScore: { type: Number, default: 0 },
      skillsMastered: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Never store password — Firebase handles authentication
userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('User', userSchema);
