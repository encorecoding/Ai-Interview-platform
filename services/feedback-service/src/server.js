const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();
const PORT = process.env.FEEDBACK_SERVICE_PORT || process.env.PORT || 5005;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepai_feedback';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connect MongoDB with fallback
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected (feedback-service)'))
  .catch((err) => console.warn('⚠️  MongoDB connection error (feedback-service):', err.message));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'feedback-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/', feedbackRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Feedback Service Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error in feedback service' });
});

app.listen(PORT, () => {
  console.log(`💬 Feedback Service running on http://localhost:${PORT}`);
});

module.exports = app;
