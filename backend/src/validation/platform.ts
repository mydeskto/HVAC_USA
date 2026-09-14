import { z } from "zod";

const optionalText = z.string().trim().nullable().optional();
const slug = z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const faqSchema = z.object({
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(5_000),
}).strict();

export const adUnitSchema = z.object({
  id: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(180),
  client: z.string().trim().min(1).max(180),
  slot: z.string().trim().min(1).max(180),
  format: z.string().trim().min(1).max(80),
  position: z.string().trim().min(1).max(120),
}).strict();

const profileKeyValueSchema = z.object({ label: z.string(), value: z.string() }).strict();
const careerFormatStatsSchema = z.object({
  format: z.string(), mat: z.string(), inns: z.string(), runs: z.string(), hs: z.string(),
  avg: z.string(), sr: z.string(), hundreds: z.string(), fifties: z.string(), wickets: z.string(),
  best: z.string(), econ: z.string(), catches: z.string(),
}).strict();

export const playerProfileDataSchema = z.object({
  slug,
  fullName: z.string().trim().min(1).max(180),
  displayName: z.string().trim().min(1).max(180),
  seo: z.object({ title: z.string(), description: z.string() }).strict(),
  image: z.string().optional(),
  role: z.string(),
  team: z.string(),
  teamSlug: slug,
  tagline: z.string(),
  summary: z.string(),
  intro: z.string(),
  personalInfo: z.array(profileKeyValueSchema),
  career: z.array(z.object({ title: z.string(), paragraphs: z.array(z.string()) }).strict()),
  salaryAuction: z.object({ details: z.array(profileKeyValueSchema), note: z.string() }).strict(),
  nplStats: z.array(z.object({
    season: z.string(), team: z.string(), matches: z.string(), runs: z.string(), highestScore: z.string(),
    average: z.string(), wickets: z.string(), bestBowling: z.string(),
  }).strict()),
  careerStats: z.object({
    t20i: careerFormatStatsSchema,
    odi: careerFormatStatsSchema,
    note: z.string().optional(),
  }).strict(),
  performanceStats: z.array(z.object({ label: z.string(), value: z.string() }).strict()),
  achievements: z.array(z.string()),
  latestNews: z.array(z.object({ period: z.string(), summary: z.string() }).strict()),
  faqs: z.array(faqSchema),
}).strict();

const teamFields = {
  slug,
  name: z.string().trim().min(1).max(160),
  shortCode: z.string().trim().min(1).max(12).nullable().optional(),
  logoUrl: optionalText,
  captain: optionalText,
  coach: optionalText,
  owner: optionalText,
  championships: z.number().int().min(0),
  venueName: optionalText,
  venueLink: optionalText,
  website: optionalText,
  seoTitle: optionalText,
  metaDescription: optionalText,
  introContent: optionalText,
  afterPlayersContent: optionalText,
  faqs: z.array(faqSchema),
  isActive: z.boolean(),
  aliases: z.array(slug).max(100),
};
export const teamCreateSchema = z.object({
  ...teamFields,
  championships: teamFields.championships.default(0),
  faqs: teamFields.faqs.default([]),
  isActive: teamFields.isActive.default(true),
  aliases: teamFields.aliases.default([]),
}).strict();
export const teamUpdateSchema = z.object(teamFields).partial().strict();

export const membershipSchema = z.object({
  seasonId: z.uuid(),
  teamId: z.uuid(),
  role: z.string().trim().min(1).max(160),
  status: z.enum(["retained", "auction", "other"]).default("other"),
  auctionPrice: z.string().trim().max(80).nullable().optional(),
  isMarquee: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
}).strict();

const playerAggregateFields = {
  slug,
  name: z.string().trim().min(1).max(180),
  imageUrl: optionalText,
  playerLink: optionalText,
  battingStyle: z.string().trim().max(40).nullable().optional(),
  bowlingStyle: z.string().trim().max(60).nullable().optional(),
  profile: playerProfileDataSchema.nullable().optional(),
  richContent: z.string().nullable().optional(),
  adUnits: z.array(adUnitSchema).max(50),
  isPublished: z.boolean(),
  aliases: z.array(slug).max(100),
  membership: membershipSchema.nullable().optional(),
};
export const playerAggregateCreateSchema = z.object({
  ...playerAggregateFields,
  adUnits: playerAggregateFields.adUnits.default([]),
  isPublished: playerAggregateFields.isPublished.default(false),
  aliases: playerAggregateFields.aliases.default([]),
}).strict();
export const playerAggregateUpdateSchema = z.object(playerAggregateFields).partial().strict();

export const importRequestSchema = z.object({
  schemaVersion: z.literal(1),
  resource: z.enum(["news", "points", "fixtures", "matches", "stats", "teams", "players"]),
  mode: z.enum(["upsert", "replace"]),
  scope: z.object({
    seasonId: z.uuid().optional(),
    category: z.enum(["top_run_scorer", "top_wicket_taker", "batting_strike_rate", "bowling_economy"]).optional(),
  }).strict().optional(),
  rows: z.array(z.unknown()).max(1_000),
}).strict();

export type TeamInput = z.infer<typeof teamCreateSchema>;
export type PlayerAggregateInput = z.infer<typeof playerAggregateCreateSchema>;
export type ImportRequest = z.infer<typeof importRequestSchema>;

const venueStatRowSchema = z.object({
  record: z.string().trim().min(1).max(200),
  value: z.string().trim().min(1).max(400),
}).strict();

const venueFormatStatsSchema = z.object({
  format: z.string().trim().min(1).max(120),
  rows: z.array(venueStatRowSchema).max(60),
}).strict();

const venueAddressSchema = z.object({
  addressLocality: z.string().trim().max(160).default(""),
  addressRegion: z.string().trim().max(160).default(""),
  addressCountry: z.string().trim().max(120).default(""),
  fullAddress: z.string().trim().max(400).default(""),
}).strict();

export const venueCreateSchema = z.object({
  slug,
  name: z.string().trim().min(1).max(240),
  link: optionalText,
  city: z.string().trim().max(120).nullable().optional(),
  timezone: z.string().trim().max(80).default("Asia/Kathmandu"),
  alternateName: z.string().trim().max(240).nullable().optional(),
  location: z.string().trim().max(300).nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  established: z.number().int().min(0).max(3000).nullable().optional(),
  owner: z.string().trim().max(240).nullable().optional(),
  operator: z.string().trim().max(240).nullable().optional(),
  pitchType: z.string().trim().max(240).nullable().optional(),
  homeTeam: z.string().trim().max(300).nullable().optional(),
  description: optionalText,
  pitchDescription: optionalText,
  imageUrl: optionalText,
  mapEmbed: optionalText,
  seoTitle: optionalText,
  metaDescription: optionalText,
  keywords: z.array(z.string().trim().min(1)).max(60).default([]),
  address: venueAddressSchema.nullable().optional(),
  overviewRows: z.array(venueStatRowSchema).max(80).default([]),
  formatStats: z.array(venueFormatStatsSchema).max(10).default([]),
  isActive: z.boolean().default(true),
}).strict();
export const venueUpdateSchema = venueCreateSchema.partial();

export type VenueInput = z.infer<typeof venueCreateSchema>;
