/**
 * Channel Member Roles
 *
 * Roles are channel-specific — a user can be OWNER in one channel
 * and EDITOR in another. There are NO global roles on User.
 */
export const ROLES = {
  OWNER: "OWNER",
  EDITOR: "EDITOR",
};

export const ALL_ROLES = Object.values(ROLES);
