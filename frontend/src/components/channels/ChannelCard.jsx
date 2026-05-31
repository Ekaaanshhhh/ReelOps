import { motion } from 'framer-motion';
import { Hash, Users, Crown, Pencil, ChevronRight } from 'lucide-react';
import { ROLE_CONFIG } from '../../utils/constants';
import { timeAgo } from '../../utils/helpers';

/**
 * ChannelCard — displays a channel in the channels grid.
 * Shows: name, role badge, member count, recent activity.
 */
export default function ChannelCard({ channel, role, joinedAt, onClick }) {
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.EDITOR;
  const RoleIcon = role === 'OWNER' ? Crown : Pencil;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group relative bg-card border border-border rounded-2xl p-5 cursor-pointer
                 transition-all duration-300 hover:border-border-light hover:shadow-lg hover:shadow-accent-purple/5"
    >
      {/* Gradient top accent */}
      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-accent-purple to-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Channel Icon + Name */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
            <Hash className="w-5 h-5 text-accent-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-text text-sm group-hover:text-accent-purple-light transition-colors">
              {channel?.name || 'Unnamed Channel'}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Joined {timeAgo(joinedAt)}
            </p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Role Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ color: roleConfig.color, backgroundColor: roleConfig.bg }}
        >
          <RoleIcon className="w-3 h-3" />
          {roleConfig.label}
        </span>
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-4 text-xs text-text-muted pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>Members</span>
        </div>
      </div>
    </motion.div>
  );
}
