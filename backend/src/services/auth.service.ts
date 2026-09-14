import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import { and, eq, lt } from "drizzle-orm";
import { env } from "../config/env.js";
import { db } from "../db/index.js";
import { sessions, users } from "../db/schema/index.js";
import { AppError } from "../utils/app-error.js";

export type UserRole = "superadmin";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function login(email: string, password: string, metadata: { ip?: string; userAgent?: string }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.query.users.findFirst({ where: eq(users.email, normalizedEmail) });
  const valid = user?.isActive ? await argon2.verify(user.passwordHash, password).catch(() => false) : false;
  if (!user || !valid) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + env.sessionTtlMs);
  const [session] = await db.transaction(async (tx) => {
    await tx.delete(sessions).where(and(eq(sessions.userId, user.id), lt(sessions.expiresAt, new Date())));
    const created = await tx.insert(sessions).values({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
      ipAddress: metadata.ip,
      userAgent: metadata.userAgent,
    }).returning();
    await tx.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));
    return created;
  });

  return { token, expiresAt, session: session!, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function getSession(token: string) {
  const rows = await db.select({
    sessionId: sessions.id,
    expiresAt: sessions.expiresAt,
    userId: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
  }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(eq(sessions.tokenHash, hashToken(token))).limit(1);
  return rows[0];
}

export async function revokeSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

export async function deleteSessionById(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function touchSession(sessionId: string): Promise<void> {
  await db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, sessionId));
}
