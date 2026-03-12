CREATE TABLE IF NOT EXISTS matches (
  id TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (
    stage IN ('groups', 'roundOf16', 'quarterFinals', 'semiFinals', 'thirdPlace', 'final')
  ),
  stage_index INTEGER NOT NULL,
  time TEXT NOT NULL,
  field INTEGER NOT NULL,
  team1 TEXT,
  team2 TEXT,
  team1_source_json TEXT,
  team2_source_json TEXT,
  score1 INTEGER,
  score2 INTEGER,
  is_playing INTEGER,
  description TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(stage, stage_index)
);

CREATE INDEX IF NOT EXISTS idx_matches_stage_order
  ON matches(stage, stage_index);
