// Custom error class untuk error yang diantisipasi di aplikasi
// Bisa dibedakan dengan error sistem yang tidak terduga
export class AppError extends Error {
  public statusCode: number;
  // Menandakan ini adalah error operasional yang diharapkan
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    // Capture stack trace tanpa menyertakan constructor ini
    Error.captureStackTrace(this, this.constructor);
  }
}