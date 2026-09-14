import { z } from "zod";

const nullableUuid = z.uuid().nullable().optional();
const nullableDate = z.union([z.iso.datetime(), z.null()]).optional().transform((value) => value ? new Date(value) : value);
const optionalText = z.string().trim().nullable().optional();

export const loginSchema = z.object({
  email: z.email().max(320),
  password: z.string().min(1).max(500),
}).strict();

export const newsCreateSchema = z.object({
  legacyId: z.number().int().positive().nullable().optional(),
  slug: z.string().trim().min(2).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(3).max(300),
  seoTitle: optionalText,
  summary: z.string().trim().min(10),
  metaDescription: optionalText,
  content: z.string().min(1),
  imageUrl: z.string().trim().min(1),
  keywords: z.array(z.string().trim().min(1)).default([]),
  faq: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).default([]),
  foreignPlayers: z.array(z.object({ team: z.string().min(1), teamLink: z.string().optional(), players: z.string().min(1) })).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publishedAt: nullableDate,
}).strict();
export const newsUpdateSchema = newsCreateSchema.partial();

export const pointsCreateSchema = z.object({
  seasonId: z.uuid(), teamId: z.uuid(), position: z.number().int().min(1),
  matches: z.number().int().min(0).default(0), won: z.number().int().min(0).default(0),
  lost: z.number().int().min(0).default(0), tied: z.number().int().min(0).default(0),
  noResult: z.number().int().min(0).default(0), netRunRate: z.union([z.string(), z.number()]).transform(String),
  points: z.number().int().min(0).default(0),
}).strict();
export const pointsUpdateSchema = pointsCreateSchema.partial();

export const fixtureCreateSchema = z.object({
  seasonId: z.uuid(), matchNumber: z.string().trim().min(1).max(80),
  stage: z.enum(["league", "qualifier_1", "eliminator", "qualifier_2", "final", "other"]).default("league"),
  team1Id: nullableUuid, team2Id: nullableUuid,
  team1Label: z.string().trim().min(1).max(180), team2Label: z.string().trim().min(1).max(180),
  scheduledAt: nullableDate, dateLabel: z.string().trim().min(1).max(80), timeLabel: z.string().trim().min(1).max(40),
  venueId: nullableUuid, venueLabel: z.string().trim().min(1).max(240), venueLink: optionalText,
  status: z.enum(["scheduled", "live", "completed", "postponed", "cancelled"]).default("scheduled"),
  isPublished: z.boolean().default(false),
}).strict();
export const fixtureUpdateSchema = fixtureCreateSchema.partial();

const participantSchema = z.object({
  side: z.enum(["team1", "team2"]), teamId: nullableUuid, teamName: z.string().min(1).max(180),
  logoUrl: optionalText, score: optionalText, runs: z.number().int().min(0).nullable().optional(),
  wickets: z.number().int().min(0).max(10).nullable().optional(), overs: z.union([z.string(), z.number()]).nullable().optional().transform((value) => value == null ? value : String(value)),
  target: z.number().int().min(0).nullable().optional(),
}).strict();

export const matchCreateSchema = z.object({
  legacyId: z.number().int().positive().nullable().optional(), externalId: optionalText, fixtureId: nullableUuid,
  seasonId: z.uuid(), matchNumber: z.string().trim().min(1).max(80), matchType: optionalText,
  stage: z.enum(["league", "qualifier_1", "eliminator", "qualifier_2", "final", "other"]).default("league"),
  playedAt: nullableDate, dateLabel: z.string().trim().min(1).max(80), timeLabel: z.string().trim().min(1).max(40),
  venueId: nullableUuid, venueLabel: z.string().trim().min(1).max(240),
  status: z.enum(["scheduled", "live", "completed", "postponed", "cancelled"]).default("scheduled"),
  result: optionalText, winnerTeamId: nullableUuid, winnerLabel: optionalText,
  keywords: z.array(z.string().trim().min(1)).default([]),
  participants: z.array(participantSchema).length(2).refine((rows) => new Set(rows.map((row) => row.side)).size === 2, "Both team1 and team2 are required"),
}).strict();
export const matchUpdateSchema = matchCreateSchema.partial();

export const statCreateSchema = z.object({
  seasonId: nullableUuid, playerId: nullableUuid, teamId: nullableUuid,
  category: z.enum(["top_run_scorer", "top_wicket_taker", "batting_strike_rate", "bowling_economy"]),
  rank: z.number().int().min(1), playerName: z.string().trim().min(1).max(180), teamCode: z.string().trim().min(1).max(12),
  style: optionalText, innings: z.number().int().min(0).default(0),
  runs: z.number().int().min(0).nullable().optional(), wickets: z.number().int().min(0).nullable().optional(),
  average: z.union([z.string(), z.number()]).nullable().optional().transform((value) => value == null ? value : String(value)),
  strikeRate: z.union([z.string(), z.number()]).nullable().optional().transform((value) => value == null ? value : String(value)),
  economy: z.union([z.string(), z.number()]).nullable().optional().transform((value) => value == null ? value : String(value)),
  imageUrl: optionalText, playerLink: optionalText,
}).strict();
export const statUpdateSchema = statCreateSchema.partial();
