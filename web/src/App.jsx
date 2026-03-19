import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import JobsPage from './pages/JobsPage';
import EventsPage from './pages/EventsPage';
import ResearchPage from './pages/ResearchPage';
import MessagingPage from './pages/MessagingPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';

const AppLayout = ({ children }) => (
  <div className="layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.07)' },
        }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout><FeedPage /></AppLayout>} />
            <Route path="/jobs" element={<AppLayout><JobsPage /></AppLayout>} />
            <Route path="/events" element={<AppLayout><EventsPage /></AppLayout>} />
            <Route path="/research" element={<AppLayout><ResearchPage /></AppLayout>} />
            <Route path="/messages" element={<AppLayout><MessagingPage /></AppLayout>} />
            <Route path="/notifications" element={<AppLayout><NotificationsPage /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/analytics" element={<AppLayout><AnalyticsPage /></AppLayout>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
