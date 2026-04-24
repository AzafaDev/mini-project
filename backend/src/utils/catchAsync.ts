import { Request, Response, NextFunction } from "express";

// Wrapper high order function untuk menangkap error dari async function
// Mencegah unhandled promise rejection di controller
// Semua error otomatis diteruskan ke global error handler
export const catchAsync = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req as T, res, next).catch(next);
  };
};
