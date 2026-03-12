# GitHub Actions Workflow for Tournament App

This folder contains GitHub Actions workflows that automate the deployment of the Tournament App to GitHub Pages.

## Workflows

### Deploy to GitHub Pages (`deploy.yml`)

This workflow automatically deploys the React application to GitHub Pages whenever changes are pushed to the main branch.

The workflow:
1. Checks out the code
2. Sets up Node.js
3. Installs dependencies
4. Builds the project
5. Deploys to the gh-pages branch

## Manual Deployment

If you prefer to deploy manually instead of using GitHub Actions:

1. Make your changes to the codebase
2. Run `npm run deploy` locally
   - This will build the app and push to the `gh-pages` branch

## Troubleshooting

If the deployment fails:

1. Check the GitHub Actions logs for errors
2. Verify that the repository has GitHub Pages enabled in Settings
3. Make sure the deployment token has the correct permissions
4. Check that the base path in `vite.config.ts` matches the repository name

## Notes

- The app is configured to be deployed at: https://inter2025.tenimaleta.com
- Make sure to update `package.json` and `vite.config.ts` if the repository name changes 