# Inter de Marracos 2026

Aplicacio per gestionar l'Inter de Marracos 2026: fase de grups, eliminatories, resultats i estadistiques amb persistencia via API.

## Funcionalitats

- Fase de grups amb 7 grups de 4 equips
- Eliminatories amb 16ens, quarts, semifinals, 3r i 4t lloc i final
- Actualitzacio de resultats en temps real
- Persistencia de dades via API
- Vista compartida per a multiples usuaris

## Estructura

- `/src` - Aplicacio React
- `/server` - API Express per persistencia de dades

## Instal lacio

```bash
npm install
```

`npm install` ja instal·la també les dependencies de `server/`.

## Variables d'entorn

En desenvolupament local no cal cap `.env` si et van bé els valors per defecte.

Si necessites personalitzar ports o URLs, utilitza un fitxer `.env` o `.env.local` al root:

```bash
PORT=3001
VITE_PORT=5173
VITE_API_BASE_URL=
VITE_SITE_URL=
```

- `PORT` defineix el port de l'API Express.
- `VITE_PORT` defineix el port preferit del client Vite.
- `VITE_API_BASE_URL` buit fa servir rutes relatives (`/api`).
- `VITE_SITE_URL` només cal si vols forçar la URL pública de les metadades HTML.
- El backend també llegeix aquest mateix fitxer `.env`.

## Desenvolupament

```bash
npm run dev
```

Per defecte:

- l'API escolta al port `3001`
- el client prova `5173` i, si està ocupat, Vite fa servir el següent port lliure

Scripts útils:

- `npm run check` - lint + tests
- `npm run init:data` - reinicialitza les dades JSON del torneig

## API

- `GET /api/matches`
- `PUT /api/matches/:index`
- `GET /api/knockout`
- `PUT /api/knockout/:round/:index`
