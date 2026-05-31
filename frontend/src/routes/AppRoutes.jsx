import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import HomePage from '../pages/HomePage';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';

// Profile pages
import ProfilePage from '../pages/profile/ProfilePage';

// Channel pages
import ChannelsPage from '../pages/channels/ChannelsPage';
import CreateChannel from '../pages/channels/CreateChannel';
import JoinChannel from '../pages/channels/JoinChannel';
import ChannelDetails from '../pages/channels/ChannelDetails';
import ChannelMembers from '../pages/channels/ChannelMembers';

// Submission pages
import UploadSubmission from '../pages/submissions/UploadSubmission';
import ChannelSubmissions from '../pages/submissions/ChannelSubmissions';
import SubmissionDetails from '../pages/submissions/SubmissionDetails';

// Automation pages
import ChannelAutomations from '../pages/automations/ChannelAutomations';
import AutomationDetails from '../pages/automations/AutomationDetails';

// Chat pages
import ChannelChatPage from '../pages/chat/ChannelChatPage';

// Settings pages
import ChannelSettingsPage from '../pages/settings/ChannelSettingsPage';

// Hooks
import useAuth from '../hooks/useAuth';

/**
 * GuestRoute — redirects to /channels if user IS authenticated.
 * Used for homepage, login, signup — pages guests should see.
 */
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/channels" replace />;
  }

  return children;
}

/**
 * AppRoutes — channel-centric route structure.
 *
 * Public:
 *   /                                → SaaS landing page (guests) or redirect (authed)
 *   /login, /signup
 *
 * Protected (require auth):
 *   /channels                        → all channels
 *   /channels/create                 → create channel
 *   /channels/join                   → join channel
 *   /channels/:channelId             → channel overview
 *   /channels/:channelId/submissions → channel submissions
 *   /channels/:channelId/upload      → upload to channel
 *   /channels/:channelId/members     → channel members
 *   /channels/:channelId/chat        → channel real-time chat
 *   /submissions/:id                 → submission details
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public: SaaS landing page for guests, redirect to /channels for authenticated users */}
      <Route path="/" element={<GuestRoute><HomePage /></GuestRoute>} />

      {/* Auth routes — also wrapped in GuestRoute so logged-in users skip to /channels */}
      <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/channels" element={<ChannelsPage />} />
        <Route path="/channels/create" element={<CreateChannel />} />
        <Route path="/channels/join" element={<JoinChannel />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Protected routes — with channelId param (channel workspace) */}
      <Route
        path="/channels/:channelId"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ChannelDetails />} />
        <Route path="submissions" element={<ChannelSubmissions />} />
        <Route path="upload" element={<UploadSubmission />} />
        <Route path="members" element={<ChannelMembers />} />
        <Route path="chat" element={<ChannelChatPage />} />
        <Route path="automations" element={<ChannelAutomations />} />
        <Route path="automations/:automationId" element={<AutomationDetails />} />
        <Route path="settings" element={<ChannelSettingsPage />} />
      </Route>

      {/* Protected: standalone submission details */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/submissions/:id" element={<SubmissionDetails />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
