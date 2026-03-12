import React from 'react';
import { Match } from '../data/tournament';
import { useMatches } from '../context/useMatches';
import { groups } from '../data/tournament';
import {
  calculateGroupStandings,
  getSeedMap,
  resolveKnockoutMatchTeams,
  seedQualifiedTeams,
} from '../utils/knockoutUtils';

export const KnockoutStage: React.FC = () => {
  const { matches, knockoutMatches } = useMatches();
  const qualifiedTeams = calculateGroupStandings(groups, matches);
  const seededTeams = seedQualifiedTeams(qualifiedTeams);
  const seedMap = getSeedMap(seededTeams);
  const groupsCompleted = matches.every(match => 
    match.score1 !== undefined && match.score2 !== undefined && !match.isPlaying
  );
  
  const allMatches = {
    groupMatches: matches,
    knockoutMatches
  };
  
  const getMatchStatus = (match: Match) => {
    if (match.isPlaying) {
      return (
        <span className="text-yellow-500 font-bold">
          {match.score1} - {match.score2}
        </span>
      );
    }
    
    if (match.score1 !== undefined && match.score2 !== undefined) {
      return (
        <span className="font-bold">
          {match.score1} - {match.score2}
        </span>
      );
    }

    return <span className="text-gray-500">Per jugar</span>;
  };

  const renderMatchCard = (match: Match, index: number) => (
    <div key={match.id ?? index} className="bg-white rounded-lg shadow-md p-4">
      <p className="font-semibold">{match.time}</p>
      <p>Pista {match.field}</p>
      <p className="text-sm text-gray-600">{match.description}</p>
      <p className={`font-medium ${!groupsCompleted ? 'text-yellow-600' : ''}`}>
        {resolveKnockoutMatchTeams(match, seedMap, allMatches)}
      </p>
      <p className="mt-2">{getMatchStatus(match)}</p>
    </div>
  );
  
  return (
    <div className="space-y-8">
      {!groupsCompleted && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-700">
            Els equips mostrats són una estimació basada en la classificació actual dels grups
          </p>
        </div>
      )}
      
      <div>
        <h3 className="text-xl font-bold mb-4">16ens de final</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {knockoutMatches.roundOf16.map(renderMatchCard)}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Quarts de final</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {knockoutMatches.quarterFinals.map(renderMatchCard)}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Semifinals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {knockoutMatches.semiFinals.map(renderMatchCard)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-bold mb-4">3r i 4t lloc</h3>
          {renderMatchCard(knockoutMatches.thirdPlace, 0)}
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Final</h3>
          {renderMatchCard(knockoutMatches.final, 1)}
        </div>
      </div>
    </div>
  );
};
