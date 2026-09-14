import { migrate } from "drizzle-orm/node-postgres/migrator";
import { closeDatabase, db } from "./index.js";

try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Database migrations completed.");
} finally {
  await closeDatabase();
}
