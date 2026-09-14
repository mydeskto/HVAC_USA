import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { matches, matchTeams, seasons } from "../db/schema/index.js";
import { notFound } from "../utils/app-error.js";

type MatchInput = typeof matches.$inferInsert & { participants: Array<Omit<typeof matchTeams.$inferInsert, "matchId">> };

export async function listMatches(year?: number) {
  const rows = await db.select({ id: matches.id, legacyId: matches.legacyId, externalId: matches.externalId, fixtureId: matches.fixtureId, seasonId: matches.seasonId, year: seasons.year, matchNumber: matches.matchNumber, matchType: matches.matchType, stage: matches.stage, playedAt: matches.playedAt, dateLabel: matches.dateLabel, timeLabel: matches.timeLabel, venueId: matches.venueId, venueLabel: matches.venueLabel, status: matches.status, result: matches.result, winnerTeamId: matches.winnerTeamId, winnerLabel: matches.winnerLabel, keywords: matches.keywords, updatedAt: matches.updatedAt })
    .from(matches).innerJoin(seasons, eq(matches.seasonId, seasons.id)).where(year ? eq(seasons.year, year) : undefined).orderBy(asc(matches.playedAt), asc(matches.matchNumber));
  const ids = rows.map((row) => row.id);
  const participants = ids.length ? await db.select().from(matchTeams).where(inArray(matchTeams.matchId, ids)) : [];
  return rows.map((row) => ({ ...row, participants: participants.filter((team) => team.matchId === row.id) }));
}

export async function createMatch(input: MatchInput) {
  return db.transaction(async (tx) => {
    const { participants, ...record } = input;
    const [created] = await tx.insert(matches).values(record).returning();
    await tx.insert(matchTeams).values(participants.map((participant) => ({ ...participant, matchId: created!.id })));
    return { ...created!, participants };
  });
}

export async function updateMatch(id: string, input: Partial<MatchInput>) {
  return db.transaction(async (tx) => {
    const { participants, ...record } = input;
    const [updated] = await tx.update(matches).set({ ...record, updatedAt: new Date() }).where(eq(matches.id, id)).returning();
    if (!updated) notFound("Match");
    if (participants) {
      await tx.delete(matchTeams).where(eq(matchTeams.matchId, id));
      await tx.insert(matchTeams).values(participants.map((participant) => ({ ...participant, matchId: id })));
    }
    const currentParticipants = await tx.select().from(matchTeams).where(eq(matchTeams.matchId, id));
    return { ...updated, participants: currentParticipants };
  });
}

export async function deleteMatch(id: string) {
  const [row] = await db.delete(matches).where(eq(matches.id, id)).returning({ id: matches.id });
  if (!row) notFound("Match");
}
