import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { deleteSessionById, getSession, touchSession } from "../services/auth.service.js";
import { AppError } from "../utils/app-error.js";
import { clearSessionCookie } from "../utils/cookies.js";

export async function requireAuth(request: Request, response: Response, next: NextFunction): Promise<void> {
  const token = request.cookies?.[env.SESSION_COOKIE_NAME] as string | undefined;
  if (!token) {
    next(new AppError(401, "Authentication is required", "UNAUTHENTICATED"));
    return;
  }

  const session = await getSession(token);
  if (!session || !session.isActive || session.expiresAt.getTime() <= Date.now()) {
    if (session) await deleteSessionById(session.sessionId);
    clearSessionCookie(response);
    next(new AppError(401, "Session has expired", "SESSION_EXPIRED"));
    return;
  }

  request.auth = {
    userId: session.userId,
    sessionId: session.sessionId,
    name: session.name,
    email: session.email,
    role: session.role,
    expiresAt: session.expiresAt,
  };
  void touchSession(session.sessionId).catch(console.error);
  next();
}
