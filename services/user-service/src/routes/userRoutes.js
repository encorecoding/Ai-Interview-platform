const express = require('express');
const router = express.Router();
const {
  syncUser,
  getProfile,
  updateProfile,
  getDashboardStats,
} = require('../controllers/userController');

// POST /api/users/sync — Create or update user from Firebase
router.post('/sync', syncUser);

// GET /api/users/me — Get current user profile
router.get('/me', getProfile);

// PUT /api/users/me — Update profile
router.put('/me', updateProfile);

// GET /api/users/me/stats — Dashboard statistics
router.get('/me/stats', getDashboardStats);

module.exports = router;
