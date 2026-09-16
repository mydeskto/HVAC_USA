import { and, eq, inArray } from "drizzle-orm";
import type { z } from "zod";
import { db } from "../db/index.js";
import {
  fixtures,
  matches,
  matchTeams,
  newsArticles,
  playerAliases,
  playerProfiles,
  players,
  pointsTable,
  stats,
  teamAliases,
  teamMemberships,
  teams,
} from "../db/schema/index.js";
import type { ImportRequest } from "../validation/platform.js";
import { playerAggregateCreateSchema, teamCreateSchema } from "../validation/platform.js";
import { fixtureCreateSchema, matchCreateSchema, newsCreateSchema, pointsCreateSchema, statCreateSchema } from "../validation/resources.js";
import { toPublicMediaUrl } from "./media.service.js";
import { sanitizeArticleHtml } from "../utils/sanitize-article.js";

type ImportIssue = { row?: number; field?: string; code?: string; message: string };
type NewsRow = z.infer<typeof newsCreateSchema>;
type PointsRow = z.infer<typeof pointsCreateSchema>;
type FixtureRow = z.infer<typeof fixtureCreateSchema>;
type MatchRow = z.infer<typeof matchCreateSchema>;
type StatRow = z.infer<typeof statCreateSchema>;
type TeamRow = z.infer<typeof teamCreateSchema>;
type PlayerRow = z.infer<typeof playerAggregateCreateSchema>;
type ParsedRows = NewsRow[] | PointsRow[] | FixtureRow[] | MatchRow[] | StatRow[] | TeamRow[] | PlayerRow[];

function sanitizeProfileValue(value: unknown, key?: string): unknown {
  if (typeof value === "string") return key === "image" ? toPublicMediaUrl(value) : sanitizeArticleHtml(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeProfileValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([itemKey, item]) => [itemKey, sanitizeProfileValue(item, itemKey)]));
  return value;
}

function validateRows(request: ImportRequest): { rows: ParsedRows; issues: ImportIssue[] } {
  const issues: ImportIssue[] = [];
  const parsed: unknown[] = [];
  const schema = request.resource === "news" ? newsCreateSchema
    : request.resource === "points" ? pointsCreateSchema
      : request.resource === "fixtures" ? fixtureCreateSchema
        : request.resource === "matches" ? matchCreateSchema
          : request.resource === "stats" ? statCreateSchema
            : request.resource === "teams" ? teamCreateSchema
              : playerAggregateCreateSchema;

  request.rows.forEach((row, index) => {
    const result = schema.safeParse(row);
    if (result.success) parsed.push(result.data);
    else result.error.issues.forEach((issue) => issues.push({
      row: index + 1,
      ...(issue.path.length ? { field: issue.path.join(".") } : {}),
      code: issue.code,
      message: issue.message,
    }));
  });
  return { rows: parsed as ParsedRows, issues };
}

function validateScope(request: ImportRequest, rows: ParsedRows): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const scope = request.scope;
  if (request.mode === "replace") {
    if (["news", "teams", "players"].includes(request.resource)) {
      issues.push({ field: "mode", code: "UNSAFE_REPLACE", message: `Global replace is not allowed for ${request.resource}` });
    }
    if (["points", "fixtures", "matches"].includes(request.resource) && !scope?.seasonId) {
      issues.push({ field: "scope.seasonId", code: "MISSING_SCOPE", message: `seasonId is required to replace ${request.resource}` });
    }
    if (request.resource === "stats" && (!scope?.seasonId || !scope.category)) {
      issues.push({ field: "scope", code: "MISSING_SCOPE", message: "seasonId and category are required to replace stats" });
    }
  }

  const identities = new Set<string>();
  const positions = new Set<string>();
  rows.forEach((raw, index) => {
    const row = raw as { slug?: string; seasonId?: string | null; teamId?: string; matchNumber?: string; category?: string; rank?: number; position?: number };
    if (request.resource === "stats" && !row.seasonId) {
      issues.push({ row: index + 1, field: "seasonId", code: "MISSING_SEASON", message: "Imported stats require a non-null seasonId for idempotent upsert" });
    }
    if (scope?.seasonId && row.seasonId !== scope.seasonId) {
      issues.push({ row: index + 1, field: "seasonId", code: "SCOPE_MISMATCH", message: "Row seasonId must match scope.seasonId" });
    }
    if (scope?.category && row.category !== scope.category) {
      issues.push({ row: index + 1, field: "category", code: "SCOPE_MISMATCH", message: "Row category must match scope.category" });
    }
    const identity = row.slug ?? (request.resource === "points"
      ? `${row.seasonId}:${row.teamId}`
      : request.resource === "stats"
        ? `${row.seasonId}:${row.category}:${row.rank}`
        : `${row.seasonId}:${row.matchNumber}`);
    if (identities.has(identity)) issues.push({ row: index + 1, code: "DUPLICATE_ROW", message: "Import contains a duplicate resource identity" });
    identities.add(identity);
    if (request.resource === "points") {
      const position = `${row.seasonId}:${row.position}`;
      if (positions.has(position)) issues.push({ row: index + 1, field: "position", code: "DUPLICATE_POSITION", message: "Import contains a duplicate position in the same season" });
      positions.add(position);
    }
  });
  return issues;
}

async function validatePointPositionConflicts(request: ImportRequest, rows: ParsedRows): Promise<ImportIssue[]> {
  if (request.resource !== "points" || request.mode !== "upsert" || rows.length === 0) return [];
  const pointRows = rows as PointsRow[];
  const seasonIds = [...new Set(pointRows.map((row) => row.seasonId))];
  const existing = await db.select({ seasonId: pointsTable.seasonId, teamId: pointsTable.teamId, position: pointsTable.position })
    .from(pointsTable).where(inArray(pointsTable.seasonId, seasonIds));
  const incomingTeams = new Set(pointRows.map((row) => `${row.seasonId}:${row.teamId}`));
  const issues: ImportIssue[] = [];
  pointRows.forEach((row, index) => {
    const occupant = existing.find((item) => item.seasonId === row.seasonId && item.position === row.position);
    if (occupant && !incomingTeams.has(`${occupant.seasonId}:${occupant.teamId}`)) {
      issues.push({ row: index + 1, field: "position", code: "POSITION_OCCUPIED", message: "Position is held by a team not included in this import" });
    }
  });
  return issues;
}

export async function importRows(request: ImportRequest, userId: string) {
  const validated = validateRows(request);
  const issues = [...validated.issues, ...validateScope(request, validated.rows), ...await validatePointPositionConflicts(request, validated.rows)];
  const baseSummary = {
    schemaVersion: request.schemaVersion,
    resource: request.resource,
    mode: request.mode,
    received: request.rows.length,
    validated: validated.rows.length,
  };
  if (issues.length) return { summary: { ...baseSummary, imported: 0, replaced: 0 }, issues };

  const result = await db.transaction(async (tx) => {
    let replaced = 0;
    const scope = request.scope;
    if (request.mode === "replace") {
      if (request.resource === "points") {
        const deleted = await tx.delete(pointsTable).where(eq(pointsTable.seasonId, scope!.seasonId!)).returning({ id: pointsTable.id });
        replaced = deleted.length;
      } else if (request.resource === "fixtures") {
        const deleted = await tx.delete(fixtures).where(eq(fixtures.seasonId, scope!.seasonId!)).returning({ id: fixtures.id });
        replaced = deleted.length;
      } else if (request.resource === "matches") {
        const deleted = await tx.delete(matches).where(eq(matches.seasonId, scope!.seasonId!)).returning({ id: matches.id });
        replaced = deleted.length;
      } else if (request.resource === "stats") {
        const deleted = await tx.delete(stats).where(and(eq(stats.seasonId, scope!.seasonId!), eq(stats.category, scope!.category!))).returning({ id: stats.id });
        replaced = deleted.length;
      }
    }

    if (request.resource === "news") {
      for (const row of validated.rows as NewsRow[]) {
        const cleaned = {
          ...row,
          imageUrl: toPublicMediaUrl(row.imageUrl),
          content: sanitizeArticleHtml(row.content),
          publishedAt: row.publishedAt == null ? row.publishedAt : new Date(row.publishedAt),
          foreignPlayers: row.foreignPlayers.map((item) => item.teamLink === undefined
            ? { team: item.team, players: item.players }
            : { team: item.team, players: item.players, teamLink: item.teamLink }),
        };
        await tx.insert(newsArticles).values({ ...cleaned, createdBy: userId, updatedBy: userId })
          .onConflictDoUpdate({ target: newsArticles.slug, set: { ...cleaned, updatedBy: userId, updatedAt: new Date() } });
      }
    } else if (request.resource === "points") {
      for (const row of validated.rows as PointsRow[]) {
        await tx.insert(pointsTable).values(row).onConflictDoUpdate({
          target: [pointsTable.seasonId, pointsTable.teamId],
          set: { ...row, updatedAt: new Date() },
        });
      }
    } else if (request.resource === "fixtures") {
      for (const row of validated.rows as FixtureRow[]) {
        const record = {
          ...row,
          scheduledAt: row.scheduledAt == null ? row.scheduledAt : new Date(row.scheduledAt),
        };
        await tx.insert(fixtures).values(record).onConflictDoUpdate({
          target: [fixtures.seasonId, fixtures.matchNumber],
          set: { ...record, updatedAt: new Date() },
        });
      }
    } else if (request.resource === "matches") {
      for (const row of validated.rows as MatchRow[]) {
        const { participants, ...rawRecord } = row;
        const record = {
          ...rawRecord,
          playedAt: rawRecord.playedAt == null ? rawRecord.playedAt : new Date(rawRecord.playedAt),
        };
        const [match] = await tx.insert(matches).values(record).onConflictDoUpdate({
          target: [matches.seasonId, matches.matchNumber],
          set: { ...record, updatedAt: new Date() },
        }).returning({ id: matches.id });
        await tx.delete(matchTeams).where(eq(matchTeams.matchId, match!.id));
        await tx.insert(matchTeams).values(participants.map((participant) => ({ ...participant, logoUrl: toPublicMediaUrl(participant.logoUrl), matchId: match!.id })));
      }
    } else if (request.resource === "stats") {
      for (const row of validated.rows as StatRow[]) {
        const record = { ...row, imageUrl: toPublicMediaUrl(row.imageUrl) };
        await tx.insert(stats).values(record).onConflictDoUpdate({
          target: [stats.category, stats.seasonId, stats.rank],
          set: { ...record, updatedAt: new Date() },
        });
      }
    } else if (request.resource === "teams") {
      for (const row of validated.rows as TeamRow[]) {
        const { aliases, introContent, afterPlayersContent, ...record } = row;
        const cleanRecord = {
          ...record,
          logoUrl: toPublicMediaUrl(record.logoUrl),
          introContent: introContent === null || introContent === undefined ? introContent : sanitizeArticleHtml(introContent),
          afterPlayersContent: afterPlayersContent === null || afterPlayersContent === undefined ? afterPlayersContent : sanitizeArticleHtml(afterPlayersContent),
        };
        const [team] = await tx.insert(teams).values(cleanRecord).onConflictDoUpdate({
          target: teams.slug,
          set: { ...cleanRecord, updatedAt: new Date() },
        }).returning({ id: teams.id, slug: teams.slug });
        await tx.delete(teamAliases).where(eq(teamAliases.teamId, team!.id));
        const cleanAliases = [...new Set(aliases)].filter((alias) => alias !== team!.slug);
        if (cleanAliases.length) await tx.insert(teamAliases).values(cleanAliases.map((alias) => ({ teamId: team!.id, alias })));
      }
    } else {
      for (const row of validated.rows as PlayerRow[]) {
        const { aliases, profile, richContent, adUnits, isPublished, membership, ...record } = row;
        const playerRecord = { ...record, imageUrl: toPublicMediaUrl(record.imageUrl) };
        const [player] = await tx.insert(players).values(playerRecord).onConflictDoUpdate({
          target: players.slug,
          set: { ...playerRecord, updatedAt: new Date() },
        }).returning({ id: players.id, slug: players.slug });
        await tx.delete(playerAliases).where(eq(playerAliases.playerId, player!.id));
        const cleanAliases = [...new Set(aliases)].filter((alias) => alias !== player!.slug);
        if (cleanAliases.length) await tx.insert(playerAliases).values(cleanAliases.map((alias) => ({ playerId: player!.id, alias })));
        if (profile === null) {
          await tx.delete(playerProfiles).where(eq(playerProfiles.playerId, player!.id));
        } else if (profile !== undefined) {
          await tx.insert(playerProfiles).values({
            playerId: player!.id,
            profileData: sanitizeProfileValue(profile) as Record<string, unknown>,
            richContent: richContent === null || richContent === undefined ? richContent : sanitizeArticleHtml(richContent),
            adUnits,
            isPublished,
          }).onConflictDoUpdate({
            target: playerProfiles.playerId,
            set: {
              profileData: sanitizeProfileValue(profile) as Record<string, unknown>,
              richContent: richContent === null || richContent === undefined ? richContent : sanitizeArticleHtml(richContent),
              adUnits,
              isPublished,
              updatedAt: new Date(),
            },
          });
        }
        // Null membership is deliberately a no-op; imports must not erase history.
        if (membership) {
          await tx.insert(teamMemberships).values({ ...membership, playerId: player!.id }).onConflictDoUpdate({
            target: [teamMemberships.seasonId, teamMemberships.playerId],
            set: { ...membership, updatedAt: new Date() },
          });
        }
      }
    }
    return { replaced };
  });

  return { summary: { ...baseSummary, imported: validated.rows.length, replaced: result.replaced }, issues: [] };
}
