import { Crown, Pencil } from 'lucide-react';
import { ROLE_CONFIG } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';

/**
 * MemberList — displays channel members with their roles.
 */
export default function MemberList({ members = [], currentUserId }) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        No members found.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {members.map((member) => {
        const user = member.user || {};
        const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.EDITOR;
        const RoleIcon = member.role === 'OWNER' ? Crown : Pencil;
        const isCurrentUser = user._id === currentUserId;

        return (
          <div
            key={member._id}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-accent-purple/10 flex items-center justify-center text-xs font-semibold text-accent-purple">
                {getInitials(user.name)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text">
                    {user.name || 'Unknown'}
                  </span>
                  {isCurrentUser && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-purple/10 text-accent-purple font-medium">
                      You
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted">{user.email}</p>
              </div>
            </div>

            {/* Role badge */}
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ color: roleConfig.color, backgroundColor: roleConfig.bg }}
            >
              <RoleIcon className="w-3 h-3" />
              {roleConfig.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
