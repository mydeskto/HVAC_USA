import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";

export type ArticleFaq = { question: string; answer: string };
export type ForeignPlayerGroup = { team: string; teamLink?: string; players: string };

export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "published",
  "archived",
]);

export const newsArticles = pgTable(
  "news_articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    legacyId: integer("legacy_id"),
    slug: varchar("slug", { length: 220 }).notNull(),
    title: varchar("title", { length: 300 }).notNull(),
    seoTitle: varchar("seo_title", { length: 300 }),
    summary: text("summary").notNull(),
    metaDescription: text("meta_description"),
    content: text("content").notNull(),
    imageUrl: text("image_url").notNull(),
    keywords: jsonb("keywords").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    faq: jsonb("faq").$type<ArticleFaq[]>().notNull().default(sql`'[]'::jsonb`),
    foreignPlayers: jsonb("foreign_players")
      .$type<ForeignPlayerGroup[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    status: articleStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("news_articles_slug_unique").on(table.slug),
    uniqueIndex("news_articles_legacy_id_unique").on(table.legacyId),
    index("news_articles_status_published_idx").on(table.status, table.publishedAt),
  ],
);
