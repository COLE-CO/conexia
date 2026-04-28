export const ADMIN_ROLE = 'admin';
export const COLE_CO_ACCOUNTANT_ROLE = 'contador_cole_co';

export const CASH_FLOW_ALLOWED_ROLES = [
  ADMIN_ROLE,
  COLE_CO_ACCOUNTANT_ROLE,
] as const;

export const NOTIFICATIONS_ALLOWED_ROLES = [
  ADMIN_ROLE,
  'contador_family_office',
] as const;
