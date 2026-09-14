import { Router } from "express";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";
import { loginRateLimit } from "../middleware/rate-limit.js";
import { validateBody } from "../middleware/validate.js";
import { login, revokeSession } from "../services/auth.service.js";
import { clearSessionCookie, sessionCookieOptions } from "../utils/cookies.js";
import { loginSchema } from "../validation/resources.js";

export const authRouter = Router();

authRouter.post("/login", loginRateLimit, validateBody(loginSchema), async (request, response) => {
  const metadata: { ip?: string; userAgent?: string } = {};
  if (request.ip) metadata.ip = request.ip;
  const userAgent = request.get("user-agent");
  if (userAgent) metadata.userAgent = userAgent;
  const result = await login(request.body.email, request.body.password, metadata);
  response.cookie(env.SESSION_COOKIE_NAME, result.token, sessionCookieOptions(result.expiresAt));
  response.status(200).json({ user: result.user, expiresAt: result.expiresAt });
});

authRouter.post("/logout", async (request, response) => {
  const token = request.cookies?.[env.SESSION_COOKIE_NAME] as string | undefined;
  if (token) await revokeSession(token);
  clearSessionCookie(response);
  response.status(204).send();
});

authRouter.get("/me", requireAuth, (request, response) => {
  response.json({
    user: {
      id: request.auth!.userId,
      name: request.auth!.name,
      email: request.auth!.email,
      role: request.auth!.role,
    },
    expiresAt: request.auth!.expiresAt,
  });
});
