# Handpick Production Deployment (Vercel + Supabase)

## 1) Supabase Setup

1. Create a Supabase project.
2. Open **Project Settings -> Database** and copy the **connection string**.
3. Use the connection in this format:

```env
SUPABASE_DATABASE_URL=postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres
```

## 2) Environment Variables

Set these in Vercel (**Project -> Settings -> Environment Variables**):

- `SUPABASE_DATABASE_URL` (required)
- `JWT_SECRET` (required, long random secret)
- `VITE_APP_ID` (required for OAuth mode)
- `OAUTH_SERVER_URL` (required for OAuth mode)
- `VITE_OAUTH_PORTAL_URL` (required for OAuth mode)
- `OWNER_OPEN_ID` (optional, recommended)
- `DEV_AUTH_BYPASS` (`true` for temporary bypass, `false` for real auth)
- `NODE_ENV=production`

Optional:
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`
- `VITE_ANALYTICS_ENDPOINT`
- `VITE_ANALYTICS_WEBSITE_ID`

Never commit real secrets to Git.

## 3) Database Migration

Run migrations against Supabase from your machine:

```bash
pnpm db:push
```

Seed sample products if needed:

```bash
node seed.mjs
```

## 4) Vercel Deployment

1. Push repository to GitHub.
2. Import the repo into Vercel.
3. Vercel will use:
   - `vercel.json` for routes/functions
   - `pnpm build:client` as frontend build command
   - `dist/public` as static output
4. Add all env vars in Vercel settings.
5. Trigger deploy.

## 5) Routing Model

- Frontend SPA served from static build output.
- Backend API served by serverless function at `api/index.ts`.
- tRPC endpoint: `/api/trpc`
- Health endpoint: `/api/health`
- Database health endpoint: `/api/health/db`

## 6) Temporary Auth Bypass (for fast launch)

Set:

```env
DEV_AUTH_BYPASS=true
```

This makes protected admin routes accessible via a local injected admin context when no OAuth user exists.
Turn it off in production when real auth is ready:

```env
DEV_AUTH_BYPASS=false
```

## 7) Post-Deploy Readiness Check

After deployment, run:

```bash
APP_URL=https://your-app.vercel.app pnpm verify:prod
```

This validates:
- API process is alive (`/api/health`)
- Supabase connection works (`/api/health/db`)
