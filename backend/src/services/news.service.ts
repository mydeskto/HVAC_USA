import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { newsArticles } from "../db/schema/index.js";
import { notFound } from "../utils/app-error.js";
import { sanitizeArticleHtml } from "../utils/sanitize-article.js";

function clean<T extends { content?: string }>(data: T): T {
  return data.content ? { ...data, content: sanitizeArticleHtml(data.content) } : data;
}

export async function listNews(includeUnpublished = false) {
  return db.select().from(newsArticles)
    .where(includeUnpublished ? undefined : eq(newsArticles.status, "published"))
    .orderBy(desc(newsArticles.publishedAt), desc(newsArticles.createdAt));
}

export async function getNewsBySlug(slug: string, includeUnpublished = false) {
  const where = includeUnpublished ? eq(newsArticles.slug, slug) : and(eq(newsArticles.slug, slug), eq(newsArticles.status, "published"));
  const [article] = await db.select().from(newsArticles).where(where).limit(1);
  if (!article) notFound("News article");
  return article;
}

export async function createNews(input: typeof newsArticles.$inferInsert, userId: string) {
  const [article] = await db.insert(newsArticles).values({ ...clean(input), createdBy: userId, updatedBy: userId }).returning();
  return article!;
}

export async function updateNews(id: string, input: Partial<typeof newsArticles.$inferInsert>, userId: string) {
  const [article] = await db.update(newsArticles).set({ ...clean(input), updatedBy: userId, updatedAt: new Date() }).where(eq(newsArticles.id, id)).returning();
  if (!article) notFound("News article");
  return article;
}

export async function deleteNews(id: string) {
  const [article] = await db.delete(newsArticles).where(eq(newsArticles.id, id)).returning({ id: newsArticles.id });
  if (!article) notFound("News article");
}
