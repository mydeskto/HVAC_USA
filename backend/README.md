# NPL API and Admin Backend

Express 5 + PostgreSQL + Drizzle backend for news, standings, fixtures, match results, player statistics, and superadmin authentication.

## Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer
- The frontend normally runs at `http://localhost:3000`
- The API normally runs at `http://localhost:3001`

## 1. Configure PostgreSQL

Create an empty database, for example:

```sql
CREATE DATABASE nplt20league;
```

Copy `.env.example` to `.env` and update at minimum:

```env
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/nplt20league
FRONTEND_ORIGINS=http://localhost:3000
```

Do not commit `.env`. `SESSION_TTL_HOURS` cannot exceed 24. For production on separate sites, HTTPS is required and you may need `COOKIE_SAME_SITE=none`; for the preferred same-site deployment, keep `lax`.

## 2. Install and initialize

```powershell
npm install
npm run db:setup
```

`db:setup` performs these steps in order:

1. Applies SQL migrations from `drizzle/`.
2. Creates the superadmin only if its email does not already exist.
3. Imports/upserts existing frontend news, standings, 2025 matches, 2026 draft fixtures, teams, venue, players, and statistics.

### Superadmin credentials

Set these before running the seed if you want a chosen credential:

```env
SUPERADMIN_NAME=NPL Super Admin
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=replace-with-16-plus-mixed-case-number-symbol-unique-password
```

If `SUPERADMIN_PASSWORD` is empty, `npm run db:seed:admin` generates a cryptographically random strong password and prints it once. Store it immediately. Re-running the command does not replace or print credentials for an existing user.

## 3. Run

```powershell
npm run dev
```

For production:

```powershell
npm run build
npm start
```

Open the frontend login page at `http://localhost:3000/admin/login/`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with TypeScript watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run typecheck` | Validate TypeScript without emitting |
| `npm run db:generate` | Generate a migration after schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed:admin` | Idempotently create the superadmin |
| `npm run db:seed:data` | Idempotently import frontend data |
| `npm run db:setup` | Migrate and run both seeds |
| `npm run db:studio` | Open Drizzle Studio |

## API

Public read endpoints:

- `GET /health`
- `GET /api/v1/news`
- `GET /api/v1/news/:slug`
- `GET /api/v1/points?season=2026`
- `GET /api/v1/fixtures?season=2026`
- `GET /api/v1/matches?season=2025`
- `GET /api/v1/stats?season=2025&category=top_run_scorer`

Authentication:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

Authenticated superadmin CRUD:

- `/api/v1/admin/news`
- `/api/v1/admin/points`
- `/api/v1/admin/fixtures`
- `/api/v1/admin/matches`
- `/api/v1/admin/stats`
- `GET /api/v1/admin/meta` for season/team/player/venue IDs

Each resource supports `GET`, `POST`, `PATCH /:id`, and `DELETE /:id`. Browser requests must include credentials.

## Authentication and security model

- Passwords are hashed using Argon2id.
- Login creates a random 256-bit opaque token.
- Only the token's SHA-256 hash is stored in PostgreSQL.
- The raw token is sent only in an HttpOnly cookie.
- Sessions expire server-side after at most 24 hours; expiry removes access even if a browser retains an old cookie.
- Logout revokes the database session and clears the cookie.
- Login is rate-limited to five failed attempts per 15 minutes.
- Mutations validate their Origin against `FRONTEND_ORIGINS`.
- Every admin mutation is authorized by the API; frontend route hiding is not treated as security.
- News HTML is sanitized before storage.

## Public-site data integration

The website and admin console both use the live Express API. Frontend HTTP transport is centralized in `frontend/lib/apirequest.ts`; `frontend/lib/platform-api.ts` maps public endpoint DTOs for news, standings, fixtures, matches, and statistics, and `frontend/lib/admin-api.ts` adds credentialed admin behavior.

Because public news slugs and metadata are resolved at runtime, the frontend must be deployed as a server-capable Next.js application. Static-only hosting and `output: "export"` are not supported. Set `NEXT_PUBLIC_API_BASE_URL` in the frontend deployment to this API's public `/api/v1` URL.

## Deployment notes

Deploy the frontend and API under the same registrable domain when possible (for example `www.example.com` and `api.example.com`). Use HTTPS in production. Set `FRONTEND_ORIGINS` to exact comma-separated origins; never use `*` with credentialed cookies. If behind a trusted reverse proxy, set `TRUST_PROXY=true`.

Back up PostgreSQL before destructive admin operations. The admin dashboard asks for confirmation, but deletes are permanent.
