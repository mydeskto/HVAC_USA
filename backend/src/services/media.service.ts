import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const MAX_MEDIA_BYTES = 8 * 1024 * 1024;

const formats = [
  { mimeType: "image/png", extension: ".png", matches: (data: Buffer) => data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mimeType: "image/jpeg", extension: ".jpg", matches: (data: Buffer) => data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff },
  { mimeType: "image/webp", extension: ".webp", matches: (data: Buffer) => data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP" },
  { mimeType: "image/gif", extension: ".gif", matches: (data: Buffer) => data.length >= 6 && ["GIF87a", "GIF89a"].includes(data.toString("ascii", 0, 6)) },
] as const;

export function uploadsDirectory(): string {
  return path.resolve(process.cwd(), env.UPLOAD_DIR);
}

export function mediaMountPath(): string {
  const configured = env.PUBLIC_MEDIA_BASE_URL;
  if (/^https?:\/\//i.test(configured)) return new URL(configured).pathname.replace(/\/$/, "") || "/uploads";
  const normalized = `/${configured.replace(/^\/+|\/+$/g, "")}`;
  return normalized === "/" ? "/uploads" : normalized;
}

function publicUrl(filename: string): string {
  // Keep filenames readable in URLs; hyphens/dots do not need encoding.
  const base = env.PUBLIC_MEDIA_BASE_URL.replace(/\/$/, "")
  return `${base}/${filename}`
}

function safeStem(filename: string | undefined): string {
  const original = path.basename(filename || "image", path.extname(filename || ""));
  return original.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "image";
}

export async function saveImageUpload(data: unknown, requestedFilename?: string, declaredMimeType?: string) {
  if (!Buffer.isBuffer(data) || data.length === 0) throw new AppError(400, "A raw image body is required", "INVALID_MEDIA");
  if (data.length > MAX_MEDIA_BYTES) throw new AppError(413, `Image exceeds the ${MAX_MEDIA_BYTES / 1024 / 1024} MB limit`, "MEDIA_TOO_LARGE");
  const format = formats.find((candidate) => candidate.matches(data));
  if (!format) throw new AppError(415, "Only valid PNG, JPEG, WebP, or GIF images are accepted", "UNSUPPORTED_MEDIA_TYPE");
  const declared = declaredMimeType?.split(";", 1)[0]?.trim().toLowerCase();
  if (declared?.startsWith("image/") && declared !== format.mimeType && !(declared === "image/jpg" && format.mimeType === "image/jpeg")) {
    throw new AppError(415, "Declared image type does not match the file signature", "MEDIA_TYPE_MISMATCH");
  }

  const filename = `${safeStem(requestedFilename)}-${Date.now().toString(36)}-${randomUUID()}${format.extension}`;
  const root = uploadsDirectory();
  const destination = path.resolve(root, filename);
  if (path.dirname(destination) !== root) throw new AppError(400, "Invalid upload filename", "INVALID_MEDIA_NAME");
  await mkdir(root, { recursive: true });
  await writeFile(destination, data, { flag: "wx", mode: 0o640 });
  return { url: publicUrl(filename), mimeType: format.mimeType, size: data.length };
}

export function isSafeMediaRequestPath(requestPath: string): boolean {
  const filename = requestPath.split("/").filter(Boolean).pop() ?? ""
  // stem (up to 60) + base36 timestamp + uuid + extension
  return /^[a-z0-9](?:[a-z0-9-]{0,59})?-[a-z0-9]+-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:png|jpg|webp|gif)$/i.test(filename)
}
