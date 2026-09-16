import { asc, and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { seasons, stats } from "../db/schema/index.js";
import { toPublicMediaUrl, withPublicMediaUrls } from "./media.service.js";
import { notFound } from "../utils/app-error.js";

function withStoredImage<T extends { imageUrl?: string | null | undefined }>(input: T): T {
  if (input.imageUrl === undefined) return input;
  return { ...input, imageUrl: toPublicMediaUrl(input.imageUrl) };
}

export async function listStats(year?: number, category?: typeof stats.$inferSelect.category) {
  const conditions = [year ? eq(seasons.year, year) : undefined, category ? eq(stats.category, category) : undefined].filter(Boolean) as ReturnType<typeof eq>[];
  const rows = await db.select({ id: stats.id, seasonId: stats.seasonId, year: seasons.year, playerId: stats.playerId, teamId: stats.teamId, category: stats.category, rank: stats.rank, playerName: stats.playerName, teamCode: stats.teamCode, style: stats.style, innings: stats.innings, runs: stats.runs, wickets: stats.wickets, average: stats.average, strikeRate: stats.strikeRate, economy: stats.economy, imageUrl: stats.imageUrl, playerLink: stats.playerLink, updatedAt: stats.updatedAt })
    .from(stats).leftJoin(seasons, eq(stats.seasonId, seasons.id)).where(conditions.length ? and(...conditions) : undefined).orderBy(asc(stats.category), asc(stats.rank));
  return withPublicMediaUrls(rows);
}
export async function createStat(input: typeof stats.$inferInsert) { const [row] = await db.insert(stats).values(withStoredImage(input)).returning(); return withPublicMediaUrls(row!); }
export async function updateStat(id: string, input: Partial<typeof stats.$inferInsert>) { const [row] = await db.update(stats).set({ ...withStoredImage(input), updatedAt: new Date() }).where(eq(stats.id, id)).returning(); if (!row) notFound("Stat"); return withPublicMediaUrls(row); }
export async function deleteStat(id: string) { const [row] = await db.delete(stats).where(eq(stats.id, id)).returning({ id: stats.id }); if (!row) notFound("Stat"); }
