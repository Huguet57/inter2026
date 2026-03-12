import React, { useState, useMemo } from 'react';
import Play from 'lucide-react/dist/esm/icons/play';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import X from 'lucide-react/dist/esm/icons/x';
import { useMatches } from '../context/MatchContext';
import { Match, groups } from '../data/tournament';
import {
  calculateGroupStandings,
  getSeedMap,
  resolveKnockoutMatchTeams,
  seedQualifiedTeams,
} from '../utils/knockoutUtils';

export const MatchSchedule: React.FC = () => {
  const { matches, knockoutMatches } = useMatches();
  const qualifiedTeams = calculateGroupStandings(groups, matches);
  const seedMap = getSeedMap(seedQualifiedTeams(qualifiedTeams));
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const groupsCompleted = matches.every(match => 
    match.score1 !== undefined && match.score2 !== undefined && !match.isPlaying
  );

  const allMatches = {
    groupMatches: matches,
    knockoutMatches
  };

  const getMatchStartTime = (matchTime: string) => matchTime.split(/[–-]/)[0];

  // Get all unique teams from matches
  const allTeams = useMemo(() => {
    const teams = new Set<string>();
    matches.forEach(match => {
      if (match.team1) teams.add(match.team1);
      if (match.team2) teams.add(match.team2);
    });
    return Array.from(teams).sort();
  }, [matches]);

  const handleTeamToggle = (team: string) => {
    setSelectedTeams(prev => 
      prev.includes(team)
        ? prev.filter(t => t !== team)
        : [...prev, team]
    );
  };

  const clearFilters = () => {
    setSelectedTeams([]);
  };

  const getMatchStatus = (match: Match) => {
    if (match.isPlaying) {
      return (
        <div className="flex items-center justify-center text-yellow-500">
          <Play className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
          <span className="ml-0.5 font-bold text-2xs sm:text-xs md:text-base">{match.score1} - {match.score2}</span>
        </div>
      );
    }
    
    if (match.score1 !== undefined && match.score2 !== undefined) {
      return (
        <span className="font-bold text-2xs sm:text-xs md:text-base">
          {match.score1} - {match.score2}
        </span>
      );
    }

    return <span className="text-gray-500 text-2xs sm:text-xs md:text-base">Per jugar</span>;
  };

  const getMatchTeams = (match: Match) => {
    if (match.team1 && match.team2 && !match.team1Source && !match.team2Source) {
      return `${match.team1} - ${match.team2}`;
    }
    
    return resolveKnockoutMatchTeams(match, seedMap, allMatches);
  };

  // Combine all matches in chronological order
  const allMatchesArray = [
    ...matches.map(match => ({ ...match, phase: 'Fase de grups' })),
    ...knockoutMatches.roundOf16.map(match => ({ ...match, phase: '16ens de final' })),
    ...knockoutMatches.quarterFinals.map(match => ({ ...match, phase: 'Quarts de final' })),
    ...knockoutMatches.semiFinals.map(match => ({ ...match, phase: 'Semifinals' })),
    [{ ...knockoutMatches.thirdPlace, phase: '3r i 4t lloc' }],
    [{ ...knockoutMatches.final, phase: 'Final' }]
  ].flat()
  .filter(match => {
    if (selectedTeams.length === 0) return true;
    const matchTeamsStr = getMatchTeams(match);
    return selectedTeams.some(team => matchTeamsStr.includes(team));
  })
  .sort((a, b) => {
    const timeA = getMatchStartTime(a.time);
    const timeB = getMatchStartTime(b.time);
    return timeA.localeCompare(timeB);
  });

  // Find the index of the first knockout match
  const firstKnockoutIndex = allMatchesArray.findIndex(match => match.phase !== 'Fase de grups');

  const isCurrentMatch = (matchTime: string) => {
    const now = new Date();
    const [startTime, endTime] = matchTime.split(/[–-]/);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const _now = new Date();
    const matchStart = new Date(_now.setHours(startHour, startMinute, 0));
    const matchEnd = new Date(_now.setHours(endHour, endMinute, 0));
    
    return now >= matchStart && now <= matchEnd;
  };

  return (
    <div className="overflow-x-auto sm:-mx-2 md:mx-0 flex flex-col items-center">
      <div className="w-[95%] mb-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <button 
            onClick={() => setIsFilterOpen(prev => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 text-gray-800"
          >
            <div className="flex items-center">
              <span className="font-medium">Filtre d'equips</span>
              {selectedTeams.length > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full ml-2 px-2 py-0.5">
                  {selectedTeams.length}
                </span>
              )}
            </div>
            {isFilterOpen 
              ? <ChevronUp className="w-4 h-4 text-gray-500" /> 
              : <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </button>
          
          {isFilterOpen && (
            <div className="p-4">
              <div className="flex items-center mb-4">
                <button 
                  onClick={clearFilters}
                  className="w-full text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-l hover:bg-blue-100"
                >
                  Netejar tot
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {allTeams.map(team => {
                  const isSelected = selectedTeams.includes(team);
                  return (
                    <div 
                      key={team} 
                      className={`flex items-center p-1 rounded ${isSelected ? 'bg-blue-100' : ''}`}
                    >
                      <input
                        type="checkbox"
                        id={`team-${team}`}
                        checked={isSelected}
                        onChange={() => handleTeamToggle(team)}
                        className="mr-2 h-4 w-4 text-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`team-${team}`} className="text-sm cursor-pointer truncate">
                        {team}
                      </label>
                      {isSelected && (
                        <button 
                          onClick={() => handleTeamToggle(team)}
                          className="ml-auto text-blue-600"
                          aria-label={`Remove ${team}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <table className="w-[95%] bg-white rounded-lg shadow-md table-fixed">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="px-1 sm:px-4 py-0.5 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-left w-[25%] sm:w-auto">Hora</th>
            <th className="px-1 sm:px-4 py-0.5 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-left w-[15%] sm:w-auto">Pista</th>
            <th className="px-1 sm:px-4 py-0.5 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-left w-[45%] sm:w-auto md:w-[50%]">Partit</th>
            <th className="px-1 sm:px-4 py-0.5 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center w-[15%] sm:w-auto">Resultat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {allMatchesArray.map((match, index) => {
            // Add notification banner before the first knockout match
            const showBanner = !groupsCompleted && index === firstKnockoutIndex;
            
            return (
              <React.Fragment key={match.id ?? `${match.phase}-${index}`}>
                {showBanner && (
                  <tr>
                    <td colSpan={4} className="px-1 sm:px-4 py-1 sm:py-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-1 sm:p-3 md:p-4">
                        <p className="text-yellow-700 text-center text-xs sm:text-sm">
                          Els equips mostrats a sota són una estimació basada en la classificació actual dels grups
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                <tr key={index} className="hover:bg-gray-50">
                  <td className={`px-1 sm:px-4 py-0.5 sm:py-3 whitespace-nowrap text-xs sm:text-base leading-tight ${isCurrentMatch(match.time) ? 'font-bold' : ''}`}>{match.time}</td>
                  <td className={`px-1 sm:px-4 py-0.5 sm:py-3 whitespace-nowrap text-xs sm:text-base leading-tight ${isCurrentMatch(match.time) ? 'font-bold' : ''}`}>Pista {match.field}</td>
                  <td className={`px-1 sm:px-4 py-0.5 sm:py-3 leading-tight truncate ${isCurrentMatch(match.time) ? 'font-bold' : ''}`}>
                    {match.description && <span className="text-xs text-gray-500 block leading-none">{match.description}</span>}
                    <span className={`text-2xs sm:text-xs md:text-base ${!groupsCompleted && (match.team1Source || match.team2Source) ? 'text-yellow-600' : ''}`}>
                      {getMatchTeams(match)}
                    </span>
                    <span className="text-2xs text-gray-500 leading-none block">{match.phase}</span>
                  </td>
                  <td className="px-1 sm:px-4 py-0.5 sm:py-3 text-center whitespace-nowrap text-xs sm:text-base leading-tight">{getMatchStatus(match)}</td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
