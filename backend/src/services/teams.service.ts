import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { playerProfiles, players, seasons, teamAliases, teamMemberships, teams } from "../db/schema/index.js";
import type { TeamInput } from "../validation/platform.js";
import { toPublicMediaUrl, withPublicMediaUrls } from "./media.service.js";
import { notFound } from "../utils/app-error.js";
import { sanitizeArticleHtml } from "../utils/sanitize-article.js";

function cleanTeam<T extends Partial<TeamInput>>(input: T): T {
  return {
    ...input,
    ...(input.logoUrl !== undefined ? { logoUrl: toPublicMediaUrl(input.logoUrl) } : {}),
    ...(input.introContent !== undefined
      ? { introContent: input.introContent === null ? null : sanitizeArticleHtml(input.introContent) }
      : {}),
    ...(input.afterPlayersContent !== undefined
      ? { afterPlayersContent: input.afterPlayersContent === null ? null : sanitizeArticleHtml(input.afterPlayersContent) }
      : {}),
  };
}

async function aliasesFor(teamIds: string[]) {
  if (!teamIds.length) return [];
  return db.select().from(teamAliases).where(inArray(teamAliases.teamId, teamIds)).orderBy(asc(teamAliases.alias));
}

export async function listTeams(includeInactive = false) {
  const rows = await db.select().from(teams)
    .where(includeInactive ? undefined : eq(teams.isActive, true))
    .orderBy(asc(teams.name));
  const aliases = await aliasesFor(rows.map((row) => row.id));
  return withPublicMediaUrls(rows.map((row) => ({ ...row, aliases: aliases.filter((alias) => alias.teamId === row.id).map((alias) => alias.alias) })));
}

async function resolveTeam(slugOrAlias: string, includeInactive: boolean) {
  const [row] = await db.select({ team: teams })
    .from(teams)
    .leftJoin(teamAliases, eq(teamAliases.teamId, teams.id))
    .where(and(
      or(eq(teams.slug, slugOrAlias), eq(teamAliases.alias, slugOrAlias)),
      includeInactive ? undefined : eq(teams.isActive, true),
    ))
    .limit(1);
  if (!row) notFound("Team");
  return row.team;
}

export async function getTeamBySlug(slugOrAlias: string, includeInactive = false, year?: number) {
  const team = await resolveTeam(slugOrAlias, includeInactive);
  const [aliases, membershipRows] = await Promise.all([
    db.select().from(teamAliases).where(eq(teamAliases.teamId, team.id)).orderBy(asc(teamAliases.alias)),
    db.select({
      id: teamMemberships.id,
      playerId: players.id,
      slug: players.slug,
      name: players.name,
      imageUrl: players.imageUrl,
      role: teamMemberships.role,
      status: teamMemberships.status,
      auctionPrice: teamMemberships.auctionPrice,
      isMarquee: teamMemberships.isMarquee,
      sortOrder: teamMemberships.sortOrder,
      seasonYear: seasons.year,
      isPublished: playerProfiles.isPublished,
    })
      .from(teamMemberships)
      .innerJoin(players, eq(teamMemberships.playerId, players.id))
      .innerJoin(seasons, eq(teamMemberships.seasonId, seasons.id))
      .leftJoin(playerProfiles, eq(playerProfiles.playerId, players.id))
      .where(and(
        eq(teamMemberships.teamId, team.id),
        year === undefined ? undefined : eq(seasons.year, year),
        includeInactive ? undefined : eq(playerProfiles.isPublished, true),
      ))
      .orderBy(desc(seasons.year), asc(teamMemberships.sortOrder), asc(players.name)),
  ]);

  const selectedYear = year ?? membershipRows[0]?.seasonYear;
  const roster = selectedYear === undefined
    ? []
    : membershipRows.filter((row) => row.seasonYear === selectedYear).map(({ isPublished: _isPublished, sortOrder: _sortOrder, ...row }) => row);
  return withPublicMediaUrls({ ...team, aliases: aliases.map((alias) => alias.alias), roster });
}

export async function createTeam(input: TeamInput) {
  return db.transaction(async (tx) => {
    const { aliases, ...record } = cleanTeam(input);
    const [created] = await tx.insert(teams).values(record).returning();
    if (aliases.length) await tx.insert(teamAliases).values(aliases.map((alias) => ({ teamId: created!.id, alias })));
    return withPublicMediaUrls({ ...created!, aliases });
  });
}

export async function updateTeam(id: string, input: Partial<TeamInput>) {
  return db.transaction(async (tx) => {
    const cleaned = cleanTeam(input);
    const { aliases, ...record } = cleaned;
    const [updated] = await tx.update(teams).set({ ...record, updatedAt: new Date() }).where(eq(teams.id, id)).returning();
    if (!updated) notFound("Team");
    if (aliases !== undefined) {
      await tx.delete(teamAliases).where(eq(teamAliases.teamId, id));
      if (aliases.length) await tx.insert(teamAliases).values(aliases.map((alias) => ({ teamId: id, alias })));
    }
    const currentAliases = await tx.select().from(teamAliases).where(eq(teamAliases.teamId, id)).orderBy(asc(teamAliases.alias));
    return withPublicMediaUrls({ ...updated, aliases: currentAliases.map((alias) => alias.alias) });
  });
}

export async function deleteTeam(id: string) {
  const [row] = await db.delete(teams).where(eq(teams.id, id)).returning({ id: teams.id });
  if (!row) notFound("Team");
}
