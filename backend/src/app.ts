import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { sql } from "drizzle-orm";
import { env } from "./config/env.js";
import { db } from "./db/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { requireTrustedOrigin } from "./middleware/origin.js";
import { adminRouter } from "./routes/admin.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { publicRouter } from "./routes/public.routes.js";
import { isSafeMediaRequestPath, mediaMountPath, uploadsDirectory } from "./services/media.service.js";
import { AppError } from "./utils/app-error.js";

export const app = express();

if (env.TRUST_PROXY) app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || env.frontendOrigins.includes(origin)) return callback(null, true);
    callback(new AppError(403, "Origin is not allowed", "CORS_REJECTED"));
  },
}));
app.use(mediaMountPath(), (request, response, next) => {
  if (!isSafeMediaRequestPath(request.path)) {
    response.status(404).json({ error: { code: "MEDIA_NOT_FOUND", message: "Media file was not found" } });
    return;
  }
  next();
}, express.static(uploadsDirectory(), {
  dotfiles: "deny",
  fallthrough: true,
  index: false,
  maxAge: env.isProduction ? "7d" : 0,
  redirect: false,
}));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(requireTrustedOrigin);

app.get("/health", async (_request, response) => {
  await db.execute(sql`select 1`);
  response.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1", publicRouter);
app.use(notFoundHandler);
app.use(errorHandler);
