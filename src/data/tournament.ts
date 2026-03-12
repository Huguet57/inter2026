export interface Team {
  name: string;
  group: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export type MatchTeamSource =
  | { type: 'literal'; value: string }
  | { type: 'seed'; seed: number }
  | { type: 'winner'; matchId: string }
  | { type: 'loser'; matchId: string };

export interface Match {
  id?: string;
  time: string;
  field: number;
  team1?: string;
  team2?: string;
  team1Source?: MatchTeamSource;
  team2Source?: MatchTeamSource;
  score1?: number;
  score2?: number;
  isPlaying?: boolean;
  description?: string;
}

export interface KnockoutMatches {
  roundOf16: Match[];
  quarterFinals: Match[];
  semiFinals: Match[];
  thirdPlace: Match;
  final: Match;
}

export type KnockoutRoundKey =
  | 'roundOf16'
  | 'quarterFinals'
  | 'semiFinals'
  | 'thirdPlace'
  | 'final';

export const groups: Team[][] = [
  [
    { name: 'Azus 1', group: 1, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Descargolats', group: 1, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Pataquers 1', group: 1, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Trempats 2', group: 1, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  ],
  [
    { name: 'Azus 2', group: 2, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Grillats', group: 2, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Marracos 2', group: 2, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Penjats 1', group: 2, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  ],
  [
    { name: 'Bergants 1', group: 3, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Engrescats 2', group: 3, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Marràntics', group: 3, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Penjats 2', group: 3, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  ],
  [
    { name: 'Bergants 2', group: 4, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Ganàpies 1', group: 4, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Trempats 1', group: 4, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Xoris 2', group: 4, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  ],
  [
    { name: 'Embos 1', group: 5, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Llunàtics 2', group: 5, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Marracos 3', group: 5, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Passarells 1', group: 5, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  ],
  [
    { name: 'Embos 2', group: 6, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Ganàpies 2', group: 6, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Llunàtics 1', group: 6, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Pataquers 2', group: 6, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  ],
  [
    { name: 'Engrescats 1', group: 7, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Marracos 1', group: 7, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Passarells 2', group: 7, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { name: 'Xoris 1', group: 7, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  ],
];

export const groupMatches: Match[] = [
  { id: 'G1', time: '10:00-10:20', field: 1, team1: 'Azus 1', team2: 'Trempats 2' },
  { id: 'G2', time: '10:00-10:20', field: 2, team1: 'Embos 2', team2: 'Pataquers 2' },
  { id: 'G3', time: '10:20-10:40', field: 1, team1: 'Grillats', team2: 'Penjats 1' },
  { id: 'G4', time: '10:20-10:40', field: 2, team1: 'Penjats 2', team2: 'Bergants 1' },
  { id: 'G5', time: '10:40-11:00', field: 1, team1: 'Passarells 2', team2: 'Marracos 1' },
  { id: 'G6', time: '10:40-11:00', field: 2, team1: 'Bergants 2', team2: 'Xoris 2' },
  { id: 'G7', time: '11:00-11:20', field: 1, team1: 'Embos 1', team2: 'Llunàtics 2' },
  { id: 'G8', time: '11:00-11:20', field: 2, team1: 'Descargolats', team2: 'Pataquers 1' },
  { id: 'G9', time: '11:20-11:40', field: 1, team1: 'Azus 2', team2: 'Marracos 2' },
  { id: 'G10', time: '11:20-11:40', field: 2, team1: 'Ganàpies 2', team2: 'Llunàtics 1' },
  { id: 'G11', time: '11:40-12:00', field: 1, team1: 'Marràntics', team2: 'Engrescats 2' },
  { id: 'G12', time: '11:40-12:00', field: 2, team1: 'Engrescats 1', team2: 'Xoris 1' },
  { id: 'G13', time: '12:00-12:20', field: 1, team1: 'Trempats 1', team2: 'Ganàpies 1' },
  { id: 'G14', time: '12:00-12:20', field: 2, team1: 'Marracos 3', team2: 'Passarells 1' },
  { id: 'G15', time: '12:20-12:40', field: 1, team1: 'Embos 2', team2: 'Ganàpies 2' },
  { id: 'G16', time: '12:20-12:40', field: 2, team1: 'Azus 1', team2: 'Descargolats' },
  { id: 'G17', time: '12:40-13:00', field: 1, team1: 'Grillats', team2: 'Azus 2' },
  { id: 'G18', time: '12:40-13:00', field: 2, team1: 'Penjats 2', team2: 'Marràntics' },
  { id: 'G19', time: '13:00-13:20', field: 1, team1: 'Passarells 2', team2: 'Engrescats 1' },
  { id: 'G20', time: '13:00-13:20', field: 2, team1: 'Bergants 2', team2: 'Trempats 1' },
  { id: 'G21', time: '13:20-13:40', field: 1, team1: 'Embos 1', team2: 'Marracos 3' },
  { id: 'G22', time: '13:20-13:40', field: 2, team1: 'Trempats 2', team2: 'Pataquers 1' },
  { id: 'G23', time: '13:40-14:00', field: 1, team1: 'Pataquers 2', team2: 'Llunàtics 1' },
  { id: 'G24', time: '13:40-14:00', field: 2, team1: 'Penjats 1', team2: 'Marracos 2' },
  { id: 'G25', time: '14:00-14:20', field: 1, team1: 'Marracos 1', team2: 'Xoris 1' },
  { id: 'G26', time: '14:00-14:20', field: 2, team1: 'Bergants 1', team2: 'Engrescats 2' },
  { id: 'G27', time: '14:40-15:00', field: 1, team1: 'Xoris 2', team2: 'Ganàpies 1' },
  { id: 'G28', time: '14:40-15:00', field: 2, team1: 'Llunàtics 2', team2: 'Passarells 1' },
  { id: 'G29', time: '15:00-15:20', field: 1, team1: 'Azus 1', team2: 'Pataquers 1' },
  { id: 'G30', time: '15:00-15:20', field: 2, team1: 'Embos 2', team2: 'Llunàtics 1' },
  { id: 'G31', time: '15:20-15:40', field: 1, team1: 'Grillats', team2: 'Marracos 2' },
  { id: 'G32', time: '15:20-15:40', field: 2, team1: 'Penjats 2', team2: 'Engrescats 2' },
  { id: 'G33', time: '15:40-16:00', field: 1, team1: 'Passarells 2', team2: 'Xoris 1' },
  { id: 'G34', time: '15:40-16:00', field: 2, team1: 'Bergants 2', team2: 'Ganàpies 1' },
  { id: 'G35', time: '16:00-16:20', field: 1, team1: 'Llunàtics 2', team2: 'Marracos 3' },
  { id: 'G36', time: '16:00-16:20', field: 2, team1: 'Trempats 2', team2: 'Descargolats' },
  { id: 'G37', time: '16:20-16:40', field: 1, team1: 'Pataquers 2', team2: 'Ganàpies 2' },
  { id: 'G38', time: '16:20-16:40', field: 2, team1: 'Penjats 1', team2: 'Azus 2' },
  { id: 'G39', time: '16:40-17:00', field: 1, team1: 'Bergants 1', team2: 'Marràntics' },
  { id: 'G40', time: '16:40-17:00', field: 2, team1: 'Xoris 2', team2: 'Trempats 1' },
  { id: 'G41', time: '17:00-17:20', field: 1, team1: 'Marracos 1', team2: 'Engrescats 1' },
  { id: 'G42', time: '17:00-17:20', field: 2, team1: 'Embos 1', team2: 'Passarells 1' },
];

export const knockoutMatches: KnockoutMatches = {
  roundOf16: [
    {
      id: 'R16-1',
      time: '17:20-17:40',
      field: 1,
      description: 'Equip 3 - Equip 14',
      team1Source: { type: 'seed', seed: 3 },
      team2Source: { type: 'seed', seed: 14 },
    },
    {
      id: 'R16-2',
      time: '17:20-17:40',
      field: 2,
      description: 'Equip 4 - Equip 13',
      team1Source: { type: 'seed', seed: 4 },
      team2Source: { type: 'seed', seed: 13 },
    },
    {
      id: 'R16-3',
      time: '17:40-18:00',
      field: 1,
      description: 'Equip 5 - Equip 12',
      team1Source: { type: 'seed', seed: 5 },
      team2Source: { type: 'seed', seed: 12 },
    },
    {
      id: 'R16-4',
      time: '17:40-18:00',
      field: 2,
      description: 'Equip 6 - Equip 11',
      team1Source: { type: 'seed', seed: 6 },
      team2Source: { type: 'seed', seed: 11 },
    },
    {
      id: 'R16-5',
      time: '18:00-18:20',
      field: 1,
      description: 'Equip 7 - Equip 10',
      team1Source: { type: 'seed', seed: 7 },
      team2Source: { type: 'seed', seed: 10 },
    },
    {
      id: 'R16-6',
      time: '18:00-18:20',
      field: 2,
      description: 'Equip 8 - Equip 9',
      team1Source: { type: 'seed', seed: 8 },
      team2Source: { type: 'seed', seed: 9 },
    },
  ],
  quarterFinals: [
    {
      id: 'QF-1',
      time: '18:20-18:45',
      field: 1,
      description: 'Equip 1 - Guanyador 8-9',
      team1Source: { type: 'seed', seed: 1 },
      team2Source: { type: 'winner', matchId: 'R16-6' },
    },
    {
      id: 'QF-2',
      time: '18:20-18:45',
      field: 2,
      description: 'Guanyador 4-13 - Guanyador 5-12',
      team1Source: { type: 'winner', matchId: 'R16-2' },
      team2Source: { type: 'winner', matchId: 'R16-3' },
    },
    {
      id: 'QF-3',
      time: '18:45-19:10',
      field: 1,
      description: 'Guanyador 3-14 - Guanyador 6-11',
      team1Source: { type: 'winner', matchId: 'R16-1' },
      team2Source: { type: 'winner', matchId: 'R16-4' },
    },
    {
      id: 'QF-4',
      time: '18:45-19:10',
      field: 2,
      description: 'Equip 2 - Guanyador 7-10',
      team1Source: { type: 'seed', seed: 2 },
      team2Source: { type: 'winner', matchId: 'R16-5' },
    },
  ],
  semiFinals: [
    {
      id: 'SF-1',
      time: '19:10-19:35',
      field: 1,
      description: 'Guanyador 18:20 P1 - Guanyador 18:20 P2',
      team1Source: { type: 'winner', matchId: 'QF-1' },
      team2Source: { type: 'winner', matchId: 'QF-2' },
    },
    {
      id: 'SF-2',
      time: '19:35-20:00',
      field: 1,
      description: 'Guanyador 18:45 P1 - Guanyador 18:45 P2',
      team1Source: { type: 'winner', matchId: 'QF-3' },
      team2Source: { type: 'winner', matchId: 'QF-4' },
    },
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
