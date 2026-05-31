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
    <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-bg-secondary lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {activeChannel ? (
              <>
                <Hash className="w-4 h-4 text-text-muted" />
                <h1 className="text-base font-semibold text-text font-heading">
                  {activeChannel.name}
                </h1>
                {userRole && (
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-1"
                    style={{ color: roleConfig.color, backgroundColor: roleConfig.bg }}
                  >
                    {roleConfig.label}
                  </span>
                )}
              </>
            ) : (
              <h1 className="text-base font-semibold text-text font-heading">
                {title || 'ReelOps'}
              </h1>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-bg-secondary transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-bg-secondary transition-colors relative">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
