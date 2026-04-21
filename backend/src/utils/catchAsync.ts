import { Request, Response, NextFunction } from "express";

/**
 * Wrapper untuk async function di controller
 * SEMUA controller WAJIB menggunakan ini, JANGAN buat try-catch manual di controller
 * Error akan otomatis diteruskan ke error handler middleware
 */
export const catchAsync = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req as T, res, next).catch(next);
  };
};
