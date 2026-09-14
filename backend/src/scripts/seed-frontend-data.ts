import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { eq } from "drizzle-orm";
import { closeDatabase, db } from "../db/index.js";
import {
  fixtures,
  matchTeams,
  matches,
  newsArticles,
  playerAliases,
  playerProfiles,
  players,
  pointsTable,
  seasons,
  stats,
  teamAliases,
  teamMemberships,
  teams,
  venues,
} from "../db/schema/index.js";
import { loadTypescriptExport } from "../utils/load-typescript-data.js";
import { sanitizeArticleHtml } from "../utils/sanitize-article.js";
import { playerProfileDataSchema } from "../validation/platform.js";

const dataDir = fileURLToPath(new URL("../../../frontend/data/", import.meta.url));

const TEAM_CODES: Record<string, string> = {
  "Sudurpaschim Royals": "SPR",
  "Biratnagar Kings": "BIK",
  "Kathmandu Gurkhas": "KAG",
  "Lumbini Lions": "LUL",
  "Pokhara Avengers": "POA",
  "Karnali Yaks": "KAY",
  "Chitwan Rhinos": "CHR",
  "Janakpur Bolts": "JAB",
};

const TEAM_CANONICAL: Record<string, string> = {
  "kathmandu gurkhas": "Kathmandu Gurkhas",
  "kathmandu gurkha": "Kathmandu Gurkhas",
  "kathmandu gorkhas": "Kathmandu Gurkhas",
};

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11,
  dec: 12, december: 12,
};

function canonicalTeam(name: string): string {
  const trimmed = name.trim();
  return TEAM_CANONICAL[trimmed.toLowerCase()] ?? trimmed;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stageFrom(value: string): "league" | "qualifier_1" | "eliminator" | "qualifier_2" | "final" | "other" {
  const normalized = value.toLowerCase();
  if (normalized.includes("qualifier 1")) return "qualifier_1";
  if (normalized.includes("qualifier 2")) return "qualifier_2";
  if (normalized.includes("eliminator")) return "eliminator";
  if (normalized.includes("final")) return "final";
  if (normalized.includes("match")) return "league";
  return "other";
}

function parseNepalDate(year: number, dateLabel: string, timeLabel: string): Date | null {
  const dateParts = dateLabel.replace(",", "").trim().split(/\s+/);
  if (dateParts.length < 2) return null;
  const month = MONTHS[dateParts[0]!.toLowerCase()];
  const day = Number.parseInt(dateParts[1]!, 10);
  const timeMatch = timeLabel.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!month || !day || !timeMatch) return null;
  let hour = Number.parseInt(timeMatch[1]!, 10) % 12;
  if (timeMatch[3]!.toUpperCase() === "PM") hour += 12;
  const minute = Number.parseInt(timeMatch[2]!, 10);
  return new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+05:45`);
}

function parseScore(score?: string): { runs: number | null; wickets: number | null } {
  if (!score) return { runs: null, wickets: null };
  const [runs, wickets] = score.split("/");
  return {
    runs: Number.isFinite(Number(runs)) ? Number(runs) : null,
    wickets: wickets !== undefined && Number.isFinite(Number(wickets)) ? Number(wickets) : null,
  };
}

function imageUrl(image: string | { src?: string }): string {
  return typeof image === "string" ? image : image.src || "/placeholder.svg";
}

type PointsRow = { position: number; team: string; logo: string; matches: number; won: number; loss: number; noResult: number; netRunRate: string; points: number };
type Article = { id: string; slug: string; title: string; date: string; summary: string; content: string; image: string | { src?: string }; keywords?: string[]; faq?: Array<{ question: string; answer: string }>; foreignPlayers?: Array<{ team: string; teamLink?: string; players: string }> };
type Fixture = { date: string; match: string; time: string; venue: string; venueLink?: string };
type MatchJson = { id: number; matchId?: string; matchNumber: string; date: string; time: string; venue?: string; status?: string; matchType?: string; team1: { name: string; logo: string; score?: string; overs?: string }; team2: { name: string; logo: string; score?: string; overs?: string; target?: string }; result?: string; winner?: string; keywords?: string[] };
type StatRow = { name: string; team: string; type?: string; runs?: number; wickets?: number; strikeRate?: number; economy?: number; innings: number; average?: number; image?: string; playerLink?: string };
type StatsData = { topRunScorers: StatRow[]; topWicketTakers: StatRow[]; bestBattingStrikeRates: StatRow[]; bestBowlingEconomy: StatRow[] };
type RichTeam = {
  id: string; teamName: string; logo: string | { src?: string }; captain?: string; coach?: string; owner?: string;
  nplWin?: number; venue?: string; venueLink?: string; website?: string; seoTitle?: string; metaDescription?: string;
  introContent?: string; afterplayersContent?: string; faqs?: Array<{ question: string; answer: string }>;
};
type SquadPlayer = { name: string; role: string; status: "retained" | "auction"; auctionPrice?: string; isMarquee?: boolean };
type Squads = Record<string, { players: SquadPlayer[]; coach: string }>;
type RichProfile = Record<string, unknown> & { slug: string; fullName: string; displayName: string; image?: string; teamSlug: string };

const PROFILE_MODULES = [
  ["biratnagar-kings", "BIRATNAGAR_KINGS_PROFILES"],
  ["chitwan-rhinos", "CHITWAN_RHINOS_PROFILES"],
  ["janakpur-bolts", "JANAKPUR_BOLTS_PROFILES"],
  ["karnali-yaks", "KARNALI_YAKS_PROFILES"],
  ["kathmandu-gorkhas", "KATHMANDU_GORKHAS_PROFILES"],
  ["lumbini-lions", "LUMBINI_LIONS_PROFILES"],
  ["pokhara-avengers", "POKHARA_AVENGERS_PROFILES"],
  ["sudurpaschim-royals", "SUDURPASCHIM_ROYALS_PROFILES"],
] as const;

function sanitizeProfileValue(value: unknown): unknown {
  if (typeof value === "string") return sanitizeArticleHtml(value);
  if (Array.isArray(value)) return value.map(sanitizeProfileValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeProfileValue(item)]));
  return value;
}

async function loadProfileAliases(): Promise<Record<string, string>> {
  const source = await readFile(path.join(dataDir, "player-profiles", "index.ts"), "utf8");
  const block = source.match(/const PROFILE_SLUG_ALIASES:[^{]+\{([\s\S]*?)\n\}/)?.[1];
  if (!block) throw new Error("Unable to read player profile aliases");
  return Object.fromEntries(Array.from(block.matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g), (match) => [match[1]!, match[2]!]));
}

async function seed(): Promise<void> {
  const pointsBySeason = await loadTypescriptExport<Record<string, PointsRow[]>>(path.join(dataDir, "points-data.ts"), "pointsDataBySeason");
  const articles = await loadTypescriptExport<Article[]>(path.join(dataDir, "news-data.ts"), "newsArticles");
  const fixtures2026 = await loadTypescriptExport<Fixture[]>(path.join(dataDir, "matches.ts"), "matches");
  const statsData = await loadTypescriptExport<StatsData>(path.join(dataDir, "stats-data.ts"), "StatsData");
  const richTeams = await loadTypescriptExport<RichTeam[]>(path.join(dataDir, "teamData.tsx"), "teamsData");
  const squads = await loadTypescriptExport<Squads>(path.join(dataDir, "players-data.ts"), "playersData");
  const profileAliases = await loadProfileAliases();
  const richProfiles: RichProfile[] = [];
  for (const [moduleName, exportName] of PROFILE_MODULES) {
    const moduleProfiles = await loadTypescriptExport<unknown[]>(path.join(dataDir, "player-profiles", "teams", `${moduleName}.ts`), exportName);
    for (const rawProfile of moduleProfiles) {
      const parsed = playerProfileDataSchema.parse(rawProfile) as RichProfile;
      richProfiles.push(sanitizeProfileValue(parsed) as RichProfile);
    }
  }
  const uniqueProfileSlugs = new Set(richProfiles.map((profile) => profile.slug));
  if (richProfiles.length !== 101 || uniqueProfileSlugs.size !== richProfiles.length) {
    throw new Error(`Expected 101 unique player profiles, found ${richProfiles.length} rows and ${uniqueProfileSlugs.size} unique slugs`);
  }
  const matchesFile = JSON.parse(await readFile(path.join(dataDir, "matches.json"), "utf8")) as { matches: MatchJson[] };

  await db.transaction(async (tx) => {
  const seasonIds = new Map<number, string>();
  for (const season of [
    { year: 2025, seasonNumber: 2, name: "NPL 2025 (Season 2)", status: "completed" as const, fixturesAnnounced: true },
    { year: 2026, seasonNumber: 3, name: "NPL 2026 (Season 3)", status: "announced" as const, fixturesAnnounced: false },
  ]) {
    const [row] = await tx.insert(seasons).values(season).onConflictDoUpdate({ target: seasons.year, set: { name: season.name, status: season.status, fixturesAnnounced: season.fixturesAnnounced, updatedAt: new Date() } }).returning({ id: seasons.id });
    seasonIds.set(season.year, row!.id);
  }

  const teamRows = Object.values(pointsBySeason).flat();
  const teamIds = new Map<string, string>();
  const teamIdsBySlug = new Map<string, string>();
  for (const item of teamRows) {
    const name = canonicalTeam(item.team);
    if (teamIds.has(name)) continue;
    const [row] = await tx.insert(teams).values({ slug: slugify(name), name, shortCode: TEAM_CODES[name], logoUrl: item.logo }).onConflictDoUpdate({ target: teams.slug, set: { name, shortCode: TEAM_CODES[name], logoUrl: item.logo, updatedAt: new Date() } }).returning({ id: teams.id });
    teamIds.set(name, row!.id);
    teamIdsBySlug.set(slugify(name), row!.id);
  }

  for (const item of richTeams) {
    const values = {
      slug: item.id,
      name: item.teamName,
      shortCode: TEAM_CODES[item.teamName],
      logoUrl: imageUrl(item.logo),
      captain: item.captain,
      coach: item.coach,
      owner: item.owner,
      championships: item.nplWin ?? 0,
      venueName: item.venue,
      venueLink: item.venueLink,
      website: item.website,
      seoTitle: item.seoTitle,
      metaDescription: item.metaDescription,
      introContent: item.introContent ? sanitizeArticleHtml(item.introContent) : null,
      afterPlayersContent: item.afterplayersContent ? sanitizeArticleHtml(item.afterplayersContent) : null,
      faqs: item.faqs ?? [],
      isActive: true,
    };
    const [row] = await tx.insert(teams).values(values).onConflictDoUpdate({ target: teams.slug, set: { ...values, updatedAt: new Date() } }).returning({ id: teams.id });
    teamIds.set(item.teamName, row!.id);
    teamIdsBySlug.set(item.id, row!.id);
  }
  const kathmanduId = teamIdsBySlug.get("kathmandu-gurkhas");
  if (!kathmanduId) throw new Error("Kathmandu Gurkhas team was not seeded");
  await tx.insert(teamAliases).values({ teamId: kathmanduId, alias: "kathmandu-gorkhas" }).onConflictDoNothing();

  const venueName = "Tribhuvan University Cricket Ground, Kirtipur";
  const [venue] = await tx.insert(venues).values({ slug: "tribhuvan-university-cricket-ground-kirtipur", name: venueName, link: "/npl-venue/tribhuvan-university-cricket-ground-kirtipur/", city: "Kirtipur" }).onConflictDoUpdate({ target: venues.slug, set: { name: venueName, updatedAt: new Date() } }).returning({ id: venues.id });

  for (const [yearText, rows] of Object.entries(pointsBySeason)) {
    const seasonId = seasonIds.get(Number(yearText))!;
    await tx.delete(pointsTable).where(eq(pointsTable.seasonId, seasonId));
    await tx.insert(pointsTable).values(rows.map((item) => ({
      seasonId,
      teamId: teamIds.get(canonicalTeam(item.team))!,
      position: item.position,
      matches: item.matches,
      won: item.won,
      lost: item.loss,
      noResult: item.noResult,
      netRunRate: item.netRunRate,
      points: item.points,
    })));
  }

  const season2026 = seasonIds.get(2026)!;
  for (const [index, item] of fixtures2026.entries()) {
    const [rawTeam1 = "TBA", rawTeam2 = "TBA"] = item.match.split(/\s+vs\s+/i);
    const team1Label = canonicalTeam(rawTeam1);
    const team2Label = canonicalTeam(rawTeam2);
    const matchNumber = /^match\s/i.test(item.match) ? item.match : item.match.toLowerCase().includes(" vs ") ? `Match ${index + 1}` : item.match;
    await tx.insert(fixtures).values({ seasonId: season2026, matchNumber, stage: stageFrom(matchNumber), team1Id: teamIds.get(team1Label), team2Id: teamIds.get(team2Label), team1Label, team2Label, scheduledAt: parseNepalDate(2026, item.date, item.time), dateLabel: item.date, timeLabel: item.time, venueId: venue!.id, venueLabel: item.venue || venueName, venueLink: item.venueLink, isPublished: false }).onConflictDoUpdate({ target: [fixtures.seasonId, fixtures.matchNumber], set: { team1Id: teamIds.get(team1Label), team2Id: teamIds.get(team2Label), team1Label, team2Label, scheduledAt: parseNepalDate(2026, item.date, item.time), dateLabel: item.date, timeLabel: item.time, venueLabel: item.venue || venueName, venueLink: item.venueLink, updatedAt: new Date() } });
  }

  const season2025 = seasonIds.get(2025)!;
  for (const item of matchesFile.matches) {
    const team1Name = canonicalTeam(item.team1.name);
    const team2Name = canonicalTeam(item.team2.name);
    if (team1Name === "TBA" || team2Name === "TBA") continue;
    const record = {
      seasonId: season2025,
      matchNumber: item.matchNumber,
      stage: stageFrom(item.matchNumber),
      team1Id: teamIds.get(team1Name),
      team2Id: teamIds.get(team2Name),
      team1Label: team1Name,
      team2Label: team2Name,
      scheduledAt: parseNepalDate(2025, item.date, item.time),
      dateLabel: item.date,
      timeLabel: item.time,
      venueId: venue!.id,
      venueLabel: item.venue || venueName,
      status: (item.status === "completed" ? "completed" : item.status === "live" ? "live" : "scheduled") as "completed" | "live" | "scheduled",
      isPublished: true,
    };
    await tx.insert(fixtures).values(record).onConflictDoUpdate({
      target: [fixtures.seasonId, fixtures.matchNumber],
      set: {
        ...record,
        updatedAt: new Date(),
      },
    });
  }

  for (const item of matchesFile.matches) {
    const team1Name = canonicalTeam(item.team1.name);
    const team2Name = canonicalTeam(item.team2.name);
    const winnerLabel = item.winner ? canonicalTeam(item.winner) : null;
    const [match] = await tx.insert(matches).values({ legacyId: item.id, externalId: item.matchId, seasonId: season2025, matchNumber: item.matchNumber, matchType: item.matchType, stage: stageFrom(item.matchNumber), playedAt: parseNepalDate(2025, item.date, item.time), dateLabel: item.date, timeLabel: item.time, venueId: venue!.id, venueLabel: item.venue || venueName, status: item.status === "completed" ? "completed" : item.status === "live" ? "live" : "scheduled", result: item.result, winnerTeamId: winnerLabel ? teamIds.get(winnerLabel) : undefined, winnerLabel, keywords: item.keywords ?? [] }).onConflictDoUpdate({ target: [matches.seasonId, matches.matchNumber], set: { matchType: item.matchType, result: item.result, winnerTeamId: winnerLabel ? teamIds.get(winnerLabel) : null, winnerLabel, keywords: item.keywords ?? [], updatedAt: new Date() } }).returning({ id: matches.id });

    for (const [side, participant] of [["team1", item.team1], ["team2", item.team2]] as const) {
      const name = canonicalTeam(participant.name);
      const score = parseScore(participant.score);
      await tx.insert(matchTeams).values({ matchId: match!.id, side, teamId: teamIds.get(name), teamName: name, logoUrl: participant.logo, score: participant.score, runs: score.runs, wickets: score.wickets, overs: participant.overs, target: "target" in participant && participant.target ? Number(participant.target) : null }).onConflictDoUpdate({ target: [matchTeams.matchId, matchTeams.side], set: { teamId: teamIds.get(name), teamName: name, logoUrl: participant.logo, score: participant.score, runs: score.runs, wickets: score.wickets, overs: participant.overs, target: "target" in participant && participant.target ? Number(participant.target) : null } });
    }
  }

  for (const article of articles) {
    const publishedAt = new Date(`${article.date} 12:00:00 UTC`);
    await tx.insert(newsArticles).values({ legacyId: Number.isFinite(Number(article.id)) ? Number(article.id) : null, slug: article.slug, title: article.title, seoTitle: article.title, summary: article.summary, metaDescription: article.summary, content: sanitizeArticleHtml(article.content), imageUrl: imageUrl(article.image), keywords: article.keywords ?? [], faq: article.faq ?? [], foreignPlayers: article.foreignPlayers ?? [], status: "published", publishedAt: Number.isNaN(publishedAt.getTime()) ? null : publishedAt }).onConflictDoUpdate({ target: newsArticles.slug, set: { title: article.title, seoTitle: article.title, summary: article.summary, metaDescription: article.summary, content: sanitizeArticleHtml(article.content), imageUrl: imageUrl(article.image), keywords: article.keywords ?? [], faq: article.faq ?? [], foreignPlayers: article.foreignPlayers ?? [], status: "published", publishedAt: Number.isNaN(publishedAt.getTime()) ? null : publishedAt, updatedAt: new Date() } });
  }

  const statGroups: Array<[keyof StatsData, "top_run_scorer" | "top_wicket_taker" | "batting_strike_rate" | "bowling_economy"]> = [
    ["topRunScorers", "top_run_scorer"], ["topWicketTakers", "top_wicket_taker"], ["bestBattingStrikeRates", "batting_strike_rate"], ["bestBowlingEconomy", "bowling_economy"],
  ];
  const codeToTeamId = new Map(Array.from(teamIds.entries()).map(([name, id]) => [TEAM_CODES[name], id]));
  for (const [group, category] of statGroups) {
    for (const [index, item] of statsData[group].entries()) {
      const candidateSlug = slugify(item.name);
      const slug = profileAliases[candidateSlug] ?? candidateSlug;
      const [player] = await tx.insert(players).values({ slug, name: item.name, imageUrl: item.image, playerLink: item.playerLink, battingStyle: ["rhb", "lhb"].includes(item.type || "") ? item.type : undefined, bowlingStyle: !["rhb", "lhb"].includes(item.type || "") ? item.type : undefined }).onConflictDoUpdate({ target: players.slug, set: { name: item.name, imageUrl: item.image, playerLink: item.playerLink, updatedAt: new Date() } }).returning({ id: players.id });
      await tx.insert(stats).values({ seasonId: season2025, playerId: player!.id, teamId: codeToTeamId.get(item.team), category, rank: index + 1, playerName: item.name, teamCode: item.team, style: item.type, innings: item.innings, runs: item.runs, wickets: item.wickets, average: item.average?.toString(), strikeRate: item.strikeRate?.toString(), economy: item.economy?.toString(), imageUrl: item.image, playerLink: item.playerLink }).onConflictDoUpdate({ target: [stats.category, stats.seasonId, stats.rank], set: { playerId: player!.id, teamId: codeToTeamId.get(item.team), playerName: item.name, teamCode: item.team, style: item.type, innings: item.innings, runs: item.runs, wickets: item.wickets, average: item.average?.toString(), strikeRate: item.strikeRate?.toString(), economy: item.economy?.toString(), imageUrl: item.image, playerLink: item.playerLink, updatedAt: new Date() } });
    }
  }

  const profileBySlug = new Map(richProfiles.map((profile) => [profile.slug, profile]));
  const playerIdsBySlug = new Map<string, string>();
  for (const profile of [...richProfiles].sort((left, right) => left.slug.localeCompare(right.slug))) {
    const insertValues = {
      slug: profile.slug,
      name: profile.displayName || profile.fullName,
      imageUrl: profile.image ?? null,
      playerLink: `/player/${profile.slug}/profile/`,
    };
    const updateValues = {
      name: insertValues.name,
      playerLink: insertValues.playerLink,
      ...(profile.image ? { imageUrl: profile.image } : {}),
      updatedAt: new Date(),
    };
    const [player] = await tx.insert(players).values(insertValues).onConflictDoUpdate({ target: players.slug, set: updateValues }).returning({ id: players.id });
    playerIdsBySlug.set(profile.slug, player!.id);
    await tx.insert(playerProfiles).values({ playerId: player!.id, profileData: profile, isPublished: true })
      .onConflictDoUpdate({ target: playerProfiles.playerId, set: { profileData: profile, isPublished: true, updatedAt: new Date() } });
  }

  for (const [alias, canonicalSlug] of Object.entries(profileAliases).sort(([left], [right]) => left.localeCompare(right))) {
    const playerId = playerIdsBySlug.get(canonicalSlug);
    if (!playerId || alias === canonicalSlug) continue;
    await tx.insert(playerAliases).values({ playerId, alias }).onConflictDoNothing();
  }

  const membershipRows: Array<typeof teamMemberships.$inferInsert> = [];
  for (const [teamSlug, squad] of Object.entries(squads).sort(([left], [right]) => left.localeCompare(right))) {
    const teamId = teamIdsBySlug.get(teamSlug);
    if (!teamId) throw new Error(`Squad references unknown team ${teamSlug}`);
    for (const [sortOrder, member] of squad.players.entries()) {
      const candidateSlug = slugify(member.name);
      const canonicalSlug = profileAliases[candidateSlug] ?? candidateSlug;
      const profile = profileBySlug.get(canonicalSlug);
      const playerId = playerIdsBySlug.get(canonicalSlug);
      if (!profile || !playerId) throw new Error(`Squad player ${member.name} (${candidateSlug}) has no rich profile`);
      membershipRows.push({
        seasonId: season2026,
        teamId,
        playerId,
        role: member.role,
        status: member.status,
        auctionPrice: member.auctionPrice,
        isMarquee: member.isMarquee ?? false,
        sortOrder,
      });
    }
  }
  if (membershipRows.length !== 100) throw new Error(`Expected 100 squad memberships, found ${membershipRows.length}`);
  await tx.delete(teamMemberships).where(eq(teamMemberships.seasonId, season2026));
  await tx.insert(teamMemberships).values(membershipRows);

  console.log(`Seeded ${articles.length} news articles, ${matchesFile.matches.length} matches, ${fixtures2026.length} fixtures, ${richTeams.length} rich teams, ${richProfiles.length} rich player profiles, ${membershipRows.length} memberships, standings, venues, and stats.`);
  });
}

try {
  await seed();
} finally {
  await closeDatabase();
}
