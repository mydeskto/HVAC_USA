import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export type PlayerProfileData = Record<string, unknown>;

export interface AdUnit {
  id: string;
  label: string;
  client: string;
  slot: string;
  format: string;
  position: string;
}

export const seasonStatusEnum = pgEnum("season_status", [
  "draft",
  "announced",
  "active",
  "completed",
]);
export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "completed",
  "postponed",
  "cancelled",
]);
export const matchStageEnum = pgEnum("match_stage", [
  "league",
  "qualifier_1",
  "eliminator",
  "qualifier_2",
  "final",
  "other",
]);
export const matchSideEnum = pgEnum("match_side", ["team1", "team2"]);
export const statCategoryEnum = pgEnum("stat_category", [
  "top_run_scorer",
  "top_wicket_taker",
  "batting_strike_rate",
  "bowling_economy",
]);

export const seasons = pgTable(
  "seasons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    year: integer("year").notNull(),
    seasonNumber: integer("season_number").notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    status: seasonStatusEnum("status").notNull().default("draft"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    timezone: varchar("timezone", { length: 80 }).notNull().default("Asia/Kathmandu"),
    fixturesAnnounced: boolean("fixtures_announced").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("seasons_year_unique").on(table.year),
    uniqueIndex("seasons_number_unique").on(table.seasonNumber),
  ],
);

export const membershipStatusEnum = pgEnum("membership_status", ["retained", "auction", "other"]);

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    shortCode: varchar("short_code", { length: 12 }),
    logoUrl: text("logo_url"),
    captain: varchar("captain", { length: 180 }),
    coach: varchar("coach", { length: 180 }),
    owner: varchar("owner", { length: 240 }),
    championships: integer("championships").notNull().default(0),
    venueName: varchar("venue_name", { length: 240 }),
    venueLink: text("venue_link"),
    website: text("website"),
    seoTitle: text("seo_title"),
    metaDescription: text("meta_description"),
    introContent: text("intro_content"),
    afterPlayersContent: text("after_players_content"),
    faqs: jsonb("faqs")
      .$type<Array<{ question: string; answer: string }>>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("teams_slug_unique").on(table.slug),
    uniqueIndex("teams_name_unique").on(table.name),
    uniqueIndex("teams_short_code_unique").on(table.shortCode),
  ],
);

export const teamAliases = pgTable(
  "team_aliases",
  {
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    alias: varchar("alias", { length: 160 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.teamId, table.alias] }), uniqueIndex("team_alias_unique").on(table.alias)],
);

export const players = pgTable(
  "players",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 160 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    imageUrl: text("image_url"),
    playerLink: text("player_link"),
    battingStyle: varchar("batting_style", { length: 40 }),
    bowlingStyle: varchar("bowling_style", { length: 60 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("players_slug_unique").on(table.slug)],
);

export const playerAliases = pgTable(
  "player_aliases",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    alias: varchar("alias", { length: 180 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.playerId, table.alias] }),
    uniqueIndex("player_alias_unique").on(table.alias),
  ],
);

export const teamMemberships = pgTable(
  "team_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seasonId: uuid("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
    teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
    playerId: uuid("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 160 }).notNull(),
    status: membershipStatusEnum("status").notNull().default("other"),
    auctionPrice: varchar("auction_price", { length: 80 }),
    isMarquee: boolean("is_marquee").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("team_memberships_season_player_unique").on(table.seasonId, table.playerId),
    index("team_memberships_team_season_idx").on(table.teamId, table.seasonId),
  ],
);

export const playerProfiles = pgTable("player_profiles", {
  playerId: uuid("player_id")
    .primaryKey()
    .references(() => players.id, { onDelete: "cascade" }),
  profileData: jsonb("profile_data").$type<PlayerProfileData>().notNull().default(sql`'{}'::jsonb`),
  richContent: text("rich_content"),
  adUnits: jsonb("ad_units").$type<AdUnit[]>().notNull().default(sql`'[]'::jsonb`),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export interface VenueStatRow {
  record: string;
  value: string;
}
export interface VenueFormatStats {
  format: string;
  rows: VenueStatRow[];
}
export interface VenueAddress {
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
  fullAddress: string;
}
export interface VenueScheduleRow {
  date: string;
  time: string;
  match: string;
}

export const venues = pgTable(
  "venues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 180 }).notNull(),
    name: varchar("name", { length: 240 }).notNull(),
    link: text("link"),
    city: varchar("city", { length: 120 }),
    timezone: varchar("timezone", { length: 80 }).notNull().default("Asia/Kathmandu"),
    alternateName: varchar("alternate_name", { length: 240 }),
    location: varchar("location", { length: 300 }),
    capacity: integer("capacity"),
    established: integer("established"),
    owner: varchar("owner", { length: 240 }),
    operator: varchar("operator", { length: 240 }),
    pitchType: varchar("pitch_type", { length: 240 }),
    homeTeam: varchar("home_team", { length: 300 }),
    description: text("description"),
    pitchDescription: text("pitch_description"),
    imageUrl: text("image_url"),
    mapEmbed: text("map_embed"),
    seoTitle: text("seo_title"),
    metaDescription: text("meta_description"),
    keywords: jsonb("keywords").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    address: jsonb("address").$type<VenueAddress | null>(),
    overviewRows: jsonb("overview_rows").$type<VenueStatRow[]>().notNull().default(sql`'[]'::jsonb`),
    formatStats: jsonb("format_stats").$type<VenueFormatStats[]>().notNull().default(sql`'[]'::jsonb`),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("venues_slug_unique").on(table.slug)],
);

export const pointsTable = pgTable(
  "points_table",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seasonId: uuid("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
    teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    matches: integer("matches").notNull().default(0),
    won: integer("won").notNull().default(0),
    lost: integer("lost").notNull().default(0),
    tied: integer("tied").notNull().default(0),
    noResult: integer("no_result").notNull().default(0),
    netRunRate: numeric("net_run_rate", { precision: 8, scale: 3 }).notNull().default("0.000"),
    points: integer("points").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("points_season_team_unique").on(table.seasonId, table.teamId),
    uniqueIndex("points_season_position_unique").on(table.seasonId, table.position),
    index("points_season_idx").on(table.seasonId),
  ],
);

export const fixtures = pgTable(
  "fixtures",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seasonId: uuid("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
    matchNumber: varchar("match_number", { length: 80 }).notNull(),
    stage: matchStageEnum("stage").notNull().default("league"),
    team1Id: uuid("team1_id").references(() => teams.id, { onDelete: "set null" }),
    team2Id: uuid("team2_id").references(() => teams.id, { onDelete: "set null" }),
    team1Label: varchar("team1_label", { length: 180 }).notNull(),
    team2Label: varchar("team2_label", { length: 180 }).notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    dateLabel: varchar("date_label", { length: 80 }).notNull(),
    timeLabel: varchar("time_label", { length: 40 }).notNull(),
    venueId: uuid("venue_id").references(() => venues.id, { onDelete: "set null" }),
    venueLabel: varchar("venue_label", { length: 240 }).notNull(),
    venueLink: text("venue_link"),
    status: matchStatusEnum("status").notNull().default("scheduled"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("fixtures_season_number_unique").on(table.seasonId, table.matchNumber),
    index("fixtures_scheduled_at_idx").on(table.scheduledAt),
  ],
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    legacyId: integer("legacy_id"),
    externalId: varchar("external_id", { length: 180 }),
    fixtureId: uuid("fixture_id").references(() => fixtures.id, { onDelete: "set null" }),
    seasonId: uuid("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
    matchNumber: varchar("match_number", { length: 80 }).notNull(),
    matchType: varchar("match_type", { length: 120 }),
    stage: matchStageEnum("stage").notNull().default("league"),
    playedAt: timestamp("played_at", { withTimezone: true }),
    dateLabel: varchar("date_label", { length: 80 }).notNull(),
    timeLabel: varchar("time_label", { length: 40 }).notNull(),
    venueId: uuid("venue_id").references(() => venues.id, { onDelete: "set null" }),
    venueLabel: varchar("venue_label", { length: 240 }).notNull(),
    status: matchStatusEnum("status").notNull().default("scheduled"),
    result: text("result"),
    winnerTeamId: uuid("winner_team_id").references(() => teams.id, { onDelete: "set null" }),
    winnerLabel: varchar("winner_label", { length: 180 }),
    keywords: jsonb("keywords").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("matches_season_number_unique").on(table.seasonId, table.matchNumber),
    uniqueIndex("matches_external_id_unique").on(table.externalId),
    index("matches_status_played_idx").on(table.status, table.playedAt),
  ],
);

export const matchTeams = pgTable(
  "match_teams",
  {
    matchId: uuid("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
    side: matchSideEnum("side").notNull(),
    teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
    teamName: varchar("team_name", { length: 180 }).notNull(),
    logoUrl: text("logo_url"),
    score: varchar("score", { length: 40 }),
    runs: integer("runs"),
    wickets: integer("wickets"),
    overs: numeric("overs", { precision: 5, scale: 1 }),
    target: integer("target"),
  },
  (table) => [primaryKey({ columns: [table.matchId, table.side] }), index("match_teams_team_idx").on(table.teamId)],
);

export const stats = pgTable(
  "stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seasonId: uuid("season_id").references(() => seasons.id, { onDelete: "cascade" }),
    playerId: uuid("player_id").references(() => players.id, { onDelete: "set null" }),
    teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
    category: statCategoryEnum("category").notNull(),
    rank: integer("rank").notNull(),
    playerName: varchar("player_name", { length: 180 }).notNull(),
    teamCode: varchar("team_code", { length: 12 }).notNull(),
    style: varchar("style", { length: 60 }),
    innings: integer("innings").notNull().default(0),
    runs: integer("runs"),
    wickets: integer("wickets"),
    average: numeric("average", { precision: 10, scale: 2 }),
    strikeRate: numeric("strike_rate", { precision: 10, scale: 2 }),
    economy: numeric("economy", { precision: 10, scale: 2 }),
    imageUrl: text("image_url"),
    playerLink: text("player_link"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("stats_category_season_rank_unique").on(table.category, table.seasonId, table.rank),
    index("stats_category_idx").on(table.category),
  ],
);
