# Deploying Inter de Marracos 2026 to Cloudflare Pages

This guide walks through deploying Inter de Marracos 2026 to Cloudflare Pages + D1.

## Prerequisites

- A GitHub repository for `inter-2026`
- Git installed locally
- Node.js and npm installed locally

## Authenticate Wrangler

```bash
npx wrangler login
```

## Create the Pages project and D1 database

```bash
npx wrangler pages project create inter-2026 --production-branch main
npx wrangler d1 create inter-2026-prod --location weur --binding DB --update-config
```

## Configure secrets

```bash
npx wrangler pages secret put REFEREE_PASSWORD --project-name inter-2026
npx wrangler pages secret put SESSION_SECRET --project-name inter-2026
```

`REFEREE_PASSWORD` is the password used by the referee login screen.
`SESSION_SECRET` should be a long random value.

## Apply schema and seed data

```bash
npm run d1:migrate:remote
npm run d1:seed:current:remote
```

## Deploy

```bash
npm install
npm run deploy
```

The production deployment is published at `https://inter-2026.pages.dev`.
If you need a different public URL for metadata, override it with `VITE_SITE_URL`.

## Notes

- Local development uses `npm run dev`, which starts Vite on `5173` and `wrangler pages dev` on `8788`.
- The deployed site serves frontend and API from the same origin, so production should keep `VITE_API_BASE_URL` empty.
- The repo keeps `server/data/*.json` as a backup/import source for the D1 seeds.
