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
npm --prefix server install
```

## Variables d'entorn

Utilitza un fitxer `.env` o `.env.local` amb aquestes variables:

```bash
VITE_API_BASE_URL=
VITE_SITE_URL=http://localhost:5173
```

- `VITE_API_BASE_URL` buit fa servir rutes relatives (`/api`).
- `VITE_SITE_URL` s'utilitza a les metadades HTML.

## Desenvolupament

```bash
npm run dev:server
npm run dev:client
```

L'API escolta al port `3001` i el client al port `5173`.

## API

- `GET /api/matches`
- `PUT /api/matches/:index`
- `GET /api/knockout`
- `PUT /api/knockout/:round/:index`
