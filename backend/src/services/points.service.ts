import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { pointsTable, seasons, teams } from "../db/schema/index.js";
import { withPublicMediaUrls } from "./media.service.js";
import { notFound } from "../utils/app-error.js";

export async function listPoints(year?: number) {
  const rows = await db.select({ id: pointsTable.id, seasonId: pointsTable.seasonId, year: seasons.year, teamId: pointsTable.teamId, team: teams.name, logo: teams.logoUrl, position: pointsTable.position, matches: pointsTable.matches, won: pointsTable.won, lost: pointsTable.lost, tied: pointsTable.tied, noResult: pointsTable.noResult, netRunRate: pointsTable.netRunRate, points: pointsTable.points, updatedAt: pointsTable.updatedAt })
    .from(pointsTable).innerJoin(seasons, eq(pointsTable.seasonId, seasons.id)).innerJoin(teams, eq(pointsTable.teamId, teams.id))
    .where(year ? eq(seasons.year, year) : undefined).orderBy(asc(seasons.year), asc(pointsTable.position));
  return withPublicMediaUrls(rows);
}

export async function createPoint(input: typeof pointsTable.$inferInsert) {
  const [row] = await db.insert(pointsTable).values(input).returning();
  return row!;
}
export async function updatePoint(id: string, input: Partial<typeof pointsTable.$inferInsert>) {
  const [row] = await db.update(pointsTable).set({ ...input, updatedAt: new Date() }).where(eq(pointsTable.id, id)).returning();
  if (!row) notFound("Points row");
  return row;
}
export async function deletePoint(id: string) {
  const [row] = await db.delete(pointsTable).where(eq(pointsTable.id, id)).returning({ id: pointsTable.id });
  if (!row) notFound("Points row");
}
