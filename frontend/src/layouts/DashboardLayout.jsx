import { useState, useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar';
import PageTransition from '../components/shared/PageTransition';
import useAuth from '../hooks/useAuth';
import useChannel from '../hooks/useChannel';

/**
 * DashboardLayout
 *
 * Two-panel layout: channel sidebar (left) + content area (right).
 * Fetches channels on mount and sets active channel from URL params.
 */
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { fetchChannels, setActiveChannel, clearActiveChannel } = useChannel();
  const { channelId } = useParams();
  const location = useLocation();

  // Fetch channels on mount
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Set active channel when channelId changes in URL
  useEffect(() => {
    if (channelId && user?._id) {
      setActiveChannel(channelId, user._id);
    } else {
      clearActiveChannel();
    }
  }, [channelId, user?._id, setActiveChannel, clearActiveChannel]);

  // Derive page title from path
  const getTitle = () => {
    if (location.pathname === '/channels') return 'My Channels';
    if (location.pathname === '/channels/create') return 'Create Channel';
    if (location.pathname === '/channels/join') return 'Join Channel';
    return 'ReelOps';
  };

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Navbar title={getTitle()} onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
