import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { groupMatches, knockoutMatches } from '../src/data/tournament';
import { buildSeedSqlFromTournamentState } from './seedSql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const d1Dir = path.join(rootDir, 'd1');
const outputPath = path.join(d1Dir, 'seed-base.sql');

const sql = buildSeedSqlFromTournamentState({
  matches: groupMatches,
  knockout: knockoutMatches,
});

await mkdir(d1Dir, { recursive: true });
await writeFile(outputPath, sql, 'utf8');

console.log(`Base tournament seed written to ${outputPath}`);
