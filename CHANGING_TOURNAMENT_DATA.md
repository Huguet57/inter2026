# Changing Tournament Data

This guide explains the different methods for modifying tournament data, either by directly editing data files or using the API endpoints.

## Understanding the Data Structure

The tournament application uses two main data files:

- `server/data/matches.json` - Contains all group stage matches
- `server/data/knockout.json` - Contains all knockout stage matches (quarterfinals, semifinals, final, and third place)

These files are initialized by the `initData.js` script, which extracts data from the front-end application's `tournament.ts` file.

## Method 1: Modifying Data Files Directly

### Prerequisites

- SSH access to the server (if modifying on the server)
- Basic knowledge of JSON formatting

### Step 1: Back Up the Current Data

Always create a backup before making changes:

```bash
# Connect to your server
ssh root@demo-api.tenimaleta.com

# Navigate to the data directory
cd /var/www/torneig-api/server/data

# Create backups with date stamps
cp matches.json matches.json.backup.$(date +%Y%m%d)
cp knockout.json knockout.json.backup.$(date +%Y%m%d)
```

### Step 2: Edit the Data Files

You can edit the files directly on the server:

```bash
# Edit group matches
nano matches.json

# Edit knockout matches
nano knockout.json
```

Or download them to your local machine, edit them, and upload them back:

```bash
# From your local machine, download the files
scp root@demo-api.tenimaleta.com:/var/www/torneig-api/server/data/matches.json ./
scp root@demo-api.tenimaleta.com:/var/www/torneig-api/server/data/knockout.json ./

# Edit them locally with your preferred editor

# Upload them back to the server
scp ./matches.json root@demo-api.tenimaleta.com:/var/www/torneig-api/server/data/
scp ./knockout.json root@demo-api.tenimaleta.com:/var/www/torneig-api/server/data/
```

### Group Matches Format

Each group match in `matches.json` has the following structure:

```json
{
  "id": "unique-id",
  "team1": "Team Name 1",
  "team2": "Team Name 2",
  "group": "A",
  "isPlaying": false,
  "score1": null,
  "score2": null,
  "date": "2026-06-14T20:00:00Z"
}
```

### Knockout Matches Format

The `knockout.json` file has the following structure:

```json
{
  "quarterfinals": [
    {
      "id": "qf1",
      "team1": "Winner Group A",
      "team2": "Runner-up Group B",
      "isPlaying": false,
      "score1": null,
      "score2": null,
      "date": "2026-06-28T16:00:00Z"
    },
    // More quarterfinal matches...
  ],
  "semifinals": [
    // Semifinal matches...
  ],
  "thirdPlace": {
    "id": "third",
    "team1": "Loser SF1",
    "team2": "Loser SF2",
    "isPlaying": false,
    "score1": null,
    "score2": null,
    "date": "2026-07-12T16:00:00Z"
  },
  "final": {
    "id": "final",
    "team1": "Winner SF1",
    "team2": "Winner SF2",
    "isPlaying": false,
    "score1": null,
    "score2": null,
    "date": "2026-07-13T20:00:00Z"
  }
}
```

## Method 2: Reinitializing Data with initData.js

If you need to completely reset the data or make extensive changes, you can modify and run the `initData.js` script.

### Step 1: Modify the Source Data

The `initData.js` script gets data from `src/data/tournament.ts` in the front-end codebase. You can either:

1. Update the front-end `tournament.ts` file, or
2. Modify the `initData.js` script to use hard-coded data (there's a commented section for this purpose)

### Step 2: Run the Script

```bash
# Navigate to the server directory
cd /var/www/torneig-api/server

# Run the script
node initData.js
```

This will create new data files based on the current data in `tournament.ts` or the hard-coded data in `initData.js`.

## Method 3: Using the API to Update Match Results

The API provides endpoints to update match information without directly editing files.

### Updating Group Matches

To update a group match:

```bash
# Replace INDEX with the array index of the match (starting from 0)
curl -X PUT \
  http://demo-api.tenimaleta.com/api/matches/INDEX \
  -H "Content-Type: application/json" \
  -d '{
    "isPlaying": true,
    "score1": 2,
    "score2": 1
  }'
```

### Updating Knockout Matches

To update a knockout match:

```bash
# For quarterfinals or semifinals:
# Replace ROUND with either "quarterfinals" or "semifinals"
# Replace INDEX with the array index of the match (starting from 0)
curl -X PUT \
  http://demo-api.tenimaleta.com/api/knockout/ROUND/INDEX \
  -H "Content-Type: application/json" \
  -d '{
    "isPlaying": true,
    "score1": 2,
    "score2": 1
  }'

# For final or third place:
# Replace ROUND with either "final" or "thirdPlace"
curl -X PUT \
  http://demo-api.tenimaleta.com/api/knockout/ROUND/0 \
  -H "Content-Type: application/json" \
  -d '{
    "isPlaying": true,
    "score1": 3,
    "score2": 2
  }'
```

## Restoring from Backups

If you need to restore from a backup:

```bash
# List available backups
ls -la /var/www/torneig-api/server/data/*.backup.*

# Restore a specific backup
cp /var/www/torneig-api/server/data/matches.json.backup.YYYYMMDD /var/www/torneig-api/server/data/matches.json
cp /var/www/torneig-api/server/data/knockout.json.backup.YYYYMMDD /var/www/torneig-api/server/data/knockout.json
```

## Troubleshooting

### API Returns 404 When Updating

- Make sure you're using the correct index for the match you want to update
- Verify that the data files exist in the server/data directory

### Data Files Are Corrupted

If the JSON files become corrupted:

1. Try to restore from a backup
2. If no backup is available, re-run the initData.js script to recreate the files
3. As a last resort, manually create the files with properly formatted JSON

### Changes Not Reflecting in the API

After making direct changes to the data files:

1. Verify the JSON syntax is correct
2. Make sure the server process has read permissions for the files
3. You might need to restart the server:
   ```bash
   pm2 restart torneig-api
   ```

## Best Practices

1. **Always back up data** before making changes
2. **Test changes on a development environment** before applying to production
3. **Use the API for small updates** rather than directly editing files
4. **Keep a version history** of significant data changes
5. **Document any manual data changes** you make for future reference 
