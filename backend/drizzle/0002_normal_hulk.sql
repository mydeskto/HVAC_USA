ALTER TABLE "venues" ADD COLUMN "alternate_name" varchar(240);--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "location" varchar(300);--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "capacity" integer;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "established" integer;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "owner" varchar(240);--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "operator" varchar(240);--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "pitch_type" varchar(240);--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "home_team" varchar(300);--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "pitch_description" text;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "map_embed" text;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "keywords" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "address" jsonb;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "overview_rows" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "format_stats" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;