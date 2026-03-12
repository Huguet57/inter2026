import { KnockoutMatches, Match, MatchTeamSource, Team } from '../data/tournament';

export interface QualifiedTeam {
  name: string;
  group: number;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface SeededTeam extends QualifiedTeam {
  seed: number;
}

export interface MatchResolutionContext {
  groupMatches: Match[];
  knockoutMatches: KnockoutMatches;
}

const normalizeTeamName = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const cloneGroups = (teams: Team[][]): Team[][] =>
  teams.map((group) =>
    group.map((team) => ({
      ...team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    })),
  );

const getGoalDifference = (team: Pick<QualifiedTeam, 'goalsFor' | 'goalsAgainst'>): number =>
  team.goalsFor - team.goalsAgainst;

const sortGroupTeams = (a: Team, b: Team): number =>
  b.points - a.points ||
  getGoalDifference(b) - getGoalDifference(a) ||
  b.goalsFor - a.goalsFor ||
  a.name.localeCompare(b.name);

const sortQualifiedTeams = (a: QualifiedTeam, b: QualifiedTeam): number =>
  b.points - a.points ||
  getGoalDifference(b) - getGoalDifference(a) ||
  b.goalsFor - a.goalsFor ||
  a.position - b.position ||
  a.group - b.group ||
  a.name.localeCompare(b.name);

export const calculateGroupStandings = (teams: Team[][], matches: Match[]): QualifiedTeam[] => {
  const updatedTeams = cloneGroups(teams);
  const teamMap = new Map<string, Team>();

  updatedTeams.forEach((group) => {
    group.forEach((team) => {
      teamMap.set(normalizeTeamName(team.name), team);
    });
  });

  matches.forEach((match) => {
    if (
      match.score1 === undefined ||
      match.score2 === undefined ||
      !match.team1 ||
      !match.team2
    ) {
      return;
    }

    const team1 = teamMap.get(normalizeTeamName(match.team1));
    const team2 = teamMap.get(normalizeTeamName(match.team2));

    if (!team1 || !team2) {
      return;
    }

    team1.played += 1;
    team2.played += 1;
    team1.goalsFor += match.score1;
    team1.goalsAgainst += match.score2;
    team2.goalsFor += match.score2;
    team2.goalsAgainst += match.score1;

    if (match.score1 > match.score2) {
      team1.won += 1;
      team2.lost += 1;
      team1.points += 3;
      return;
    }

    if (match.score2 > match.score1) {
      team2.won += 1;
      team1.lost += 1;
      team2.points += 3;
      return;
    }

    team1.drawn += 1;
    team2.drawn += 1;
    team1.points += 1;
    team2.points += 1;
  });

  return updatedTeams.flatMap((group, groupIndex) =>
    [...group].sort(sortGroupTeams).map((team, position) => ({
      name: team.name,
      group: groupIndex + 1,
      position: position + 1,
      played: team.played,
      won: team.won,
      drawn: team.drawn,
      lost: team.lost,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      points: team.points,
    })),
  );
};

export const seedQualifiedTeams = (qualifiedTeams: QualifiedTeam[]): SeededTeam[] =>
  qualifiedTeams
    .filter((team) => team.position <= 2)
    .sort(sortQualifiedTeams)
    .map((team, index) => ({
      ...team,
      seed: index + 1,
    }));

export const getSeedMap = (seededTeams: SeededTeam[]): Record<number, SeededTeam> =>
  seededTeams.reduce<Record<number, SeededTeam>>((accumulator, team) => {
    accumulator[team.seed] = team;
    return accumulator;
  }, {});

const isMatchDecided = (match: Match): boolean =>
  match.score1 !== undefined &&
  match.score2 !== undefined &&
  match.score1 !== match.score2;

const findMatchById = (
  allMatches: MatchResolutionContext,
  matchId: string,
): Match | undefined => {
  const knockoutMatches = [
    ...allMatches.knockoutMatches.roundOf16,
    ...allMatches.knockoutMatches.quarterFinals,
    ...allMatches.knockoutMatches.semiFinals,
    allMatches.knockoutMatches.thirdPlace,
    allMatches.knockoutMatches.final,
  ];

  return knockoutMatches.find((match) => match.id === matchId)
    ?? allMatches.groupMatches.find((match) => match.id === matchId);
};

const fallbackSourceLabel = (
  source: MatchTeamSource,
  allMatches: MatchResolutionContext,
): string => {
  if (source.type === 'literal') {
    return source.value;
  }

  if (source.type === 'seed') {
    return `Equip ${source.seed}`;
  }

  const referencedMatch = findMatchById(allMatches, source.matchId);
  if (!referencedMatch) {
    return source.type === 'winner'
      ? `Guanyador ${source.matchId}`
      : `Perdedor ${source.matchId}`;
  }

  return source.type === 'winner'
    ? `Guanyador ${referencedMatch.id}`
    : `Perdedor ${referencedMatch.id}`;
};

const resolveMatchParticipants = (
  match: Match,
  seedMap: Record<number, SeededTeam>,
  allMatches: MatchResolutionContext,
): [string, string] => {
  const team1 = match.team1Source
    ? resolveMatchParticipant(match.team1Source, seedMap, allMatches)
    : match.team1 ?? '';
  const team2 = match.team2Source
    ? resolveMatchParticipant(match.team2Source, seedMap, allMatches)
    : match.team2 ?? '';

  return [team1, team2];
};

export const resolveMatchParticipant = (
  source: MatchTeamSource,
  seedMap: Record<number, SeededTeam>,
  allMatches: MatchResolutionContext,
): string => {
  if (source.type === 'literal') {
    return source.value;
  }

  if (source.type === 'seed') {
    return seedMap[source.seed]?.name ?? `Equip ${source.seed}`;
  }

  const referencedMatch = findMatchById(allMatches, source.matchId);
  if (!referencedMatch || !isMatchDecided(referencedMatch)) {
    return fallbackSourceLabel(source, allMatches);
  }

  const [team1, team2] = resolveMatchParticipants(referencedMatch, seedMap, allMatches);
  if (!team1 || !team2) {
    return fallbackSourceLabel(source, allMatches);
  }

  const firstSideWins = (referencedMatch.score1 ?? 0) > (referencedMatch.score2 ?? 0);

  if (source.type === 'winner') {
    return firstSideWins ? team1 : team2;
  }

  return firstSideWins ? team2 : team1;
};

export const resolveKnockoutMatchTeams = (
  match: Match,
  seedMap: Record<number, SeededTeam>,
  allMatches: MatchResolutionContext,
): string => {
  const [team1, team2] = resolveMatchParticipants(match, seedMap, allMatches);

  if (team1 && team2) {
    return `${team1} - ${team2}`;
  }

  return match.description || team1 || team2 || 'Per determinar';
};
