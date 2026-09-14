import { asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { players, seasons, teams, venues } from "../db/schema/index.js";

export async function getAdminMetadata() {
  const [seasonRows, teamRows, playerRows, venueRows] = await Promise.all([
    db.select().from(seasons).orderBy(asc(seasons.year)),
    db.select().from(teams).orderBy(asc(teams.name)),
    db.select().from(players).orderBy(asc(players.name)),
    db.select().from(venues).orderBy(asc(venues.name)),
  ]);
  return { seasons: seasonRows, teams: teamRows, players: playerRows, venues: venueRows };
}
