import { describe, expect, it } from 'vitest';

import { groupMatches, knockoutMatches } from '../src/data/tournament';
import { buildSeedSqlFromTournamentState } from './seedSql.js';

describe('buildSeedSqlFromTournamentState', () => {
  it('creates a deterministic seed with every tournament match', () => {
    const sql = buildSeedSqlFromTournamentState({
      matches: groupMatches,
      knockout: knockoutMatches,
    });

    expect(sql).toContain('DELETE FROM matches;');
    expect(sql.match(/INSERT INTO matches/g)).toHaveLength(56);
    expect(sql).toContain("'groups'");
    expect(sql).toContain("'final'");
  });
});
