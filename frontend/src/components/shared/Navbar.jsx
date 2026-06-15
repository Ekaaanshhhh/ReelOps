import { useNavigate } from 'react-router-dom';
import { Menu, Hash, Bell, Search } from 'lucide-react';
import useChannel from '../../hooks/useChannel';
import { ROLE_CONFIG } from '../../utils/constants';

/**
 * Navbar — top navigation bar showing active channel info and controls.
 */
export default function Navbar({ title, onMenuClick }) {
  const { activeChannel, userRole } = useChannel();
  const roleConfig = ROLE_CONFIG[userRole] || {};
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-xl shadow-[0_4px_20px_var(--color-sh-dark)] border-b border-border/30">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="w-9 h-9 rounded-[10px] bg-bg neu-out flex items-center justify-center text-text-dim hover:text-text-bright lg:hidden transition-all active:neu-in"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {activeChannel ? (
              <>
                <Hash className="w-[18px] h-[18px] text-text-dim" />
                <h1 className="text-[16px] font-bold text-text-bright tracking-tight">
                  {activeChannel.name}
                </h1>
                {userRole && (
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg ml-1.5 shadow-[inset_2px_2px_5px_var(--color-sh-dark),inset_-2px_-2px_5px_var(--color-sh-light)]"
                    style={{ color: roleConfig.color, backgroundColor: `${roleConfig.color}15` }}
                  >
                    {roleConfig.label}
                  </span>
                )}
              </>
            ) : (
              <h1 className="text-[16px] font-bold text-text-bright tracking-tight">
                {title || 'ReelOps'}
              </h1>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-[10px] bg-bg neu-out flex items-center justify-center text-text-dim hover:text-text-bright transition-all active:neu-in">
            <Search className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-[10px] bg-bg neu-out flex items-center justify-center text-text-dim hover:text-text-bright transition-all active:neu-in relative">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
