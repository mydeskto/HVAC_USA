import { app } from "./app.js";
import { env } from "./config/env.js";
import { closeDatabase } from "./db/index.js";

const server = app.listen(env.PORT, () => {
  console.log(`NPL API listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received; shutting down gracefully.`);
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
