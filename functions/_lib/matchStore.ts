import type { Match, KnockoutMatches, KnockoutRoundKey, MatchTeamSource } from '../../src/data/tournament';

import type { D1Database } from './cloudflare';

export type MatchStage = 'groups' | KnockoutRoundKey;

export interface MatchRow {
  id: string;
  stage: MatchStage;
  stage_index: number;
  time: string;
  field: number;
  team1: string | null;
  team2: string | null;
  team1_source_json: string | null;
  team2_source_json: string | null;
  score1: number | null;
  score2: number | null;
  is_playing: number | null;
  description: string | null;
  updated_at: string;
}

export interface MatchUpdateInput extends Omit<Partial<Match>, 'score1' | 'score2'> {
  score1?: number | null;
  score2?: number | null;
}

const MATCH_COLUMNS = `
  id,
  stage,
  stage_index,
  time,
  field,
  team1,
  team2,
  team1_source_json,
  team2_source_json,
  score1,
  score2,
  is_playing,
  description,
  updated_at
`;

const KNOCKOUT_STAGES: KnockoutRoundKey[] = [
  'roundOf16',
  'quarterFinals',
  'semiFinals',
  'thirdPlace',
  'final',
];

const SINGLE_MATCH_STAGES = new Set<KnockoutRoundKey>(['thirdPlace', 'final']);

const stripUndefined = <T extends Record<string, unknown>>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;

const parseTeamSource = (value: string | null): MatchTeamSource | undefined =>
  value ? (JSON.parse(value) as MatchTeamSource) : undefined;

const serializeTeamSource = (value: MatchTeamSource | undefined): string | null =>
  value ? JSON.stringify(value) : null;

export const matchToRow = (
  stage: MatchStage,
  stageIndex: number,
  match: Match,
  updatedAt: string = new Date().toISOString(),
): MatchRow => ({
  id: match.id ?? `${stage}-${stageIndex}`,
  stage,
  stage_index: stageIndex,
  time: match.time,
  field: match.field,
  team1: match.team1 ?? null,
  team2: match.team2 ?? null,
  team1_source_json: serializeTeamSource(match.team1Source),
  team2_source_json: serializeTeamSource(match.team2Source),
  score1: match.score1 ?? null,
  score2: match.score2 ?? null,
  is_playing:
    typeof match.isPlaying === 'boolean'
      ? match.isPlaying
        ? 1
        : 0
      : null,
  description: match.description ?? null,
  updated_at: updatedAt,
});

export const recordToMatch = (row: MatchRow): Match =>
  stripUndefined({
    id: row.id,
    time: row.time,
    field: row.field,
    team1: row.team1 ?? undefined,
    team2: row.team2 ?? undefined,
    team1Source: parseTeamSource(row.team1_source_json),
    team2Source: parseTeamSource(row.team2_source_json),
    score1: row.score1 ?? undefined,
    score2: row.score2 ?? undefined,
    isPlaying:
      typeof row.is_playing === 'number'
        ? row.is_playing === 1
        : undefined,
    description: row.description ?? undefined,
  });

export const applyMatchUpdate = (current: Match, updates: MatchUpdateInput): Match => {
  const normalizedUpdates: Partial<Match> = { ...updates };

  if (
    (updates.isPlaying === false && !('score1' in updates) && !('score2' in updates)) ||
    updates.score1 === null ||
    updates.score2 === null
  ) {
    normalizedUpdates.score1 = undefined;
    normalizedUpdates.score2 = undefined;
  }

  return stripUndefined({
    ...current,
    ...normalizedUpdates,
    score1: normalizedUpdates.score1 ?? (normalizedUpdates.score1 === undefined ? undefined : current.score1),
    score2: normalizedUpdates.score2 ?? (normalizedUpdates.score2 === undefined ? undefined : current.score2),
  });
};

const mapRows = (rows: MatchRow[]): Match[] => rows.map(recordToMatch);

const selectStage = async (db: D1Database, stage: MatchStage): Promise<MatchRow[]> => {
  const result = await db
    .prepare(`SELECT ${MATCH_COLUMNS} FROM matches WHERE stage = ? ORDER BY stage_index ASC`)
    .bind(stage)
    .all<MatchRow>();

  return result.results;
};

const selectMatch = async (
  db: D1Database,
  stage: MatchStage,
  index: number,
): Promise<MatchRow | null> =>
  db
    .prepare(`SELECT ${MATCH_COLUMNS} FROM matches WHERE stage = ? AND stage_index = ? LIMIT 1`)
    .bind(stage, index)
    .first<MatchRow>();

const persistMatch = async (
  db: D1Database,
  stage: MatchStage,
  index: number,
  match: Match,
): Promise<void> => {
  const row = matchToRow(stage, index, match);

  await db
    .prepare(`
      UPDATE matches
      SET id = ?, time = ?, field = ?, team1 = ?, team2 = ?, team1_source_json = ?, team2_source_json = ?,
          score1 = ?, score2 = ?, is_playing = ?, description = ?, updated_at = ?
      WHERE stage = ? AND stage_index = ?
    `)
    .bind(
      row.id,
      row.time,
      row.field,
      row.team1,
      row.team2,
      row.team1_source_json,
      row.team2_source_json,
      row.score1,
      row.score2,
      row.is_playing,
      row.description,
      row.updated_at,
      stage,
      index,
    )
    .run();
};

export const getGroupMatches = async (db: D1Database): Promise<Match[]> =>
  mapRows(await selectStage(db, 'groups'));

export const getKnockoutMatches = async (db: D1Database): Promise<KnockoutMatches> => {
  const [roundOf16, quarterFinals, semiFinals, thirdPlaceRows, finalRows] = await Promise.all([
    selectStage(db, 'roundOf16'),
    selectStage(db, 'quarterFinals'),
    selectStage(db, 'semiFinals'),
    selectStage(db, 'thirdPlace'),
    selectStage(db, 'final'),
  ]);

  const thirdPlace = thirdPlaceRows[0];
  const final = finalRows[0];

  if (!thirdPlace || !final) {
    throw new Error('Missing knockout final stages in D1');
  }

  return {
    roundOf16: mapRows(roundOf16),
    quarterFinals: mapRows(quarterFinals),
    semiFinals: mapRows(semiFinals),
    thirdPlace: recordToMatch(thirdPlace),
    final: recordToMatch(final),
  };
};

export const updateGroupMatch = async (
  db: D1Database,
  index: number,
  updates: MatchUpdateInput,
): Promise<Match | null> => {
  const row = await selectMatch(db, 'groups', index);

  if (!row) {
    return null;
  }

  const nextMatch = applyMatchUpdate(recordToMatch(row), updates);
  await persistMatch(db, 'groups', index, nextMatch);

  return nextMatch;
};

const isKnockoutRound = (value: string): value is KnockoutRoundKey =>
  KNOCKOUT_STAGES.includes(value as KnockoutRoundKey);

export const updateKnockoutMatch = async (
  db: D1Database,
  round: string,
  index: number,
  updates: MatchUpdateInput,
): Promise<KnockoutMatches | null> => {
  if (!isKnockoutRound(round)) {
    return null;
  }

  const targetIndex = SINGLE_MATCH_STAGES.has(round) ? 0 : index;
  const row = await selectMatch(db, round, targetIndex);

  if (!row) {
    return null;
  }

  const nextMatch = applyMatchUpdate(recordToMatch(row), updates);
  await persistMatch(db, round, targetIndex, nextMatch);

  return getKnockoutMatches(db);
};
