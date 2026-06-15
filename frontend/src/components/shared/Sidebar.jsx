import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Hash, Plus, LogIn, LayoutDashboard, FileVideo, Upload,
  Users, X, LogOut, Settings, MessageSquare, Calendar, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useChannel from '../../hooks/useChannel';
import { getInitials } from '../../utils/helpers';
import { ROLE_CONFIG } from '../../utils/constants';

/**
 * Sidebar — channel sidebar with channel list + channel navigation.
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-bg-secondary shadow-[inset_-4px_0_16px_var(--color-sh-dark)]
                    flex flex-col transition-transform duration-300
                    lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border/30">
          <button onClick={() => navigate('/channels')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-[10px] bg-bg neu-out flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent-purple" />
            </div>
            <span className="text-lg font-bold text-text-bright tracking-tight">
              Reel<span className="text-accent-purple">Ops</span>
            </span>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[10px] bg-bg neu-out flex items-center justify-center text-text-dim hover:text-text-bright lg:hidden transition-all active:neu-in"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel list section */}
        <div className="flex-1 overflow-y-auto py-5 custom-scrollbar">
          {/* My Channels header */}
          <div className="px-5 mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-dim">
              Channels
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => { navigate('/channels/create'); onClose?.(); }}
                className="w-6 h-6 rounded-md bg-bg neu-out flex items-center justify-center text-text-dim hover:text-accent-purple transition-all active:neu-in"
                title="Create channel"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { navigate('/channels/join'); onClose?.(); }}
                className="w-6 h-6 rounded-md bg-bg neu-out flex items-center justify-center text-text-dim hover:text-accent-cyan transition-all active:neu-in"
                title="Join channel"
              >
                <LogIn className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Channel list */}
          <nav className="px-3 space-y-1.5">
            {channels.map((item) => {
              const ch = item.channel || item;
              const chId = ch._id;
              const isActive = channelId === chId;
              const roleConfig = ROLE_CONFIG[item.role] || {};

              return (
                <button
                  key={chId}
                  onClick={() => { navigate(`/channels/${chId}`); onClose?.(); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[12px] text-[13px] font-bold transition-all text-left
                    ${isActive
                      ? 'bg-bg neu-in text-accent-purple'
                      : 'text-text-dim hover:bg-bg hover:neu-out hover:text-text-bright'
                    }`}
                >
                  <Hash className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="truncate flex-1 tracking-wide">{ch.name}</span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]"
                    style={{ color: roleConfig.color, backgroundColor: `${roleConfig.color}15` }}
                  >
                    {item.role}
                  </span>
                </button>
              );
            })}

            {channels.length === 0 && (
              <div className="px-3 py-6 text-center">
                <p className="text-[12px] font-medium text-text-dim">No channels yet</p>
                <p className="text-[11px] font-light text-text-muted mt-1">Create or join one to get started</p>
              </div>
            )}
          </nav>

          {/* Channel nav (when inside a channel) */}
          {channelId && activeChannel && (
            <div className="mt-6 pt-5 border-t border-border/30">
              <div className="px-5 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-cyan">
                  {activeChannel.name}
                </span>
              </div>
              <nav className="px-3 space-y-1.5">
                {channelNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={`/channels/${channelId}${item.path}`}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[13px] font-bold transition-all
                       ${isActive
                         ? 'bg-bg neu-in text-accent-cyan'
                         : 'text-text-dim hover:bg-bg hover:neu-out hover:text-text-bright'
                       }`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    <span className="tracking-wide">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* User section */}
        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-10 h-10 rounded-[12px] bg-bg neu-in flex items-center justify-center text-[13px] font-bold text-accent-purple shadow-[inset_2px_2px_5px_var(--color-sh-dark)]">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-text-bright truncate tracking-wide">{user?.name}</p>
              <p className="text-[11px] font-medium text-text-dim truncate">{user?.email}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { navigate('/profile'); onClose?.(); }}
                className="w-7 h-7 rounded-md bg-bg neu-out flex items-center justify-center text-text-dim hover:text-accent-cyan transition-all active:neu-in"
                title="Profile Settings"
              >
                <User className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleLogout}
                className="w-7 h-7 rounded-md bg-bg neu-out flex items-center justify-center text-text-dim hover:text-danger transition-all active:neu-in"
                title="Logout"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
