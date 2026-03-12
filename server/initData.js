/**
 * Data initialization script that extracts data from the tournament.ts file
 * and creates the initial JSON data files for the API server.
 * 
 * Run this script once to initialize the data.
 */
const fs = require('fs').promises;
const path = require('path');

// Data from your front-end application
const { groupMatches, knockoutMatches } = require('../src/data/tournament');

// If running directly on server without the frontend code, uncomment and use these:
/*
const groupMatches = [
  // Copy your group matches data here from tournament.ts
];

const knockoutMatches = {
  // Copy your knockout matches data here from tournament.ts 
};
*/

const DATA_PATH = path.join(__dirname, 'data');
const MATCHES_FILE = path.join(DATA_PATH, 'matches.json');
const KNOCKOUT_FILE = path.join(DATA_PATH, 'knockout.json');

async function initializeData() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(DATA_PATH, { recursive: true });
    
    // Initialize group matches file
    console.log('Creating matches data file...');
    await fs.writeFile(MATCHES_FILE, JSON.stringify(groupMatches, null, 2));
    
    // Initialize knockout matches file
    console.log('Creating knockout data file...');
    await fs.writeFile(KNOCKOUT_FILE, JSON.stringify(knockoutMatches, null, 2));
    
    console.log('Data initialization complete!');
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Run initialization
initializeData(); 