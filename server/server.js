const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data storage path
const DATA_PATH = path.join(__dirname, 'data');
const MATCHES_FILE = path.join(DATA_PATH, 'matches.json');
const KNOCKOUT_FILE = path.join(DATA_PATH, 'knockout.json');

// File locking mechanism
const fileLocks = new Map();

// Acquire a lock on a file
const acquireLock = async (filePath, timeoutMs = 10000) => {
  // If no lock exists yet, create one that resolves immediately
  if (!fileLocks.has(filePath)) {
    fileLocks.set(filePath, Promise.resolve());
  }

  // Get the current lock
  const currentLock = fileLocks.get(filePath);
  
  // Create a new lock that will replace the current one
  let releaseLock;
  const newLock = new Promise(resolve => {
    releaseLock = resolve;
  });
  
  // Set up timeout for lock acquisition
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout acquiring lock for ${filePath}`)), timeoutMs);
  });
  
  // Wait for the current lock to be released
  try {
    await Promise.race([currentLock, timeoutPromise]);
    // Set the new lock
    fileLocks.set(filePath, newLock);
    return releaseLock;
  } catch (error) {
    throw error;
  }
};

// Safe JSON file writing utility
const safeWriteJSON = async (filePath, data) => {
  // Validate data can be stringified
  try {
    JSON.stringify(data);
  } catch (error) {
    throw new Error(`Invalid JSON data: ${error.message}`);
  }

  // Acquire lock for this file
  let releaseLock;
  try {
    releaseLock = await acquireLock(filePath);
    console.log(`Lock acquired for ${filePath}`);
  } catch (error) {
    throw new Error(`Failed to acquire file lock: ${error.message}`);
  }

  const backupPath = `${filePath}.backup`;
  
  try {
    // Create backup of existing file if it exists
    try {
      await fs.access(filePath);
      await fs.copyFile(filePath, backupPath);
    } catch (err) {
      // File doesn't exist yet, no backup needed
    }
    
    // Write to a temporary file first
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
    
    // Rename the temp file to the target file (more atomic operation)
    await fs.rename(tempPath, filePath);
    
    // Remove backup if everything succeeded
    try {
      await fs.access(backupPath);
      await fs.unlink(backupPath);
    } catch (err) {
      // No backup to delete
    }
  } catch (error) {
    // If anything failed, try to restore from backup
    try {
      const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
      if (backupExists) {
        await fs.copyFile(backupPath, filePath);
      }
    } catch (restoreError) {
      // Release lock before throwing
      releaseLock();
      throw new Error(`Failed to write JSON and restore backup: ${error.message}, ${restoreError.message}`);
    }
    
    // Release lock before throwing
    releaseLock();
    throw new Error(`Failed to safely write JSON: ${error.message}`);
  }
  
  // Release the lock
  releaseLock();
  console.log(`Lock released for ${filePath}`);
};

// Initialize data files if they don't exist
const initializeData = async () => {
  try {
    await fs.mkdir(DATA_PATH, { recursive: true });
    
    // Check if matches file exists
    try {
      await fs.access(MATCHES_FILE);
      console.log('Matches data file exists');
    } catch (error) {
      console.log('Matches data file not found, run "node initData.js" to create it');
      throw new Error('Matches data file not found');
    }
    
    // Check if knockout file exists
    try {
      await fs.access(KNOCKOUT_FILE);
      console.log('Knockout data file exists');
    } catch (error) {
      console.log('Knockout data file not found, run "node initData.js" to create it');
      throw new Error('Knockout data file not found');
    }
  } catch (error) {
    console.error('Error checking data files:', error);
    process.exit(1);
  }
};

// API Endpoints

// Get all group matches
app.get('/api/matches', async (req, res) => {
  try {
    const data = await fs.readFile(MATCHES_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading matches:', error);
    res.status(500).json({ error: 'Failed to read matches' });
  }
});

// Update a group match
app.put('/api/matches/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const updates = req.body;
    
    const data = await fs.readFile(MATCHES_FILE, 'utf8');
    const matches = JSON.parse(data);
    
    if (index < 0 || index >= matches.length) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Check if we should explicitly clear scores
    // This handles both cases:
    // 1. When isPlaying is false and scores are missing from updates
    // 2. When scores are explicitly set to null or undefined in the request
    if ((updates.isPlaying === false && !('score1' in updates) && !('score2' in updates)) ||
        updates.score1 === null || updates.score2 === null) {
      updates.score1 = null;
      updates.score2 = null;
    }
    
    matches[index] = { ...matches[index], ...updates };
    
    // Clean up null values if we still need to preserve them in the data file
    if (matches[index].score1 === null) matches[index].score1 = undefined;
    if (matches[index].score2 === null) matches[index].score2 = undefined;
    
    await safeWriteJSON(MATCHES_FILE, matches);
    
    res.json(matches[index]);
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: 'Failed to update match: ' + error.message });
  }
});

// Get all knockout matches
app.get('/api/knockout', async (req, res) => {
  try {
    const data = await fs.readFile(KNOCKOUT_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading knockout matches:', error);
    res.status(500).json({ error: 'Failed to read knockout matches' });
  }
});

// Update a knockout match
app.put('/api/knockout/:round/:index', async (req, res) => {
  try {
    const { round, index } = req.params;
    const updates = req.body;
    const idx = parseInt(index);
    
    const data = await fs.readFile(KNOCKOUT_FILE, 'utf8');
    const knockoutMatches = JSON.parse(data);
    
    // Check if we should explicitly clear scores
    // This handles both cases:
    // 1. When isPlaying is false and scores are missing from updates
    // 2. When scores are explicitly set to null or undefined in the request
    if ((updates.isPlaying === false && !('score1' in updates) && !('score2' in updates)) ||
        updates.score1 === null || updates.score2 === null) {
      updates.score1 = null;
      updates.score2 = null;
    }
    
    if (round === 'thirdPlace' || round === 'final') {
      knockoutMatches[round] = { ...knockoutMatches[round], ...updates };
      
      // Clean up null values
      if (knockoutMatches[round].score1 === null) knockoutMatches[round].score1 = undefined;
      if (knockoutMatches[round].score2 === null) knockoutMatches[round].score2 = undefined;
    } else {
      if (!knockoutMatches[round] || idx < 0 || idx >= knockoutMatches[round].length) {
        return res.status(404).json({ error: 'Match not found' });
      }
      knockoutMatches[round][idx] = { ...knockoutMatches[round][idx], ...updates };
      
      // Clean up null values
      if (knockoutMatches[round][idx].score1 === null) knockoutMatches[round][idx].score1 = undefined;
      if (knockoutMatches[round][idx].score2 === null) knockoutMatches[round][idx].score2 = undefined;
    }
    
    await safeWriteJSON(KNOCKOUT_FILE, knockoutMatches);
    
    res.json(knockoutMatches);
  } catch (error) {
    console.error('Error updating knockout match:', error);
    res.status(500).json({ error: 'Failed to update knockout match: ' + error.message });
  }
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

// Initialize data and start server
initializeData()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api/health`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize server:', err);
  }); 