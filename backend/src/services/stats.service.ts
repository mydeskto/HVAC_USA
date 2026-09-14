import { asc, and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { seasons, stats } from "../db/schema/index.js";
import { notFound } from "../utils/app-error.js";

export async function listStats(year?: number, category?: typeof stats.$inferSelect.category) {
  const conditions = [year ? eq(seasons.year, year) : undefined, category ? eq(stats.category, category) : undefined].filter(Boolean) as ReturnType<typeof eq>[];
  return db.select({ id: stats.id, seasonId: stats.seasonId, year: seasons.year, playerId: stats.playerId, teamId: stats.teamId, category: stats.category, rank: stats.rank, playerName: stats.playerName, teamCode: stats.teamCode, style: stats.style, innings: stats.innings, runs: stats.runs, wickets: stats.wickets, average: stats.average, strikeRate: stats.strikeRate, economy: stats.economy, imageUrl: stats.imageUrl, playerLink: stats.playerLink, updatedAt: stats.updatedAt })
    .from(stats).leftJoin(seasons, eq(stats.seasonId, seasons.id)).where(conditions.length ? and(...conditions) : undefined).orderBy(asc(stats.category), asc(stats.rank));
}
export async function createStat(input: typeof stats.$inferInsert) { const [row] = await db.insert(stats).values(input).returning(); return row!; }
export async function updateStat(id: string, input: Partial<typeof stats.$inferInsert>) { const [row] = await db.update(stats).set({ ...input, updatedAt: new Date() }).where(eq(stats.id, id)).returning(); if (!row) notFound("Stat"); return row; }
export async function deleteStat(id: string) { const [row] = await db.delete(stats).where(eq(stats.id, id)).returning({ id: stats.id }); if (!row) notFound("Stat"); }
