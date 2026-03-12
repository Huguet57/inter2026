const DEFAULT_UPDATED_AT = '2026-03-12T00:00:00.000Z';

const sqlString = (value) => `'${String(value).replace(/'/g, "''")}'`;

const sqlValue = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return sqlString(value);
};

const buildInsertRow = (stage, stageIndex, match) => {
  const values = [
    match.id ?? `${stage}-${stageIndex}`,
    stage,
    stageIndex,
    match.time,
    match.field,
    match.team1 ?? null,
    match.team2 ?? null,
    match.team1Source ? JSON.stringify(match.team1Source) : null,
    match.team2Source ? JSON.stringify(match.team2Source) : null,
    match.score1 ?? null,
    match.score2 ?? null,
    typeof match.isPlaying === 'boolean' ? (match.isPlaying ? 1 : 0) : null,
    match.description ?? null,
    DEFAULT_UPDATED_AT,
  ];

  return `INSERT INTO matches (
  id, stage, stage_index, time, field, team1, team2, team1_source_json, team2_source_json,
  score1, score2, is_playing, description, updated_at
) VALUES (${values.map(sqlValue).join(', ')});`;
};

export const buildSeedSqlFromTournamentState = ({ matches, knockout }) => {
  const statements = [];

  matches.forEach((match, index) => {
    statements.push(buildInsertRow('groups', index, match));
  });

  knockout.roundOf16.forEach((match, index) => {
    statements.push(buildInsertRow('roundOf16', index, match));
  });

  knockout.quarterFinals.forEach((match, index) => {
    statements.push(buildInsertRow('quarterFinals', index, match));
  });

  knockout.semiFinals.forEach((match, index) => {
    statements.push(buildInsertRow('semiFinals', index, match));
  });

  statements.push(buildInsertRow('thirdPlace', 0, knockout.thirdPlace));
  statements.push(buildInsertRow('final', 0, knockout.final));

  return `DELETE FROM matches;\n${statements.join('\n')}\n`;
};
