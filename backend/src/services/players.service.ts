import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { playerAliases, playerProfiles, players, seasons, teamAliases, teamMemberships, teams } from "../db/schema/index.js";
import type { PlayerAggregateInput } from "../validation/platform.js";
import { toPublicMediaUrl, withPublicMediaUrls } from "./media.service.js";
import { notFound } from "../utils/app-error.js";
import { sanitizeArticleHtml } from "../utils/sanitize-article.js";

type PlayerInput = PlayerAggregateInput;
type MembershipRow = {
  id: string;
  playerId: string;
  seasonId: string;
  seasonYear: number;
  seasonLabel: string;
  teamId: string;
  teamSlug: string;
  teamName: string;
  teamShortCode: string | null;
  teamLogoUrl: string | null;
  role: string;
  status: "retained" | "auction" | "other";
  auctionPrice: string | null;
  isMarquee: boolean;
  sortOrder: number;
};

function sanitizeProfileValue(value: unknown, key?: string): unknown {
  if (typeof value === "string") return key === "image" ? toPublicMediaUrl(value) : sanitizeArticleHtml(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeProfileValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([itemKey, item]) => [itemKey, sanitizeProfileValue(item, itemKey)]));
  }
  return value;
}

function withStoredPlayerMedia<T extends { imageUrl?: string | null }>(record: T): T {
  return record.imageUrl === undefined ? record : { ...record, imageUrl: toPublicMediaUrl(record.imageUrl) };
}

function uniqueAliases(aliases: string[] | undefined, canonicalSlug: string | undefined) {
  if (aliases === undefined) return undefined;
  return [...new Set(aliases)].filter((alias) => alias !== canonicalSlug);
}

async function loadMemberships(playerIds: string[]): Promise<MembershipRow[]> {
  if (!playerIds.length) return [];
  return db.select({
    id: teamMemberships.id,
    playerId: teamMemberships.playerId,
    seasonId: teamMemberships.seasonId,
    seasonYear: seasons.year,
    seasonLabel: seasons.name,
    teamId: teams.id,
    teamSlug: teams.slug,
    teamName: teams.name,
    teamShortCode: teams.shortCode,
    teamLogoUrl: teams.logoUrl,
    role: teamMemberships.role,
    status: teamMemberships.status,
    auctionPrice: teamMemberships.auctionPrice,
    isMarquee: teamMemberships.isMarquee,
    sortOrder: teamMemberships.sortOrder,
  }).from(teamMemberships)
    .innerJoin(seasons, eq(teamMemberships.seasonId, seasons.id))
    .innerJoin(teams, eq(teamMemberships.teamId, teams.id))
    .where(inArray(teamMemberships.playerId, playerIds))
    .orderBy(desc(seasons.year), desc(teamMemberships.updatedAt), asc(teamMemberships.id));
}

function adminMembership(row: MembershipRow | undefined) {
  if (!row) return null;
  return {
    seasonId: row.seasonId,
    teamId: row.teamId,
    role: row.role,
    status: row.status,
    auctionPrice: row.auctionPrice,
    isMarquee: row.isMarquee,
    sortOrder: row.sortOrder,
  };
}

function publicMembership(row: MembershipRow | undefined) {
  if (!row) return null;
  const { playerId: _playerId, sortOrder: _sortOrder, ...membership } = row;
  return membership;
}

async function loadAdminPlayers(ids?: string[]) {
  const rows = await db.select({ player: players, profile: playerProfiles })
    .from(players)
    .leftJoin(playerProfiles, eq(playerProfiles.playerId, players.id))
    .where(ids?.length ? inArray(players.id, ids) : undefined)
    .orderBy(asc(players.name));
  const playerIds = rows.map((row) => row.player.id);
  const [aliases, memberships] = await Promise.all([
    playerIds.length ? db.select().from(playerAliases).where(inArray(playerAliases.playerId, playerIds)).orderBy(asc(playerAliases.alias)) : [],
    loadMemberships(playerIds),
  ]);
  return withPublicMediaUrls(rows.map(({ player, profile }) => ({
    ...player,
    profile: profile?.profileData ?? null,
    richContent: profile?.richContent ?? null,
    adUnits: profile?.adUnits ?? [],
    isPublished: profile?.isPublished ?? false,
    aliases: aliases.filter((alias) => alias.playerId === player.id).map((alias) => alias.alias),
    membership: adminMembership(memberships.find((membership) => membership.playerId === player.id)),
  })));
}

export async function listAdminPlayers() {
  return loadAdminPlayers();
}

export async function getAdminPlayer(id: string) {
  const [player] = await loadAdminPlayers([id]);
  if (!player) notFound("Player");
  return player;
}

export async function createPlayer(input: PlayerInput) {
  const id = await db.transaction(async (tx) => {
    const { aliases, profile, richContent, adUnits, isPublished, membership, ...record } = input;
    const [created] = await tx.insert(players).values(withStoredPlayerMedia(record)).returning({ id: players.id, slug: players.slug });
    const cleanAliases = uniqueAliases(aliases, created!.slug) ?? [];
    if (cleanAliases.length) await tx.insert(playerAliases).values(cleanAliases.map((alias) => ({ playerId: created!.id, alias })));
    if (profile !== null && (profile !== undefined || richContent !== undefined || adUnits.length > 0 || isPublished)) {
      await tx.insert(playerProfiles).values({
        playerId: created!.id,
        profileData: (sanitizeProfileValue(profile ?? {}) as Record<string, unknown>),
        richContent: richContent == null ? richContent : sanitizeArticleHtml(richContent),
        adUnits,
        isPublished,
      });
    }
    if (membership) await tx.insert(teamMemberships).values({ ...membership, playerId: created!.id });
    return created!.id;
  });
  return getAdminPlayer(id);
}

export async function updatePlayer(id: string, input: Partial<PlayerInput>) {
  await db.transaction(async (tx) => {
    const { aliases, profile, richContent, adUnits, isPublished, membership, ...record } = input;
    const [updated] = await tx.update(players).set({ ...withStoredPlayerMedia(record), updatedAt: new Date() }).where(eq(players.id, id)).returning({ slug: players.slug });
    if (!updated) notFound("Player");

    if (aliases !== undefined) {
      await tx.delete(playerAliases).where(eq(playerAliases.playerId, id));
      const cleanAliases = uniqueAliases(aliases, updated.slug) ?? [];
      if (cleanAliases.length) await tx.insert(playerAliases).values(cleanAliases.map((alias) => ({ playerId: id, alias })));
    }

    if (profile === null) {
      await tx.delete(playerProfiles).where(eq(playerProfiles.playerId, id));
    } else if (profile !== undefined || richContent !== undefined || adUnits !== undefined || isPublished !== undefined) {
      const [existing] = await tx.select().from(playerProfiles).where(eq(playerProfiles.playerId, id)).limit(1);
      const values = {
        profileData: profile === undefined ? (existing?.profileData ?? {}) : (sanitizeProfileValue(profile) as Record<string, unknown>),
        richContent: richContent === undefined ? (existing?.richContent ?? null) : richContent === null ? null : sanitizeArticleHtml(richContent),
        adUnits: adUnits ?? existing?.adUnits ?? [],
        isPublished: isPublished ?? existing?.isPublished ?? false,
        updatedAt: new Date(),
      };
      if (existing) await tx.update(playerProfiles).set(values).where(eq(playerProfiles.playerId, id));
      else await tx.insert(playerProfiles).values({ playerId: id, ...values });
    }

    // Explicit null is intentionally a no-op so historical memberships are never deleted accidentally.
    if (membership) {
      await tx.insert(teamMemberships).values({ ...membership, playerId: id })
        .onConflictDoUpdate({
          target: [teamMemberships.seasonId, teamMemberships.playerId],
          set: { ...membership, updatedAt: new Date() },
        });
    }
  });
  return getAdminPlayer(id);
}

export async function deletePlayer(id: string) {
  const [row] = await db.delete(players).where(eq(players.id, id)).returning({ id: players.id });
  if (!row) notFound("Player");
}

async function resolvePublicTeamId(slugOrAlias: string): Promise<string> {
  const [row] = await db.select({ id: teams.id }).from(teams)
    .leftJoin(teamAliases, eq(teamAliases.teamId, teams.id))
    .where(and(eq(teams.isActive, true), or(eq(teams.slug, slugOrAlias), eq(teamAliases.alias, slugOrAlias))))
    .limit(1);
  if (!row) notFound("Team");
  return row.id;
}

export async function listPublicPlayers(options: { team?: string; year?: number; q?: string } = {}) {
  const rows = await db.select({ player: players, profile: playerProfiles }).from(players)
    .innerJoin(playerProfiles, and(eq(playerProfiles.playerId, players.id), eq(playerProfiles.isPublished, true)))
    .orderBy(asc(players.name));
  const playerIds = rows.map((row) => row.player.id);
  const [aliases, memberships, teamId] = await Promise.all([
    playerIds.length ? db.select().from(playerAliases).where(inArray(playerAliases.playerId, playerIds)).orderBy(asc(playerAliases.alias)) : [],
    loadMemberships(playerIds),
    options.team ? resolvePublicTeamId(options.team) : Promise.resolve(undefined),
  ]);
  const query = options.q?.trim().toLocaleLowerCase();
  return rows.flatMap(({ player, profile }) => {
    const playerMemberships = memberships.filter((membership) => membership.playerId === player.id);
    const latest = playerMemberships[0];
    const selected = options.year === undefined ? latest : playerMemberships.find((membership) => membership.seasonYear === options.year);
    if (options.year !== undefined && !selected) return [];
    if (teamId !== undefined && selected?.teamId !== teamId) return [];
    const playerAliasRows = aliases.filter((alias) => alias.playerId === player.id).map((alias) => alias.alias);
    if (query && ![player.name, player.slug, ...playerAliasRows].some((value) => value.toLocaleLowerCase().includes(query))) return [];
    const profileData = profile.profileData as Record<string, unknown>;
    return [withPublicMediaUrls({
      ...player,
      profile: profileData,
      richContent: profile.richContent,
      isPublished: true,
      aliases: playerAliasRows,
      adUnits: profile.adUnits.map(({ client: _client, ...unit }) => ({ ...unit, slotId: unit.slot, placement: unit.position, isEnabled: true })),
      currentMembership: publicMembership(selected),
      latestMembership: publicMembership(latest),
      role: typeof profileData.role === "string" ? profileData.role : selected?.role,
      team: selected?.teamName,
      teamSlug: selected?.teamSlug,
      status: selected?.status,
    })];
  });
}

export async function getPublicPlayerBySlug(slugOrAlias: string, year?: number) {
  const [resolved] = await db.select({ id: players.id }).from(players)
    .innerJoin(playerProfiles, and(eq(playerProfiles.playerId, players.id), eq(playerProfiles.isPublished, true)))
    .leftJoin(playerAliases, eq(playerAliases.playerId, players.id))
    .where(or(eq(players.slug, slugOrAlias), eq(playerAliases.alias, slugOrAlias)))
    .limit(1);
  if (!resolved) notFound("Player");
  const rows = await listPublicPlayers(year === undefined ? {} : { year });
  const player = rows.find((row) => row.id === resolved.id);
  if (!player) notFound("Player");
  return player;
}
