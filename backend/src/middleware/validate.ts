import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodIssue } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("[DEBUG validate] schema:", schema);
      console.log("[DEBUG validate] parsing body:", req.body);
      schema.parse({
        body: req.body || {},
        query: req.query || {},
        params: req.params || {},
      });
      console.log("[DEBUG validate] passed!");
      next();
    } catch (error: unknown) {
      console.log("[DEBUG validate] error:", error);
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
