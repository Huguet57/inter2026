# Inter de Marracos 2026

Aplicacio per gestionar l'Inter de Marracos 2026: fase de grups, eliminatories, resultats i estadistiques amb frontend React/Vite i backend serverless a Cloudflare Pages Functions + D1.

## Estructura

- `/src` - Aplicacio React
- `/functions` - API serverless de Cloudflare Pages Functions
- `/d1` - migracions i seeds SQL per la base de dades
- `/server/data` - backup/import legacy del torneig en JSON

## Instal lacio

```bash
npm install
```

## Variables d'entorn

En local no cal cap `.env` si et van bé els valors per defecte.

Si necessites personalitzar ports o URLs, utilitza un fitxer `.env` o `.env.local` al root:

```bash
PORT=8788
VITE_PORT=5173
VITE_API_BASE_URL=
VITE_SITE_URL=https://inter-2026.pages.dev
```

- `PORT` defineix el port local del runtime de `wrangler pages dev` al qual Vite farà proxy de `/api`.
- `VITE_PORT` defineix el port preferit del client Vite.
- `VITE_API_BASE_URL` buit fa servir rutes relatives (`/api`), que és el comportament recomanat en producció.
- `VITE_SITE_URL` només cal si vols forçar una URL pública diferent de la que surt per defecte a la build.

## Desenvolupament

```bash
npm run dev
```

Per defecte:

- el client arrenca a `http://localhost:5173`
- el runtime local de Pages Functions + D1 arrenca a `http://localhost:8788`
- Vite fa proxy de `/api` cap a `8788`

Scripts útils:

- `npm run check` - lint + tests
- `npm run d1:migrate:local` - aplica l'esquema D1 local
- `npm run d1:seed:current:local` - genera el seed des de `server/data/*.json` i el carrega a D1 local
- `npm run init:data` - regenera `d1/seed-base.sql` des de `src/data/tournament.ts`
- `npm run deploy` - build i deploy a `inter-2026.pages.dev`

## Deploy Cloudflare

El projecte ja està preparat per Cloudflare Pages i D1 amb `wrangler.jsonc`.

Flux habitual:

```bash
npx wrangler login
npx wrangler pages project create inter-2026 --production-branch main
npx wrangler d1 create inter-2026-prod --location weur --binding DB --update-config
npx wrangler pages secret put REFEREE_PASSWORD --project-name inter-2026
npx wrangler pages secret put SESSION_SECRET --project-name inter-2026
npm run d1:migrate:remote
npm run d1:seed:current:remote
npm run deploy
```

Documentació més detallada a [CLOUDFLARE_PAGES_DEPLOYMENT.md](./CLOUDFLARE_PAGES_DEPLOYMENT.md).

## API

- `GET /api/health`
- `GET /api/matches`
- `PUT /api/matches/:index`
- `GET /api/knockout`
- `PUT /api/knockout/:round/:index`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
