import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";

export function sessionCookieOptions(expiresAt?: Date): CookieOptions {
  const options: CookieOptions = {
    httpOnly: true,
    secure: env.isProduction || env.COOKIE_SAME_SITE === "none",
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
  };
  if (env.COOKIE_DOMAIN) options.domain = env.COOKIE_DOMAIN;
  if (expiresAt) {
    options.expires = expiresAt;
    options.maxAge = Math.max(0, expiresAt.getTime() - Date.now());
  }
  return options;
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(env.SESSION_COOKIE_NAME, sessionCookieOptions());
}
