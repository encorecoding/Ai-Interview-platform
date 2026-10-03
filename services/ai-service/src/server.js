const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.AI_SERVICE_PORT || process.env.PORT || 5004;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-service',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes: support both /api/ai and direct mount
app.use('/api/ai', aiRoutes);
app.use('/', aiRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  console.error('AI Service Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error in AI service' });
});

app.listen(PORT, () => {
  console.log(`🧠 AI Service running on http://localhost:${PORT}`);
});

module.exports = app;
