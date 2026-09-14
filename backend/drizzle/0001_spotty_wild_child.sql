CREATE TYPE "public"."membership_status" AS ENUM('retained', 'auction', 'other');--> statement-breakpoint
CREATE TABLE "player_aliases" (
	"player_id" uuid NOT NULL,
	"alias" varchar(180) NOT NULL,
	CONSTRAINT "player_aliases_player_id_alias_pk" PRIMARY KEY("player_id","alias")
);
--> statement-breakpoint
CREATE TABLE "player_profiles" (
	"player_id" uuid PRIMARY KEY NOT NULL,
	"profile_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"rich_content" text,
	"ad_units" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"role" varchar(160) NOT NULL,
	"status" "membership_status" DEFAULT 'other' NOT NULL,
	"auction_price" varchar(80),
	"is_marquee" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "captain" varchar(180);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "coach" varchar(180);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "owner" varchar(240);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "championships" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "venue_name" varchar(240);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "venue_link" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "intro_content" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "after_players_content" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "faqs" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "player_aliases" ADD CONSTRAINT "player_aliases_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "player_alias_unique" ON "player_aliases" USING btree ("alias");--> statement-breakpoint
CREATE UNIQUE INDEX "team_memberships_season_player_unique" ON "team_memberships" USING btree ("season_id","player_id");--> statement-breakpoint
CREATE INDEX "team_memberships_team_season_idx" ON "team_memberships" USING btree ("team_id","season_id");