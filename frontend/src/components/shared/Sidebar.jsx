import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Hash, Plus, LogIn, LayoutDashboard, FileVideo, Upload,
  Users, X, LogOut, ChevronDown, ChevronRight, Settings, MessageSquare, Calendar, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useChannel from '../../hooks/useChannel';
import { getInitials } from '../../utils/helpers';
import { ROLE_CONFIG } from '../../utils/constants';

/**
 * Sidebar — Discord-style channel sidebar with channel list + channel navigation.
 */
export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { channels, activeChannel } = useChannel();
  const { channelId } = useParams();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  // Channel navigation items (shown when inside a channel)
  const channelNavItems = [
    { path: '', label: 'Overview', icon: LayoutDashboard, end: true },
    { path: '/submissions', label: 'Submissions', icon: FileVideo },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/members', label: 'Members', icon: Users },
    { path: '/chat', label: 'Chat', icon: MessageSquare },
    { path: '/automations', label: 'Automations', icon: Calendar },
    { path: '/settings#general', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-bg-secondary border-r border-border
                    flex flex-col transition-transform duration-300
                    lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <button onClick={() => navigate('/channels')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold font-heading text-text">
              Reel<span className="text-accent-purple">Ops</span>
            </span>
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel list section */}
        <div className="flex-1 overflow-y-auto py-3">
          {/* My Channels header */}
          <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Channels
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => { navigate('/channels/create'); onClose?.(); }}
                className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-accent-purple hover:bg-accent-purple/10 transition-all"
                title="Create channel"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { navigate('/channels/join'); onClose?.(); }}
                className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 transition-all"
                title="Join channel"
              >
                <LogIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Channel list */}
          <nav className="px-2 space-y-0.5">
            {channels.map((item) => {
              const ch = item.channel || item;
              const chId = ch._id;
              const isActive = channelId === chId;
              const roleConfig = ROLE_CONFIG[item.role] || {};

              return (
                <button
                  key={chId}
                  onClick={() => { navigate(`/channels/${chId}`); onClose?.(); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left
                    ${isActive
                      ? 'bg-accent-purple/10 text-accent-purple-light'
                      : 'text-text-secondary hover:bg-card-hover hover:text-text'
                    }`}
                >
                  <Hash className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate flex-1">{ch.name}</span>
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: roleConfig.color, backgroundColor: roleConfig.bg }}
                  >
                    {item.role}
                  </span>
                </button>
              );
            })}

            {channels.length === 0 && (
              <div className="px-3 py-6 text-center">
                <p className="text-xs text-text-muted">No channels yet</p>
                <p className="text-xs text-text-muted mt-1">Create or join one to get started</p>
              </div>
            )}
          </nav>

          {/* Channel nav (when inside a channel) */}
          {channelId && activeChannel && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="px-4 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  {activeChannel.name}
                </span>
              </div>
              <nav className="px-2 space-y-0.5">
                {channelNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={`/channels/${channelId}${item.path}`}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                       ${isActive
                         ? 'bg-accent-purple/10 text-accent-purple-light font-medium'
                         : 'text-text-secondary hover:bg-card-hover hover:text-text'
                       }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* User section */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-accent-purple/10 flex items-center justify-center text-xs font-semibold text-accent-purple">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{user?.name}</p>
              <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { navigate('/profile'); onClose?.(); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-card-hover transition-all"
              title="Profile Settings"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
