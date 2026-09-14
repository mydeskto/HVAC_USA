import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({ error: { code: "ROUTE_NOT_FOUND", message: `Route ${request.method} ${request.originalUrl} was not found` } });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  const bodyError = error as { type?: string };
  if (bodyError?.type === "entity.too.large") {
    response.status(413).json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Request body exceeds the allowed size" } });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: { code: error.code, message: error.message, details: error.details } });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Request validation failed", details: error.flatten() } });
    return;
  }

  const pgError = error as { code?: string; constraint?: string };
  if (pgError?.code === "23505") {
    response.status(409).json({ error: { code: "CONFLICT", message: "A record with the same unique value already exists", constraint: pgError.constraint } });
    return;
  }
  if (pgError?.code === "23503") {
    response.status(409).json({ error: { code: "FOREIGN_KEY_CONFLICT", message: "This record references missing or protected data", constraint: pgError.constraint } });
    return;
  }

  console.error(error);
  response.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An unexpected server error occurred", ...(env.isProduction ? {} : { details: String(error) }) } });
};
