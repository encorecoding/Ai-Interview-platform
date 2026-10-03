import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

// Lazy-loaded pages
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const InterviewSetupPage = lazy(() => import('./pages/InterviewSetupPage'));
const InterviewPage = lazy(() => import('./pages/InterviewPage'));
const InterviewResultPage = lazy(() => import('./pages/InterviewResultPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const ResumeAnalysisPage = lazy(() => import('./pages/ResumeAnalysisPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function PageLoader() {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#22222e',
              color: '#f3f4f6',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#6366f1', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><InterviewSetupPage /></ProtectedRoute>} />
            <Route path="/interview/:id" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
            <Route path="/interview/:id/result" element={<ProtectedRoute><InterviewResultPage /></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
            <Route path="/resume/:id" element={<ProtectedRoute><ResumeAnalysisPage /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* 404 fallback */}
            <Route path="*" element={
              <div className="min-h-screen mesh-bg flex items-center justify-center flex-col gap-4">
                <h1 className="text-6xl font-bold gradient-text">404</h1>
                <p className="text-gray-400">Page not found</p>
                <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
              </div>
            } />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
