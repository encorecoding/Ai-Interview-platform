const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const roadmapRoutes = require('./routes/roadmapRoutes');

const app = express();
const PORT = process.env.ROADMAP_SERVICE_PORT || process.env.PORT || 5006;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepai_roadmaps';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connect MongoDB with fallback
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected (roadmap-service)'))
  .catch((err) => console.warn('⚠️  MongoDB connection error (roadmap-service):', err.message));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'roadmap-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/roadmaps', roadmapRoutes);
app.use('/', roadmapRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Roadmap Service Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error in roadmap service' });
});

app.listen(PORT, () => {
  console.log(`🗺️ Roadmap Service running on http://localhost:${PORT}`);
});

module.exports = app;
