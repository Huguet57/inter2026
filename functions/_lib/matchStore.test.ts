import { describe, expect, it } from 'vitest';

import { Match } from '../../src/data/tournament';
import {
  applyMatchUpdate,
  matchToRow,
  recordToMatch,
  type MatchRow,
} from './matchStore';

const baseMatch: Match = {
  id: 'R16-1',
  time: '17:20-17:40',
  field: 1,
  description: 'Equip 3 - Equip 14',
  team1Source: { type: 'seed', seed: 3 },
  team2Source: { type: 'winner', matchId: 'QF-1' },
};

describe('matchStore row mapping', () => {
  it('serializes and deserializes D1 rows without losing optional fields', () => {
    const row = matchToRow('roundOf16', 0, {
      ...baseMatch,
      team1: 'Azus 1',
      score1: 2,
      score2: 1,
      isPlaying: false,
    });

    expect(row).toMatchObject({
      id: 'R16-1',
      stage: 'roundOf16',
      stage_index: 0,
      field: 1,
      team1: 'Azus 1',
      team2: null,
      team1_source_json: JSON.stringify({ type: 'seed', seed: 3 }),
      team2_source_json: JSON.stringify({ type: 'winner', matchId: 'QF-1' }),
      score1: 2,
      score2: 1,
      is_playing: 0,
    });

    expect(recordToMatch(row)).toEqual({
      ...baseMatch,
      team1: 'Azus 1',
      score1: 2,
      score2: 1,
      isPlaying: false,
    });
  });

  it('omits nullable fields when hydrating a match', () => {
    const row: MatchRow = {
      id: 'G1',
      stage: 'groups',
      stage_index: 0,
      time: '10:00-10:20',
      field: 1,
      team1: 'Azus 1',
      team2: 'Trempats 2',
      team1_source_json: null,
      team2_source_json: null,
      score1: null,
      score2: null,
      is_playing: null,
      description: null,
      updated_at: '2026-03-12T00:00:00.000Z',
    };

    expect(recordToMatch(row)).toEqual({
      id: 'G1',
      time: '10:00-10:20',
      field: 1,
      team1: 'Azus 1',
      team2: 'Trempats 2',
    });
  });
});

describe('applyMatchUpdate', () => {
  it('clears scores when a match is moved back to pending without explicit scores', () => {
    const updated = applyMatchUpdate(
      { ...baseMatch, score1: 3, score2: 2, isPlaying: true },
      { isPlaying: false },
    );

    expect(updated).toEqual({
      ...baseMatch,
      isPlaying: false,
    });
  });

  it('clears scores when either score is explicitly null', () => {
    const updated = applyMatchUpdate(
      { ...baseMatch, score1: 3, score2: 2, isPlaying: true },
      { score1: null },
    );

    expect(updated).toEqual({
      ...baseMatch,
      isPlaying: true,
    });
  });

  it('preserves supplied scores when a match is marked as finished', () => {
    const updated = applyMatchUpdate(baseMatch, {
      score1: 4,
      score2: 1,
      isPlaying: false,
    });

    expect(updated).toEqual({
      ...baseMatch,
      score1: 4,
      score2: 1,
      isPlaying: false,
    });
  });
});
