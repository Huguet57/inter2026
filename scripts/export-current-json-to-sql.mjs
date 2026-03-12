import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildSeedSqlFromTournamentState } from './seedSql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const d1Dir = path.join(rootDir, 'd1');
const outputPath = path.join(d1Dir, 'seed-current.sql');

const matchesPath = path.join(rootDir, 'server', 'data', 'matches.json');
const knockoutPath = path.join(rootDir, 'server', 'data', 'knockout.json');

const [matchesJson, knockoutJson] = await Promise.all([
  readFile(matchesPath, 'utf8'),
  readFile(knockoutPath, 'utf8'),
]);

const sql = buildSeedSqlFromTournamentState({
  matches: JSON.parse(matchesJson),
  knockout: JSON.parse(knockoutJson),
});

await mkdir(d1Dir, { recursive: true });
await writeFile(outputPath, sql, 'utf8');

console.log(`Current tournament seed written to ${outputPath}`);
