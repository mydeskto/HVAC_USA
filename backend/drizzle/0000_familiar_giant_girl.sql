CREATE TYPE "public"."user_role" AS ENUM('superadmin');--> statement-breakpoint
CREATE TYPE "public"."article_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."match_side" AS ENUM('team1', 'team2');--> statement-breakpoint
CREATE TYPE "public"."match_stage" AS ENUM('league', 'qualifier_1', 'eliminator', 'qualifier_2', 'final', 'other');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'live', 'completed', 'postponed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."season_status" AS ENUM('draft', 'announced', 'active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."stat_category" AS ENUM('top_run_scorer', 'top_wicket_taker', 'batting_strike_rate', 'bowling_economy');--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" varchar(64),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'superadmin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_id" integer,
	"slug" varchar(220) NOT NULL,
	"title" varchar(300) NOT NULL,
	"seo_title" varchar(300),
	"summary" text NOT NULL,
	"meta_description" text,
	"content" text NOT NULL,
	"image_url" text NOT NULL,
	"keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"faq" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"foreign_players" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fixtures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"match_number" varchar(80) NOT NULL,
	"stage" "match_stage" DEFAULT 'league' NOT NULL,
	"team1_id" uuid,
	"team2_id" uuid,
	"team1_label" varchar(180) NOT NULL,
	"team2_label" varchar(180) NOT NULL,
	"scheduled_at" timestamp with time zone,
	"date_label" varchar(80) NOT NULL,
	"time_label" varchar(40) NOT NULL,
	"venue_id" uuid,
	"venue_label" varchar(240) NOT NULL,
	"venue_link" text,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_teams" (
	"match_id" uuid NOT NULL,
	"side" "match_side" NOT NULL,
	"team_id" uuid,
	"team_name" varchar(180) NOT NULL,
	"logo_url" text,
	"score" varchar(40),
	"runs" integer,
	"wickets" integer,
	"overs" numeric(5, 1),
	"target" integer,
	CONSTRAINT "match_teams_match_id_side_pk" PRIMARY KEY("match_id","side")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_id" integer,
	"external_id" varchar(180),
	"fixture_id" uuid,
	"season_id" uuid NOT NULL,
	"match_number" varchar(80) NOT NULL,
	"match_type" varchar(120),
	"stage" "match_stage" DEFAULT 'league' NOT NULL,
	"played_at" timestamp with time zone,
	"date_label" varchar(80) NOT NULL,
	"time_label" varchar(40) NOT NULL,
	"venue_id" uuid,
	"venue_label" varchar(240) NOT NULL,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"result" text,
	"winner_team_id" uuid,
	"winner_label" varchar(180),
	"keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"name" varchar(180) NOT NULL,
	"image_url" text,
	"player_link" text,
	"batting_style" varchar(40),
	"bowling_style" varchar(60),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "points_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"matches" integer DEFAULT 0 NOT NULL,
	"won" integer DEFAULT 0 NOT NULL,
	"lost" integer DEFAULT 0 NOT NULL,
	"tied" integer DEFAULT 0 NOT NULL,
	"no_result" integer DEFAULT 0 NOT NULL,
	"net_run_rate" numeric(8, 3) DEFAULT '0.000' NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"season_number" integer NOT NULL,
	"name" varchar(120) NOT NULL,
	"status" "season_status" DEFAULT 'draft' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"timezone" varchar(80) DEFAULT 'Asia/Kathmandu' NOT NULL,
	"fixtures_announced" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid,
	"player_id" uuid,
	"team_id" uuid,
	"category" "stat_category" NOT NULL,
	"rank" integer NOT NULL,
	"player_name" varchar(180) NOT NULL,
	"team_code" varchar(12) NOT NULL,
	"style" varchar(60),
	"innings" integer DEFAULT 0 NOT NULL,
	"runs" integer,
	"wickets" integer,
	"average" numeric(10, 2),
	"strike_rate" numeric(10, 2),
	"economy" numeric(10, 2),
	"image_url" text,
	"player_link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_aliases" (
	"team_id" uuid NOT NULL,
	"alias" varchar(160) NOT NULL,
	CONSTRAINT "team_aliases_team_id_alias_pk" PRIMARY KEY("team_id","alias")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(160) NOT NULL,
	"short_code" varchar(12),
	"logo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(180) NOT NULL,
	"name" varchar(240) NOT NULL,
	"link" text,
	"city" varchar(120),
	"timezone" varchar(80) DEFAULT 'Asia/Kathmandu' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_team1_id_teams_id_fk" FOREIGN KEY ("team1_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_team2_id_teams_id_fk" FOREIGN KEY ("team2_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_teams" ADD CONSTRAINT "match_teams_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_teams" ADD CONSTRAINT "match_teams_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_fixture_id_fixtures_id_fk" FOREIGN KEY ("fixture_id") REFERENCES "public"."fixtures"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_team_id_teams_id_fk" FOREIGN KEY ("winner_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_table" ADD CONSTRAINT "points_table_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_table" ADD CONSTRAINT "points_table_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_aliases" ADD CONSTRAINT "team_aliases_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_unique" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "news_articles_slug_unique" ON "news_articles" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "news_articles_legacy_id_unique" ON "news_articles" USING btree ("legacy_id");--> statement-breakpoint
CREATE INDEX "news_articles_status_published_idx" ON "news_articles" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "fixtures_season_number_unique" ON "fixtures" USING btree ("season_id","match_number");--> statement-breakpoint
CREATE INDEX "fixtures_scheduled_at_idx" ON "fixtures" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "match_teams_team_idx" ON "match_teams" USING btree ("team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "matches_season_number_unique" ON "matches" USING btree ("season_id","match_number");--> statement-breakpoint
CREATE UNIQUE INDEX "matches_external_id_unique" ON "matches" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "matches_status_played_idx" ON "matches" USING btree ("status","played_at");--> statement-breakpoint
CREATE UNIQUE INDEX "players_slug_unique" ON "players" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "points_season_team_unique" ON "points_table" USING btree ("season_id","team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "points_season_position_unique" ON "points_table" USING btree ("season_id","position");--> statement-breakpoint
CREATE INDEX "points_season_idx" ON "points_table" USING btree ("season_id");--> statement-breakpoint
CREATE UNIQUE INDEX "seasons_year_unique" ON "seasons" USING btree ("year");--> statement-breakpoint
CREATE UNIQUE INDEX "seasons_number_unique" ON "seasons" USING btree ("season_number");--> statement-breakpoint
CREATE UNIQUE INDEX "stats_category_season_rank_unique" ON "stats" USING btree ("category","season_id","rank");--> statement-breakpoint
CREATE INDEX "stats_category_idx" ON "stats" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "team_alias_unique" ON "team_aliases" USING btree ("alias");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_slug_unique" ON "teams" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_name_unique" ON "teams" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_short_code_unique" ON "teams" USING btree ("short_code");--> statement-breakpoint
CREATE UNIQUE INDEX "venues_slug_unique" ON "venues" USING btree ("slug");