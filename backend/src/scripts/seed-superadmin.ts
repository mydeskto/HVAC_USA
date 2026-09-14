import "dotenv/config";
import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { closeDatabase, db } from "../db/index.js";
import { users } from "../db/schema/index.js";

const name = process.env.SUPERADMIN_NAME?.trim() || "NPL Super Admin";
const email = (process.env.SUPERADMIN_EMAIL?.trim() || "admin@nplt20league.local").toLowerCase();
const configuredPassword = process.env.SUPERADMIN_PASSWORD;
const generatedPassword = `Npl!${randomBytes(24).toString("base64url")}#9Aa`;
const password = configuredPassword || generatedPassword;

if (configuredPassword) {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const normalized = password.toLowerCase();
  const resemblesIdentity = normalized.includes(email.split("@")[0]!) || normalized.includes(name.toLowerCase().replaceAll(" ", ""));
  if (password.length < 16 || !hasUpper || !hasLower || !hasNumber || !hasSymbol || resemblesIdentity || new Set(password).size < 10) {
    throw new Error("SUPERADMIN_PASSWORD must be at least 16 characters with uppercase, lowercase, number, symbol, 10 unique characters, and must not contain the admin name/email");
  }
}

try {
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    console.log(`Superadmin ${email} already exists; no changes made.`);
  } else {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65_536,
      timeCost: 3,
      parallelism: 1,
    });

    await db.insert(users).values({ name, email, passwordHash, role: "superadmin" });
    console.log(`Created superadmin ${email}.`);
    if (!configuredPassword) {
      console.log("Generated one-time superadmin password (store it now; it will not be shown again):");
      console.log(password);
    }
  }
} finally {
  await closeDatabase();
}
