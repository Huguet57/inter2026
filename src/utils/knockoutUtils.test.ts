import { describe, expect, it } from 'vitest';
import { Match, Team } from '../data/tournament';
import {
  calculateGroupStandings,
  getSeedMap,
  resolveKnockoutMatchTeams,
  seedQualifiedTeams,
  QualifiedTeam,
} from './knockoutUtils';

const createTeam = (name: string, group: number): Team => ({
  name,
  group,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  points: 0,
});

const createGroupMatches = (groupNumber: number, prefix: string, dominantWinMargin: number): Match[] => {
  const [team1, team2, team3, team4] = [1, 2, 3, 4].map((seed) => `${prefix}${seed}`);

  return [
    { id: `G${groupNumber}-1`, time: '10:00-10:20', field: 1, team1, team2, score1: 2 + dominantWinMargin, score2: 0 },
    { id: `G${groupNumber}-2`, time: '10:00-10:20', field: 2, team1: team3, team2: team4, score1: 1, score2: 0 },
    { id: `G${groupNumber}-3`, time: '10:20-10:40', field: 1, team1, team2: team3, score1: 1, score2: 0 },
    { id: `G${groupNumber}-4`, time: '10:20-10:40', field: 2, team1: team2, team2: team4, score1: 3, score2: 0 },
    { id: `G${groupNumber}-5`, time: '10:40-11:00', field: 1, team1, team2: team4, score1: 0, score2: 0 },
    { id: `G${groupNumber}-6`, time: '10:40-11:00', field: 2, team1: team2, team2: team3, score1: 1, score2: 0 },
  ];
};

describe('calculateGroupStandings', () => {
  it('classifies 7 groups from a full 42-match group stage', () => {
    const groups: Team[][] = Array.from({ length: 7 }, (_, index) => {
      const groupNumber = index + 1;
      return [1, 2, 3, 4].map((seed) => createTeam(`G${groupNumber}T${seed}`, groupNumber));
    });

    const matches = groups.flatMap((group, index) =>
      createGroupMatches(index + 1, `G${index + 1}T`, index),
    );

    expect(matches).toHaveLength(42);

    const standings = calculateGroupStandings(groups, matches);

    expect(standings).toHaveLength(28);
    expect(standings.filter((team) => team.position === 1)).toHaveLength(7);
    expect(standings.filter((team) => team.position === 2)).toHaveLength(7);
    expect(standings.find((team) => team.group === 1 && team.position === 1)?.name).toBe('G1T1');
    expect(standings.find((team) => team.group === 1 && team.position === 2)?.name).toBe('G1T2');
    expect(standings.find((team) => team.group === 7 && team.position === 1)?.points).toBe(7);
  });
});

describe('seedQualifiedTeams', () => {
  it('seeds the top 14 teams globally with deterministic tie-breakers', () => {
    const qualifiedTeams: QualifiedTeam[] = [
      { name: 'G1 Winner', group: 1, position: 1, played: 3, won: 3, drawn: 0, lost: 0, goalsFor: 9, goalsAgainst: 1, points: 9 },
      { name: 'G1 Runner-up', group: 1, position: 2, played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 7, goalsAgainst: 2, points: 7 },
      { name: 'G2 Winner', group: 2, position: 1, played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 5, goalsAgainst: 1, points: 7 },
      { name: 'G2 Runner-up', group: 2, position: 2, played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 8, goalsAgainst: 3, points: 7 },
      { name: 'G3 Winner', group: 3, position: 1, played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 6, goalsAgainst: 2, points: 6 },
      { name: 'G3 Runner-up', group: 3, position: 2, played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 7, goalsAgainst: 3, points: 6 },
      { name: 'G4 Winner', group: 4, position: 1, played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 4, goalsAgainst: 1, points: 7 },
      { name: 'G4 Runner-up', group: 4, position: 2, played: 3, won: 1, drawn: 2, lost: 0, goalsFor: 4, goalsAgainst: 2, points: 5 },
      { name: 'G5 Winner', group: 5, position: 1, played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 6, goalsAgainst: 2, points: 7 },
      { name: 'G5 Runner-up', group: 5, position: 2, played: 3, won: 1, drawn: 2, lost: 0, goalsFor: 5, goalsAgainst: 3, points: 5 },
      { name: 'G6 Winner', group: 6, position: 1, played: 3, won: 1, drawn: 2, lost: 0, goalsFor: 3, goalsAgainst: 1, points: 5 },
      { name: 'G6 Runner-up', group: 6, position: 2, played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 5, goalsAgainst: 4, points: 4 },
      { name: 'G7 Winner', group: 7, position: 1, played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 2, points: 6 },
      { name: 'G7 Runner-up', group: 7, position: 2, played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 4, goalsAgainst: 4, points: 4 },
      { name: 'Non Qualifier', group: 7, position: 3, played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 6, points: 3 },
    ];

    const seededTeams = seedQualifiedTeams(qualifiedTeams);
    const seedMap = getSeedMap(seededTeams);

    expect(seededTeams).toHaveLength(14);
    expect(seededTeams[0].name).toBe('G1 Winner');
    expect(seededTeams[1].name).toBe('G2 Runner-up');
    expect(seededTeams[2].name).toBe('G1 Runner-up');
    expect(seededTeams[3].name).toBe('G5 Winner');
    expect(seededTeams[4].name).toBe('G2 Winner');
    expect(seededTeams[5].name).toBe('G4 Winner');
    expect(seededTeams[6].name).toBe('G3 Runner-up');
    expect(seededTeams[7].name).toBe('G3 Winner');
    expect(seedMap[14]?.name).toBe('G7 Runner-up');
  });
});

describe('resolveKnockoutMatchTeams', () => {
  it('resolves seeds, winners and losers across the full 2026 bracket', () => {
    const seededTeams = Array.from({ length: 14 }, (_, index) => ({
      name: `Equip ${index + 1} Real`,
      group: (index % 7) + 1,
      position: index < 7 ? 1 : 2,
      played: 3,
      won: 2,
      drawn: 0,
      lost: 1,
      goalsFor: 6 - index,
      goalsAgainst: index,
      points: 6 - Math.floor(index / 2),
      seed: index + 1,
    }));

    const seedMap = getSeedMap(seededTeams);

    const knockoutMatches = {
      roundOf16: [
        { id: 'R16-1', time: '17:20-17:40', field: 1, description: 'Equip 3 - Equip 14', team1Source: { type: 'seed', seed: 3 }, team2Source: { type: 'seed', seed: 14 }, score1: 2, score2: 0 },
        { id: 'R16-2', time: '17:20-17:40', field: 2, description: 'Equip 4 - Equip 13', team1Source: { type: 'seed', seed: 4 }, team2Source: { type: 'seed', seed: 13 }, score1: 1, score2: 0 },
        { id: 'R16-3', time: '17:40-18:00', field: 1, description: 'Equip 5 - Equip 12', team1Source: { type: 'seed', seed: 5 }, team2Source: { type: 'seed', seed: 12 }, score1: 0, score2: 1 },
        { id: 'R16-4', time: '17:40-18:00', field: 2, description: 'Equip 6 - Equip 11', team1Source: { type: 'seed', seed: 6 }, team2Source: { type: 'seed', seed: 11 }, score1: 3, score2: 1 },
        { id: 'R16-5', time: '18:00-18:20', field: 1, description: 'Equip 7 - Equip 10', team1Source: { type: 'seed', seed: 7 }, team2Source: { type: 'seed', seed: 10 }, score1: 1, score2: 0 },
        { id: 'R16-6', time: '18:00-18:20', field: 2, description: 'Equip 8 - Equip 9', team1Source: { type: 'seed', seed: 8 }, team2Source: { type: 'seed', seed: 9 }, score1: 0, score2: 2 },
      ],
      quarterFinals: [
        { id: 'QF-1', time: '18:20-18:45', field: 1, description: 'Equip 1 - Guanyador 8-9', team1Source: { type: 'seed', seed: 1 }, team2Source: { type: 'winner', matchId: 'R16-6' }, score1: 2, score2: 1 },
        { id: 'QF-2', time: '18:20-18:45', field: 2, description: 'Guanyador 4-13 - Guanyador 5-12', team1Source: { type: 'winner', matchId: 'R16-2' }, team2Source: { type: 'winner', matchId: 'R16-3' }, score1: 0, score2: 1 },
        { id: 'QF-3', time: '18:45-19:10', field: 1, description: 'Guanyador 3-14 - Guanyador 6-11', team1Source: { type: 'winner', matchId: 'R16-1' }, team2Source: { type: 'winner', matchId: 'R16-4' }, score1: 3, score2: 2 },
        { id: 'QF-4', time: '18:45-19:10', field: 2, description: 'Equip 2 - Guanyador 7-10', team1Source: { type: 'seed', seed: 2 }, team2Source: { type: 'winner', matchId: 'R16-5' }, score1: 2, score2: 0 },
      ],
      semiFinals: [
        { id: 'SF-1', time: '19:10-19:35', field: 1, description: 'Guanyador 18:20 P1 - Guanyador 18:20 P2', team1Source: { type: 'winner', matchId: 'QF-1' }, team2Source: { type: 'winner', matchId: 'QF-2' }, score1: 1, score2: 2 },
        { id: 'SF-2', time: '19:35-20:00', field: 1, description: 'Guanyador 18:45 P1 - Guanyador 18:45 P2', team1Source: { type: 'winner', matchId: 'QF-3' }, team2Source: { type: 'winner', matchId: 'QF-4' }, score1: 0, score2: 1 },
      ],
      thirdPlace: {
        id: 'TP-1',
        time: '20:00-20:35',
        field: 1,
        description: '3r i 4t Finalista',
        team1Source: { type: 'loser', matchId: 'SF-1' },
        team2Source: { type: 'loser', matchId: 'SF-2' },
      },
      final: {
        id: 'F-1',
        time: '20:35-21:10',
        field: 1,
        description: '1r i 2n Finalista',
        team1Source: { type: 'winner', matchId: 'SF-1' },
        team2Source: { type: 'winner', matchId: 'SF-2' },
      },
    };

    const allMatches = {
      groupMatches: [] as Match[],
      knockoutMatches,
    };

    expect(resolveKnockoutMatchTeams(knockoutMatches.roundOf16[0], seedMap, allMatches)).toBe('Equip 3 Real - Equip 14 Real');
    expect(resolveKnockoutMatchTeams(knockoutMatches.quarterFinals[0], seedMap, allMatches)).toBe('Equip 1 Real - Equip 9 Real');
    expect(resolveKnockoutMatchTeams(knockoutMatches.semiFinals[0], seedMap, allMatches)).toBe('Equip 1 Real - Equip 12 Real');
    expect(resolveKnockoutMatchTeams(knockoutMatches.thirdPlace, seedMap, allMatches)).toBe('Equip 1 Real - Equip 3 Real');
    expect(resolveKnockoutMatchTeams(knockoutMatches.final, seedMap, allMatches)).toBe('Equip 12 Real - Equip 2 Real');
  });
});
