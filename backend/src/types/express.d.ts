import type { UserRole } from "../services/auth.service.js";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
        name: string;
        email: string;
        role: UserRole;
        expiresAt: Date;
      };
    }
  }
}

export {};
