const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const resumeRoutes = require('./routes/resumeRoutes');

const app = express();
const PORT = process.env.RESUME_SERVICE_PORT || process.env.PORT || 5002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepai_resumes';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Connect MongoDB with graceful fallback
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected (resume-service)'))
  .catch((err) => console.warn('⚠️  MongoDB connection error (resume-service):', err.message));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'resume-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/resumes', resumeRoutes);
app.use('/', resumeRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Resume Service Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error in resume service' });
});

app.listen(PORT, () => {
  console.log(`📄 Resume Service running on http://localhost:${PORT}`);
});

module.exports = app;
