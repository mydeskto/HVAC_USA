import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireTrustedOrigin(request: Request, _response: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(request.method)) {
    next();
    return;
  }

  const origin = request.get("origin");
  if (origin && !env.frontendOrigins.includes(origin)) {
    next(new AppError(403, "Request origin is not allowed", "ORIGIN_REJECTED"));
    return;
  }

  next();
}
