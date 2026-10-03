import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
}

const DEMO_STORAGE_KEY = 'prepai_demo_active';

const createDemoUser = (): User => ({
  uid: 'dev-user',
  email: 'alex.chen@carriermantra.demo',
  displayName: 'Alex Chen',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date(Date.now() - 86400000 * 14).toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: 'demo-token',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'demo-bearer-token',
  getIdTokenResult: async () => ({
    token: 'demo-bearer-token',
    signInProvider: 'demo',
    claims: {},
    authTime: '',
    issuedAtTime: '',
    expirationTime: '',
  }),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  providerId: 'demo',
} as unknown as User);

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if demo session is active in localStorage
    const demoActive = localStorage.getItem(DEMO_STORAGE_KEY) === 'true';

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsDemoMode(false);
        localStorage.removeItem(DEMO_STORAGE_KEY);
        // Sync user with backend
        try {
          await syncUserWithBackend(firebaseUser);
        } catch {
          console.warn('Backend sync failed — running in offline mode');
        }
      } else if (demoActive) {
        setUser(createDemoUser());
        setIsDemoMode(true);
      } else {
        setUser(null);
        setIsDemoMode(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const syncUserWithBackend = async (firebaseUser: User) => {
    const token = await firebaseUser.getIdToken();
    await api.post('/users/sync', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      profileImage: firebaseUser.photoURL,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const loginAsDemo = () => {
    localStorage.setItem(DEMO_STORAGE_KEY, 'true');
    setUser(createDemoUser());
    setIsDemoMode(true);
  };

  const signIn = async (email: string, password: string) => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setIsDemoMode(false);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setIsDemoMode(false);
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
  };

  const signInWithGoogle = async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setIsDemoMode(false);
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setIsDemoMode(false);
    setUser(null);
    try {
      await signOut(auth);
    } catch {
      // Ignore if not signed in with firebase
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, signIn, signUp, signInWithGoogle, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
