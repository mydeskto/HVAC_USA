import { raw, Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { createFixture, deleteFixture, listFixtures, updateFixture } from "../services/fixtures.service.js";
import { importRows } from "../services/import.service.js";
import { createMatch, deleteMatch, listMatches, updateMatch } from "../services/matches.service.js";
import { MAX_MEDIA_BYTES, saveImageUpload } from "../services/media.service.js";
import { getAdminMetadata } from "../services/meta.service.js";
import { createNews, deleteNews, listNews, updateNews } from "../services/news.service.js";
import { createPlayer, deletePlayer, listAdminPlayers, updatePlayer } from "../services/players.service.js";
import { createPoint, deletePoint, listPoints, updatePoint } from "../services/points.service.js";
import { createStat, deleteStat, listStats, updateStat } from "../services/stats.service.js";
import { createTeam, deleteTeam, listTeams, updateTeam } from "../services/teams.service.js";
import { createVenue, deleteVenue, listVenues, updateVenue } from "../services/venues.service.js";
import { importRequestSchema, playerAggregateCreateSchema, playerAggregateUpdateSchema, teamCreateSchema, teamUpdateSchema, venueCreateSchema, venueUpdateSchema } from "../validation/platform.js";
import { fixtureCreateSchema, fixtureUpdateSchema, matchCreateSchema, matchUpdateSchema, newsCreateSchema, newsUpdateSchema, pointsCreateSchema, pointsUpdateSchema, statCreateSchema, statUpdateSchema } from "../validation/resources.js";
import { parseOptionalYear, parseUuid } from "../validation/request.js";

export const adminRouter = Router();
adminRouter.use(requireAuth);

const sendCreated = (response: import("express").Response, data: unknown) => response.status(201).json({ data });
const sendDeleted = (response: import("express").Response) => response.status(204).send();

adminRouter.get("/meta", async (_request, response) => response.json({ data: await getAdminMetadata() }));

adminRouter.post("/media", raw({ type: () => true, limit: MAX_MEDIA_BYTES }), async (request, response) => {
  const filename = typeof request.query.filename === "string" ? request.query.filename : undefined;
  response.status(201).json({ data: await saveImageUpload(request.body, filename, request.get("content-type")) });
});
adminRouter.post("/imports", validateBody(importRequestSchema), async (request, response) => {
  response.json({ data: await importRows(request.body, request.auth!.userId) });
});

adminRouter.get("/teams", async (_request, response) => response.json({ data: await listTeams(true) }));
adminRouter.post("/teams", validateBody(teamCreateSchema), async (request, response) => sendCreated(response, await createTeam(request.body)));
adminRouter.patch("/teams/:id", validateBody(teamUpdateSchema), async (request, response) => response.json({ data: await updateTeam(parseUuid(request.params.id!), request.body) }));
adminRouter.delete("/teams/:id", async (request, response) => { await deleteTeam(parseUuid(request.params.id!)); sendDeleted(response); });

adminRouter.get("/venues", async (_request, response) => response.json({ data: await listVenues(true) }));
adminRouter.post("/venues", validateBody(venueCreateSchema), async (request, response) => sendCreated(response, await createVenue(request.body)));
adminRouter.patch("/venues/:id", validateBody(venueUpdateSchema), async (request, response) => response.json({ data: await updateVenue(parseUuid(request.params.id!), request.body) }));
adminRouter.delete("/venues/:id", async (request, response) => { await deleteVenue(parseUuid(request.params.id!)); sendDeleted(response); });

adminRouter.get("/players", async (_request, response) => response.json({ data: await listAdminPlayers() }));
adminRouter.post("/players", validateBody(playerAggregateCreateSchema), async (request, response) => sendCreated(response, await createPlayer(request.body)));
adminRouter.patch("/players/:id", validateBody(playerAggregateUpdateSchema), async (request, response) => response.json({ data: await updatePlayer(parseUuid(request.params.id!), request.body) }));
adminRouter.delete("/players/:id", async (request, response) => { await deletePlayer(parseUuid(request.params.id!)); sendDeleted(response); });

adminRouter.get("/news", async (_request, response) => response.json({ data: await listNews(true) }));
adminRouter.post("/news", validateBody(newsCreateSchema), async (request, response) => sendCreated(response, await createNews(request.body, request.auth!.userId)));
adminRouter.patch("/news/:id", validateBody(newsUpdateSchema), async (request, response) => response.json({ data: await updateNews(parseUuid(request.params.id!), request.body, request.auth!.userId) }));
adminRouter.delete("/news/:id", async (request, response) => { await deleteNews(parseUuid(request.params.id!)); sendDeleted(response); });

adminRouter.get("/points", async (request, response) => response.json({ data: await listPoints(parseOptionalYear(request.query.season)) }));
adminRouter.post("/points", validateBody(pointsCreateSchema), async (request, response) => sendCreated(response, await createPoint(request.body)));
adminRouter.patch("/points/:id", validateBody(pointsUpdateSchema), async (request, response) => response.json({ data: await updatePoint(parseUuid(request.params.id!), request.body) }));
adminRouter.delete("/points/:id", async (request, response) => { await deletePoint(parseUuid(request.params.id!)); sendDeleted(response); });

adminRouter.get("/fixtures", async (request, response) => response.json({ data: await listFixtures(parseOptionalYear(request.query.season), true) }));
adminRouter.post("/fixtures", validateBody(fixtureCreateSchema), async (request, response) => sendCreated(response, await createFixture(request.body)));
adminRouter.patch("/fixtures/:id", validateBody(fixtureUpdateSchema), async (request, response) => response.json({ data: await updateFixture(parseUuid(request.params.id!), request.body) }));
adminRouter.delete("/fixtures/:id", async (request, response) => { await deleteFixture(parseUuid(request.params.id!)); sendDeleted(response); });

adminRouter.get("/matches", async (request, response) => response.json({ data: await listMatches(parseOptionalYear(request.query.season)) }));
adminRouter.post("/matches", validateBody(matchCreateSchema), async (request, response) => sendCreated(response, await createMatch(request.body)));
adminRouter.patch("/matches/:id", validateBody(matchUpdateSchema), async (request, response) => response.json({ data: await updateMatch(parseUuid(request.params.id!), request.body) }));
adminRouter.delete("/matches/:id", async (request, response) => { await deleteMatch(parseUuid(request.params.id!)); sendDeleted(response); });

adminRouter.get("/stats", async (request, response) => response.json({ data: await listStats(parseOptionalYear(request.query.season)) }));
adminRouter.post("/stats", validateBody(statCreateSchema), async (request, response) => sendCreated(response, await createStat(request.body)));
adminRouter.patch("/stats/:id", validateBody(statUpdateSchema), async (request, response) => response.json({ data: await updateStat(parseUuid(request.params.id!), request.body) }));
adminRouter.delete("/stats/:id", async (request, response) => { await deleteStat(parseUuid(request.params.id!)); sendDeleted(response); });
