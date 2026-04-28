import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodIssue } from "zod";
import { logger } from "../utils/logger";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body || {},
        query: req.query || {},
        params: req.params || {},
      });
      next();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "issues" in error) {
        const zodError = error as { issues: ZodIssue[] };
        const firstError = zodError.issues[0];
        const message = firstError.message;

        return res.status(400).json({
          success: false,
          message: `${message}`,
        });
      }
      next(error);
    }
  };
};
