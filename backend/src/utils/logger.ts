/**
 * Custom logger utility untuk memisahkan log debug dengan production
 * Logger.debug hanya akan tampil di environment development
 * Logger.error akan selalu tampil di semua environment
 */
export const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    console.info(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
  warn: (...args: any[]) => {
    console.warn(...args);
  },
};
