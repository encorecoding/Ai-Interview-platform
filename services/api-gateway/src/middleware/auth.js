const admin = require('firebase-admin');

// Initialize Firebase Admin only once
let firebaseInitialized = false;

function initFirebase() {
  if (firebaseInitialized) return;
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized');
  } catch (err) {
    console.warn('⚠️  Firebase Admin not initialized — running in development mode without token verification');
    console.warn('    Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY to enable auth');
  }
}

initFirebase();

/**
 * Middleware to verify Firebase ID token.
 * In development mode (when Firebase is not configured), skips verification
 * and attaches a mock user to allow testing without credentials.
 */
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  // Development mode — skip verification if Firebase is not configured
  if (!firebaseInitialized || !process.env.FIREBASE_PROJECT_ID) {
    console.warn('[DEV] Firebase not configured — skipping token verification');
    // Decode token payload (not verified) for development purposes
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        req.user = { uid: payload.user_id || payload.sub || 'dev-user', email: payload.email };
      } else {
        req.user = { uid: 'dev-user', email: 'dev@prepai.local' };
      }
    } catch {
      req.user = { uid: 'dev-user', email: 'dev@prepai.local' };
    }
    req.headers['x-user-uid'] = req.user.uid;
    req.headers['x-user-email'] = req.user.email;
    return next();
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
    req.headers['x-user-uid'] = decoded.uid;
    req.headers['x-user-email'] = decoded.email;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { verifyFirebaseToken };
