// ── Platforms (aligned with backend constants) ──────────────────────
export const PLATFORMS = [
  { id: 'INSTAGRAM', name: 'Instagram', color: '#E1306C', icon: 'Instagram' },
  { id: 'YOUTUBE', name: 'YouTube', color: '#FF0000', icon: 'Youtube' },
];

// ── Submission Statuses (aligned with backend) ──────────────────────
export const STATUS_TYPES = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  SCHEDULED: 'SCHEDULED',
  REJECTED: 'REJECTED',
  POSTED: 'POSTED',
};

export const STATUS_CONFIG = {
  [STATUS_TYPES.DRAFT]: {
    label: 'Draft',
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.15)',
    icon: 'FileEdit',
  },
  [STATUS_TYPES.PENDING_APPROVAL]: {
    label: 'Pending',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)',
    icon: 'Clock',
  },
  [STATUS_TYPES.APPROVED]: {
    label: 'Approved',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.15)',
    icon: 'CheckCircle',
  },
  [STATUS_TYPES.SCHEDULED]: {
    label: 'Scheduled',
    color: '#3B82F6', // Blue for scheduled
    bg: 'rgba(59, 130, 246, 0.15)',
    icon: 'Calendar',
  },
  [STATUS_TYPES.REJECTED]: {
    label: 'Rejected',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    icon: 'XCircle',
  },
  [STATUS_TYPES.POSTED]: {
    label: 'Posted',
    color: '#7C3AED',
    bg: 'rgba(124, 58, 237, 0.15)',
    icon: 'Send',
  },
};

// ── Channel Roles ───────────────────────────────────────────────────
export const ROLES = {
  OWNER: 'OWNER',
  EDITOR: 'EDITOR',
};

export const ROLE_CONFIG = {
  [ROLES.OWNER]: {
    label: 'Owner',
    color: '#7C3AED',
    bg: 'rgba(124, 58, 237, 0.15)',
    icon: 'Crown',
  },
  [ROLES.EDITOR]: {
    label: 'Editor',
    color: '#06B6D4',
    bg: 'rgba(6, 182, 212, 0.15)',
    icon: 'Pencil',
  },
};

// ── API ─────────────────────────────────────────────────────────────
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  'http://localhost:5005/api/v1';

// ── Navigation ──────────────────────────────────────────────────────
export const CHANNEL_NAV_ITEMS = [
  { path: '', label: 'Overview', icon: 'LayoutDashboard' },
  { path: '/submissions', label: 'Submissions', icon: 'FileVideo' },
  { path: '/automations', label: 'Automations', icon: 'Calendar' },
  { path: '/upload', label: 'Upload', icon: 'Upload' },
];
