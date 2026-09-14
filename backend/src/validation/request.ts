import { z } from "zod";

const yearSchema = z.coerce.number().int().min(2020).max(2100);
const uuidSchema = z.uuid();
const statCategorySchema = z.enum([
  "top_run_scorer",
  "top_wicket_taker",
  "batting_strike_rate",
  "bowling_economy",
]);
const slugSchema = z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const searchSchema = z.string().trim().min(1).max(180);

export function parseOptionalYear(value: unknown): number | undefined {
  return value === undefined ? undefined : yearSchema.parse(value);
}

export function parseUuid(value: string | string[]): string {
  return uuidSchema.parse(Array.isArray(value) ? value[0] : value);
}

export function parseOptionalStatCategory(value: unknown) {
  return value === undefined ? undefined : statCategorySchema.parse(value);
}

export function parseOptionalSlug(value: unknown): string | undefined {
  return value === undefined ? undefined : slugSchema.parse(value);
}

export function parseOptionalSearch(value: unknown): string | undefined {
  return value === undefined ? undefined : searchSchema.parse(value);
}
