export const TRANSACTION_STATUS = {
  PENDING: 'WAITING_PAYMENT',
  WAITING_CONFIRMATION: 'WAITING_CONFIRMATION',
  CONFIRMED: 'DONE',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  CANCELED: 'CANCELED',
} as const;

export const TICKET_TYPE = {
  GENERAL: 'GENERAL',
  VIP: 'VIP',
} as const;

export const POINTS_CONFIG = {
  MAX_PER_TRANSACTION: 50000,
  POINT_VALUE: 1, // 1 point = 1 IDR
} as const;

export const API_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  MY_TICKETS: '/my-tickets',
  MY_TRANSACTIONS: '/my-transactions',
  PROFILE: '/profile',
  EVENTS_CREATE: '/events/create',
  TRANSACTIONS: '/transactions',
  TRANSACTIONS_ORGANIZER: '/transactions/organizer',
} as const;