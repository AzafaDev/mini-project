// Batas waktu transaksi menunggu pembayaran sebelum otomatis expired
export const TRANSACTION_EXPIRATION_HOURS = 2;
// Batas waktu transaksi menunggu konfirmasi organizer sebelum otomatis dibatalkan
export const TRANSACTION_AUTO_CANCEL_DAYS = 3;
// Setiap 1 rupiah menghasilkan 10 poin
export const POINTS_EARNED_MULTIPLIER = 10;
// Maksimal poin yang bisa dipakai atau didapat per transaksi
export const MAX_POINTS_PER_TRANSACTION = 50000;

// Poin yang didapat ketika seseorang mendaftar via referral
export const REFERRAL_POINT_REWARD = 10000;
// Poin akan expired setelah 3 bulan sejak didapat
export const POINTS_EXPIRATION_MONTHS = 3;
// Coupon akan expired setelah 3 bulan sejak dibuat
export const COUPON_EXPIRATION_MONTHS = 3;

// Diskon referral sebesar 10%
export const REFERRAL_DISCOUNT_PERCENTAGE = 10;

// Nilai default untuk pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
// Batas maksimal data yang bisa diambil per halaman
export const MAX_LIMIT = 100;

// Token verifikasi email berlaku 24 jam
export const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
// Token reset password hanya berlaku 15 menit demi keamanan
export const RESET_PASSWORD_TOKEN_EXPIRY_MINUTES = 15;

// Round salt untuk bcrypt, nilai standar industry untuk keamanan dan performa
export const BCRYPT_SALT_ROUNDS = 10;
