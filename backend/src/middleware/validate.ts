import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/app-error.js";

export function validateBody(schema: ZodType): RequestHandler {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      next(new AppError(400, "Request validation failed", "VALIDATION_ERROR", result.error.flatten()));
      return;
    }
    request.body = result.data;
    next();
  };
}
