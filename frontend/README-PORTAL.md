# Performance Agent Portal (Next.js + Vercel)

## Prereqs
- Node.js **18.18+**
- A Postgres database (Vercel Postgres / Neon / Supabase)

## Environment variables
Copy `.env.example` to `.env` for local dev:

- `DATABASE_URL`: Postgres connection string
- `PORTAL_INGEST_TOKEN`: shared secret used by GitHub Actions to ingest runs

On Vercel, set these in **Project → Settings → Environment Variables**.

## Database
This repo includes an initial SQL migration at `prisma/migrations/0001_init.sql`.

### Option A (recommended): Prisma migrations
After setting `DATABASE_URL`:

```bash
cd frontend
npm run prisma:deploy
```

### Option B: Apply SQL manually
Run the SQL in `prisma/migrations/0001_init.sql` in your DB console.

## Run locally

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

## Ingest API
Endpoint: `POST /api/ingest/run`

Auth header:
- `Authorization: Bearer $PORTAL_INGEST_TOKEN`

The payload shape is validated; see `src/lib/ingestSchema.ts`.

