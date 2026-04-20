export const ADMIN_ROLE = 'admin';

export const CASH_FLOW_ALLOWED_ROLES = [ADMIN_ROLE] as const;

export const NOTIFICATIONS_ALLOWED_ROLES = [
  ADMIN_ROLE,
  'contador_family_office',
] as const;
