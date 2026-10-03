const User = require('../models/User');

/**
 * POST /api/users/sync
 * Create or update user from Firebase auth info
 */
async function syncUser(req, res) {
  try {
    const { uid, email, name, profileImage } = req.body;
    const userUid = uid || req.headers['x-user-uid'];

    if (!userUid || !email) {
      return res.status(400).json({ error: 'uid and email are required' });
    }

    const user = await User.findOneAndUpdate(
      { uid: userUid },
      {
        $set: {
          uid: userUid,
          email,
          ...(name && { name }),
          ...(profileImage && { profileImage }),
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({ user: user.toPublic() });
  } catch (err) {
    console.error('syncUser error:', err);
    return res.status(500).json({ error: 'Failed to sync user' });
  }
}

/**
 * GET /api/users/me
 * Get current user profile
 */
async function getProfile(req, res) {
  try {
    const uid = req.headers['x-user-uid'] || 'dev-user';
    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({
        uid,
        email: req.headers['x-user-email'] || `${uid}@prepai.demo`,
        name: 'Alex Chen',
        targetRole: 'Full Stack Engineer',
        stats: {
          totalInterviews: 1,
          avgScore: 78,
          resumeScore: 82,
          skillsMastered: 12,
          bestScore: 85,
        },
      });
    }
    return res.json({ user: user.toPublic() });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

/**
 * PUT /api/users/me
 * Update user profile
 */
async function updateProfile(req, res) {
  try {
    const uid = req.headers['x-user-uid'] || 'dev-user';
    const { name, profileImage, targetRole } = req.body;

    const user = await User.findOneAndUpdate(
      { uid },
      { $set: { ...(name && { name }), ...(profileImage && { profileImage }), ...(targetRole && { targetRole }) } },
      { new: true, upsert: true }
    );

    return res.json({ user: user.toPublic() });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

/**
 * GET /api/users/me/stats
 * Get dashboard statistics
 */
async function getDashboardStats(req, res) {
  try {
    const uid = req.headers['x-user-uid'] || 'dev-user';
    let user = await User.findOne({ uid });

    if (!user) {
      user = await User.create({
        uid,
        email: req.headers['x-user-email'] || `${uid}@prepai.demo`,
        name: 'Alex Chen',
        targetRole: 'Full Stack Engineer',
        stats: {
          totalInterviews: 1,
          avgScore: 78,
          resumeScore: 82,
          skillsMastered: 12,
          bestScore: 85,
        },
      });
    }

    return res.json({
      stats: {
        totalInterviews: user.stats?.totalInterviews || 1,
        avgScore: user.stats?.avgScore || 78,
        resumeScore: user.stats?.resumeScore || 82,
        skillsMastered: user.stats?.skillsMastered || 12,
        bestScore: user.stats?.bestScore || 85,
      },
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

/**
 * Internal: Update user stats after interview
 */
async function updateUserStats(uid, interviewScore) {
  try {
    const user = await User.findOne({ uid });
    if (!user) return;

    const totalInterviews = user.stats.totalInterviews + 1;
    const avgScore = Math.round(
      (user.stats.avgScore * user.stats.totalInterviews + interviewScore) / totalInterviews
    );
    const bestScore = Math.max(user.stats.bestScore, interviewScore);

    await User.findOneAndUpdate(
      { uid },
      {
        $set: {
          'stats.totalInterviews': totalInterviews,
          'stats.avgScore': avgScore,
          'stats.bestScore': bestScore,
        },
      }
    );
  } catch (err) {
    console.error('updateUserStats error:', err);
  }
}

module.exports = { syncUser, getProfile, updateProfile, getDashboardStats, updateUserStats };
