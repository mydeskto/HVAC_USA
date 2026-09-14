import { Router } from "express";
import { listFixtures } from "../services/fixtures.service.js";
import { listMatches } from "../services/matches.service.js";
import { getNewsBySlug, listNews } from "../services/news.service.js";
import { getPublicPlayerBySlug, listPublicPlayers } from "../services/players.service.js";
import { listPoints } from "../services/points.service.js";
import { listStats } from "../services/stats.service.js";
import { getTeamBySlug, listTeams } from "../services/teams.service.js";
import { getVenueBySlug, listVenues } from "../services/venues.service.js";
import { parseOptionalSearch, parseOptionalSlug, parseOptionalStatCategory, parseOptionalYear } from "../validation/request.js";

export const publicRouter = Router();

publicRouter.get("/teams", async (_request, response) => response.json({ data: await listTeams(false) }));
publicRouter.get("/teams/:slug", async (request, response) => response.json({
  data: await getTeamBySlug(parseOptionalSlug(request.params.slug)!, false, parseOptionalYear(request.query.season)),
}));
publicRouter.get("/players", async (request, response) => response.json({
  data: await listPublicPlayers({
    ...(parseOptionalSlug(request.query.team) !== undefined ? { team: parseOptionalSlug(request.query.team)! } : {}),
    ...(parseOptionalYear(request.query.season) !== undefined ? { year: parseOptionalYear(request.query.season)! } : {}),
    ...(parseOptionalSearch(request.query.q) !== undefined ? { q: parseOptionalSearch(request.query.q)! } : {}),
  }),
}));
publicRouter.get("/players/:slug", async (request, response) => response.json({
  data: await getPublicPlayerBySlug(parseOptionalSlug(request.params.slug)!, parseOptionalYear(request.query.season)),
}));
publicRouter.get("/venues", async (_request, response) => response.json({ data: await listVenues(false) }));
publicRouter.get("/venues/:slug", async (request, response) => response.json({ data: await getVenueBySlug(parseOptionalSlug(request.params.slug)!, false) }));
publicRouter.get("/news", async (_request, response) => response.json({ data: await listNews(false) }));
publicRouter.get("/news/:slug", async (request, response) => response.json({ data: await getNewsBySlug(request.params.slug!, false) }));
publicRouter.get("/points", async (request, response) => response.json({ data: await listPoints(parseOptionalYear(request.query.season)) }));
publicRouter.get("/fixtures", async (request, response) => response.json({ data: await listFixtures(parseOptionalYear(request.query.season), false) }));
publicRouter.get("/matches", async (request, response) => response.json({ data: await listMatches(parseOptionalYear(request.query.season)) }));
publicRouter.get("/stats", async (request, response) => {
  const category = parseOptionalStatCategory(request.query.category);
  response.json({ data: await listStats(parseOptionalYear(request.query.season), category) });
});
