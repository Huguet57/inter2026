# AGENTS

## Objectiu

Aquest repo conté:

- `src/`: frontend React + Vite
- `server/`: API Express que persisteix dades a JSON dins `server/data/`

## Flux local

- `npm install`: instal·la el frontend i també `server/` via `postinstall`
- `npm run dev`: aixeca client i API a la vegada
- `npm run check`: executa `lint` i `test`
- `npm run init:data`: recrea les dades inicials del torneig

Per defecte:

- client a `http://localhost:5173`
- API a `http://localhost:3001`
- si `5173` està ocupat, Vite provarà el següent port lliure

## Variables d'entorn

El projecte accepta un únic `.env` o `.env.local` al root. El backend també el llegeix.

Variables útils:

- `PORT`: port de l'API Express
- `VITE_PORT`: port preferit del client Vite
- `VITE_API_BASE_URL`: origen absolut de l'API si frontend i backend no comparteixen host
- `VITE_SITE_URL`: URL pública usada per a metadades socials

Per desenvolupament local no cal cap `.env` si es fan servir els valors per defecte.

## Dades i persistència

- No eliminis `server/data/matches.json` ni `server/data/knockout.json` tret que el canvi ho demani explícitament.
- Si cal regenerar dades, fes servir `npm run init:data` en lloc d'editar fitxers manualment.

## Convencions de canvi

- Per canvis llargs, intenta començar per tests.
- No reverteixis canvis d'usuari que no formin part de la tasca.
- Quan busquis fitxers o text, prefereix `rg`.
- Si canvies scripts, ports o entorn, actualitza també `README.md` i `.env.example`.
