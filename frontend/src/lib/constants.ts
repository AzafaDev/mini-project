/**
 * Konstanta semua status yang mungkin untuk transaksi
 */
export const TRANSACTION_STATUS = {
  PENDING: 'WAITING_PAYMENT',
  WAITING_CONFIRMATION: 'WAITING_CONFIRMATION',
  CONFIRMED: 'DONE',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  CANCELED: 'CANCELED',
} as const;

/**
 * Konstanta tipe tiket yang tersedia
 */
export const TICKET_TYPE = {
  GENERAL: 'GENERAL',
  VIP: 'VIP',
} as const;

/**
 * Konfigurasi sistem poin loyalty
 * MAX_PER_TRANSACTION: Batas maksimal poin yang bisa dipakai per transaksi
 * POINT_VALUE: Nilai tukar 1 poin dalam rupiah
 */
export const POINTS_CONFIG = {
  MAX_PER_TRANSACTION: 50000,
  POINT_VALUE: 1,
} as const;

/**
 * Daftar route aplikasi frontend
 */
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

/**
 * Daftar gambar fallback untuk kasus gambar gagal dimuat
 */
export const FALLBACK_IMAGES = {
  AVATAR: "https://via.placeholder.com/64",
  EVENT_SMALL: "https://via.placeholder.com/64",
  EVENT_HERO: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdRDS19K5BkPJR_o2gLhL_xSButi1v__xH0YgKvN3kq9-HtpAvjR_2gAdUFjid84mEd0CaTu2Sq-c2J4pwmljaPxupQub4NmuRrlvhQpBgg2VnBlUlURuheitOpwPORiqygxSyVPs8qDWcudVps9rRxX1SIXgjUUBZj_yQzZFY27qefC5xmU9u0trPGRuD6wL-eHP_1j5Bf1CBqxODn823AnAbiLnf39GZwrsUL0CGfEoVnugGWZnzXmh1eqwNnOXh4TzEcX6BmU-X",
  EVENT_TICKET: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDn-FArK1l_5_YNPDgqyu5sb-Pj7e2E1m5c8DmnXy8_LJgVnD4KPXYhIiWXtT-C1Ps2Gsl4EQEgttumnFqV1fkgcXSmsUYqclTIXvI5Ou-UXlNAXhXewRwBN3MlZ5IC5ZcnOajF_ah6UT38AHme79MpmXvsal-rHAfZaDlD9j-5tamGTeImlxyPplFgpYeWYf_VgGOgLSLK4PsYc-bjSRdlVFtuhUkxm2iBi9w6D7oQGtb_Q2dM2Nxn30uWQ1_AWo8kipJ44f_YibL",
  USER_AVATAR: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMIi3oA8ClFG0LdduEuZLhW5_oQlpjBRWMC9oqlfZHCnElcZE7_gKp5lqdhlcIJYowP5RQtDbTuVGFkFKYgEQq1oKBeXg-bKGZAFBzpirrflGoYwg9Mg6swHLfmxDlIMytqDAHHDjM62A-buWdr3r6_yObU-cKRWndEIssJtj8ZRonC4o2wjsfx53y9DwLPNd8lXg55q5Va3aiQX50h7cBtXk8aS8nnaOTxWgJfkBvqxocgAt6-ac8onMDDGBt7VOh-MnU94LwxTdO",
  USER_COVER: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgqLhXXJNbmvvCdEbZ7AKonin1xZJEPSH5PlQU7Y3xT-5MXpJuyVWH3IrJWepOI0LM2vzo00b31D5nypgmoYaTculyAv1-okKaF_x0qyZ2sazvBnVc0DVFTnlyf7fC96kIPlbDi15Vps65AGriAuE_mdL1fstX46X8rFm_WQcRgwuLN-lZLNUuRRei6ibWSxai0eo6SwuQFoUn-c3Ko6aME_LOvQckieY6XJ21uij78J4FGUXEVoO2xyrgbjuQVsc8pJfeWW7SHXHS",
  EMPTY_STATE: "https://via.placeholder.com/300x200?text=No+Image",
};

/**
 * Daftar kategori event yang tersedia di sistem
 */
export const EVENT_CATEGORIES = [
  "Music",
  "Conference",
  "Workshop",
  "Seminar",
  "Sports",
  "Entertainment",
] as const;