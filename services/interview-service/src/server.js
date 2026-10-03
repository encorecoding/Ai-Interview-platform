const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const interviewRoutes = require('./routes/interviewRoutes');

const app = express();
const PORT = process.env.INTERVIEW_SERVICE_PORT || 5003;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/interviews', interviewRoutes);
app.use('/', interviewRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'interview-service' }));
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('Interview service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_career_platform';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Interview Service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    app.listen(PORT, () => console.log(`🚀 Interview Service running on port ${PORT} (no DB)`));
  });

module.exports = app;
