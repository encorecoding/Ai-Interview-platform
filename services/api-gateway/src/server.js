const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { verifyFirebaseToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 5000;

// ─── Security ──────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Note: Avoid global express.json() here so raw request streams
// are not drained before being forwarded by http-proxy-middleware

// ─── Logging ────────────────────────────────────────────────────────────────
app.use(morgan('dev'));

// ─── Request ID ─────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  next();
});

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'AI rate limit exceeded. Please wait before sending more requests.' },
});

app.use('/api', globalLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/interviews/*/answer', aiLimiter);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: {
      userService: process.env.USER_SERVICE_URL,
      resumeService: process.env.RESUME_SERVICE_URL,
      interviewService: process.env.INTERVIEW_SERVICE_URL,
      aiService: process.env.AI_SERVICE_URL,
      feedbackService: process.env.FEEDBACK_SERVICE_URL,
      roadmapService: process.env.ROADMAP_SERVICE_URL,
    },
  });
});

// ─── Proxy helper ───────────────────────────────────────────────────────────
function createProxy(target, pathRewrite = {}) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: fixRequestBody,
      error: (err, req, res) => {
        console.error(`Proxy error to ${target}:`, err.message);
        res.status(503).json({
          error: 'Service temporarily unavailable',
          service: target,
          message: 'The backend service is not running. Please start all services.',
        });
      },
    },
  });
}

// ─── Public Routes (no auth required) ──────────────────────────────────────
app.use(
  '/api/auth',
  createProxy(
    process.env.USER_SERVICE_URL || 'http://localhost:5001',
    { '^/api/auth': '/api/auth' }
  )
);

// ─── Auth Middleware ─────────────────────────────────────────────────────────
app.use('/api', verifyFirebaseToken);

// ─── Protected Service Routes ────────────────────────────────────────────────
const USER_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';
const RESUME_URL = process.env.RESUME_SERVICE_URL || 'http://localhost:5002';
const INTERVIEW_URL = process.env.INTERVIEW_SERVICE_URL || 'http://localhost:5003';
const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:5004';
const FEEDBACK_URL = process.env.FEEDBACK_SERVICE_URL || 'http://localhost:5005';
const ROADMAP_URL = process.env.ROADMAP_SERVICE_URL || 'http://localhost:5006';

app.use('/api/users', createProxy(USER_URL));
app.use('/api/resumes', createProxy(RESUME_URL));
app.use('/api/interviews', createProxy(INTERVIEW_URL));
app.use('/api/ai', createProxy(AI_URL));
app.use('/api/feedback', createProxy(FEEDBACK_URL));
app.use('/api/roadmaps', createProxy(ROADMAP_URL));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Gateway error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
