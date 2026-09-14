import { asc, and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { fixtures, seasons } from "../db/schema/index.js";
import { notFound } from "../utils/app-error.js";

export async function listFixtures(year?: number, includeUnpublished = false) {
  const conditions = [
    year ? eq(seasons.year, year) : undefined,
    includeUnpublished ? undefined : eq(fixtures.isPublished, true),
  ].filter(Boolean) as ReturnType<typeof eq>[];
  return db.select({ id: fixtures.id, seasonId: fixtures.seasonId, year: seasons.year, matchNumber: fixtures.matchNumber, stage: fixtures.stage, team1Id: fixtures.team1Id, team2Id: fixtures.team2Id, team1Label: fixtures.team1Label, team2Label: fixtures.team2Label, scheduledAt: fixtures.scheduledAt, dateLabel: fixtures.dateLabel, timeLabel: fixtures.timeLabel, venueId: fixtures.venueId, venueLabel: fixtures.venueLabel, venueLink: fixtures.venueLink, status: fixtures.status, isPublished: fixtures.isPublished, updatedAt: fixtures.updatedAt })
    .from(fixtures).innerJoin(seasons, eq(fixtures.seasonId, seasons.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(fixtures.scheduledAt), asc(fixtures.matchNumber));
}
export async function createFixture(input: typeof fixtures.$inferInsert) {
  const [row] = await db.insert(fixtures).values(input).returning(); return row!;
}
export async function updateFixture(id: string, input: Partial<typeof fixtures.$inferInsert>) {
  const [row] = await db.update(fixtures).set({ ...input, updatedAt: new Date() }).where(eq(fixtures.id, id)).returning();
  if (!row) notFound("Fixture"); return row;
}
export async function deleteFixture(id: string) {
  const [row] = await db.delete(fixtures).where(eq(fixtures.id, id)).returning({ id: fixtures.id });
  if (!row) notFound("Fixture");
}
