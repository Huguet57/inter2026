# Deploying Inter de Marracos 2026 to GitHub Pages

This guide walks through deploying the Inter de Marracos 2026 client to GitHub Pages.

## Prerequisites

- A GitHub repository for `inter-2026`
- Git installed locally
- Node.js and npm installed locally

## Push the project

```bash
git init
git remote add origin https://github.com/tenimaleta/inter-2026.git
git add .
git commit -m "Initial commit for Inter de Marracos 2026"
git push -u origin main
```

## Configure Pages

1. Open your repository on GitHub.
2. Go to `Settings > Pages`.
3. Set the source to `GitHub Actions`.

## Deploy

```bash
npm install
npm run deploy
```

Set `VITE_SITE_URL` to your public GitHub Pages URL before deploying.

## Notes

- GitHub Pages only serves the static client.
- The API must be hosted separately.
- Keep `VITE_API_BASE_URL` aligned with your deployed API.
