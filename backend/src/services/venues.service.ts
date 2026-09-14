import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { venues } from "../db/schema/index.js";
import type { VenueInput } from "../validation/platform.js";
import { notFound } from "../utils/app-error.js";
import { sanitizeArticleHtml } from "../utils/sanitize-article.js";

function clean<T extends Partial<VenueInput>>(input: T): T {
  return {
    ...input,
    ...(input.description !== undefined ? { description: input.description == null ? null : sanitizeArticleHtml(input.description) } : {}),
    ...(input.pitchDescription !== undefined ? { pitchDescription: input.pitchDescription == null ? null : sanitizeArticleHtml(input.pitchDescription) } : {}),
  };
}

export async function listVenues(includeInactive = false) {
  return db.select().from(venues)
    .where(includeInactive ? undefined : eq(venues.isActive, true))
    .orderBy(asc(venues.name));
}

export async function getVenueBySlug(slug: string, includeInactive = false) {
  const [row] = await db.select().from(venues).where(eq(venues.slug, slug)).limit(1);
  if (!row || (!includeInactive && !row.isActive)) notFound("Venue");
  return row;
}

export async function createVenue(input: VenueInput) {
  const [row] = await db.insert(venues).values(clean(input)).returning();
  return row!;
}

export async function updateVenue(id: string, input: Partial<VenueInput>) {
  const [row] = await db.update(venues).set({ ...clean(input), updatedAt: new Date() }).where(eq(venues.id, id)).returning();
  if (!row) notFound("Venue");
  return row;
}

export async function deleteVenue(id: string) {
  const [row] = await db.delete(venues).where(eq(venues.id, id)).returning({ id: venues.id });
  if (!row) notFound("Venue");
}
