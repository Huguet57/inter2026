import React, { useState } from 'react';
import { KnockoutMatches, Match, groups } from '../data/tournament';
import Play from 'lucide-react/dist/esm/icons/play';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Minus from 'lucide-react/dist/esm/icons/minus';
import Loader from 'lucide-react/dist/esm/icons/loader';
import Lock from 'lucide-react/dist/esm/icons/lock';
import { useMatches } from '../context/useMatches';
import { useAuth } from '../context/useAuth';
import {
  calculateGroupStandings,
  getSeedMap,
  resolveKnockoutMatchTeams,
  SeededTeam,
  seedQualifiedTeams,
} from '../utils/knockoutUtils';

interface MatchControlProps {
  match: Match;
  onUpdate: (updates: Partial<Match>) => void;
  seedMap?: Record<number, SeededTeam>;
  allMatches?: {
    groupMatches: Match[],
    knockoutMatches: KnockoutMatches
  };
  groupsCompleted?: boolean;
  isKnockoutStage?: boolean;
}

const MatchControl: React.FC<MatchControlProps> = ({ 
  match, 
  onUpdate, 
  seedMap = {}, 
  allMatches,
  groupsCompleted = true,
  isKnockoutStage = false
}) => {
  const getMatchState = (match: Match) => {
    if (match.isPlaying) return 'playing';
    if (match.score1 !== undefined || match.score2 !== undefined) return 'finished';
    return 'pending';
  };

  const handleScoreChange = (
    team: 1 | 2,
    value: number | string,
    type: 'set' | 'increment'
  ) => {
    const key = team === 1 ? 'score1' : 'score2';
    const otherKey = team === 1 ? 'score2' : 'score1';
    let newValue: number;
    
    if (type === 'set') {
      newValue = typeof value === 'string' ? parseInt(value) || 0 : value;
      onUpdate({ [key]: newValue });
    } else {
      const currentValue = match[key] ?? 0;
      newValue = Math.max(0, currentValue + (value as number));
      
      // Check if match is in pending state
      const isPending = match.isPlaying === false && match.score1 === undefined && match.score2 === undefined;
      
      // If we're incrementing and the other score is undefined, set it to 0
      if (match[otherKey] === undefined) {
        // If match is pending, set it to playing state
        if (isPending) {
          onUpdate({ [key]: newValue, [otherKey]: 0, isPlaying: true });
        } else {
          onUpdate({ [key]: newValue, [otherKey]: 0 });
        }
      } else {
        // If match is pending, set it to playing state
        if (isPending) {
          onUpdate({ [key]: newValue, isPlaying: true });
        } else {
          onUpdate({ [key]: newValue });
        }
      }
    }
  };

  const matchState = getMatchState(match);
  
  // Get teams to display
  let matchTeams = '';
  
  if (match.team1 && match.team2) {
    matchTeams = `${match.team1} - ${match.team2}`;
  } else if (allMatches) {
    // Intentar resoldre els equips d'aquest partit
    const resolved = resolveKnockoutMatchTeams(match, seedMap, allMatches);
    matchTeams = resolved || match.description || 'Per determinar';
  } else {
    matchTeams = match.description || 'Per determinar';
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500">{match.time}</span>
        <span className="text-sm font-medium text-gray-500">Pista {match.field}</span>
      </div>
      
      <div className="text-center space-y-1">
        {match.description && <div className="text-sm text-gray-600">{match.description}</div>}
        <div className={`font-bold ${isKnockoutStage && !groupsCompleted ? 'text-yellow-600' : ''}`}>
          {matchTeams}
        </div>
      </div>

      <div className="flex justify-center items-center space-x-4 sm:space-x-6">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => handleScoreChange(1, -1, 'increment')}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <input
            type="number"
            min="0"
            value={match.score1 ?? ''}
            onChange={(e) => handleScoreChange(1, e.target.value, 'set')}
            className="w-14 sm:w-16 text-center border rounded-md py-1.5 sm:py-2 text-base sm:text-lg font-medium"
            placeholder="-"
          />
          
          <button
            onClick={() => handleScoreChange(1, 1, 'increment')}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <span className="font-bold text-xl">-</span>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => handleScoreChange(2, -1, 'increment')}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <input
            type="number"
            min="0"
            value={match.score2 ?? ''}
            onChange={(e) => handleScoreChange(2, e.target.value, 'set')}
            className="w-14 sm:w-16 text-center border rounded-md py-1.5 sm:py-2 text-base sm:text-lg font-medium"
            placeholder="-"
          />
          
          <button
            onClick={() => handleScoreChange(2, 1, 'increment')}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div className="flex justify-center space-x-2 sm:space-x-3">
        <button
          onClick={() => onUpdate({ 
            isPlaying: false,
            score1: undefined,
            score2: undefined
          })}
          className={`px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base rounded-md flex items-center space-x-1.5 sm:space-x-2 transition-all ${
            matchState === 'pending'
              ? 'bg-gray-800 text-white ring-2 ring-gray-800 shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Per jugar</span>
        </button>
        
        <button
          onClick={() => onUpdate({ 
            isPlaying: true,
            score1: match.score1 ?? 0,
            score2: match.score2 ?? 0
          })}
          className={`px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base rounded-md flex items-center space-x-1.5 sm:space-x-2 transition-all ${
            matchState === 'playing'
              ? 'bg-yellow-500 text-white ring-2 ring-yellow-500 shadow-md'
              : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
          }`}
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>En joc</span>
        </button>
        
        <button
          onClick={() => onUpdate({ 
            isPlaying: false,
            score1: match.score1 ?? 0,
            score2: match.score2 ?? 0
          })}
          className={`px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base rounded-md flex items-center space-x-1.5 sm:space-x-2 transition-all ${
            matchState === 'finished'
              ? 'bg-green-600 text-white ring-2 ring-green-600 shadow-md'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
          }`}
        >
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Acabat</span>
        </button>
      </div>
    </div>
  );
};

export const RefereeMatchControl: React.FC = () => {
  const { matches, updateMatch, knockoutMatches, updateKnockoutMatch, loading } = useMatches();
  const { isReferee, loading: authLoading, login, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(password);

    if (result.ok) {
      setError('');
      setPassword('');
    } else {
      setError(result.error ?? 'Contrasenya incorrecta');
    }
  };

  const qualifiedTeams = calculateGroupStandings(groups, matches);
  const seedMap = getSeedMap(seedQualifiedTeams(qualifiedTeams));
  
  const allMatches = {
    groupMatches: matches,
    knockoutMatches
  };

  // Comprovar si tots els partits de grups s'han completat
  const groupsCompleted = matches.every(m => 
    m.score1 !== undefined && m.score2 !== undefined && !m.isPlaying
  );

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Carregant dades del torneig...</p>
      </div>
    );
  }

  if (!isReferee) {
    return (
      <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Àrea d'Àrbitres</h2>
        </div>
        
        <p className="mb-6 text-gray-600 text-center">
          Aquesta secció és només per àrbitres. Si ets àrbitre, introdueix la contrasenya.
        </p>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contrasenya
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introdueix la contrasenya"
              autoComplete="off"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {authLoading ? 'Validant...' : 'Accedir'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Control d'Àrbitre</h1>
        <button 
          onClick={logout}
          className="px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Tancar sessió
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Fase de Grups</h2>
        <div className="grid gap-4 grid-cols-1">
          {matches.map((match, index) => (
            <MatchControl
              key={index}
              match={match}
              onUpdate={(updates) => updateMatch(index, updates)}
              seedMap={seedMap}
              allMatches={allMatches}
              groupsCompleted={groupsCompleted}
              isKnockoutStage={false}
            />
          ))}
        </div>
      </div>

      {!groupsCompleted && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">
            Els equips mostrats a les eliminatòries són una estimació basada en la classificació actual dels grups
          </p>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">14ens de Final</h2>
        <div className="grid gap-4 grid-cols-1">
          {knockoutMatches.roundOf16.map((match, index) => (
            <MatchControl
              key={index}
              match={match}
              onUpdate={(updates) => updateKnockoutMatch('roundOf16', index, updates)}
              seedMap={seedMap}
              allMatches={allMatches}
              groupsCompleted={groupsCompleted}
              isKnockoutStage={true}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Quarts de Final</h2>
        <div className="grid gap-4 grid-cols-1">
          {knockoutMatches.quarterFinals.map((match, index) => (
            <MatchControl
              key={index}
              match={match}
              onUpdate={(updates) => updateKnockoutMatch('quarterFinals', index, updates)}
              seedMap={seedMap}
              allMatches={allMatches}
              groupsCompleted={groupsCompleted}
              isKnockoutStage={true}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Semifinals</h2>
        <div className="grid gap-4 grid-cols-1">
          {knockoutMatches.semiFinals.map((match, index) => (
            <MatchControl
              key={index}
              match={match}
              onUpdate={(updates) => updateKnockoutMatch('semiFinals', index, updates)}
              seedMap={seedMap}
              allMatches={allMatches}
              groupsCompleted={groupsCompleted}
              isKnockoutStage={true}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">3r i 4t Lloc</h2>
        <div className="grid gap-4 grid-cols-1">
          <MatchControl
            match={knockoutMatches.thirdPlace}
            onUpdate={(updates) => updateKnockoutMatch('thirdPlace', 0, updates)}
            seedMap={seedMap}
            allMatches={allMatches}
            groupsCompleted={groupsCompleted}
            isKnockoutStage={true}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Final</h2>
        <div className="grid gap-4 grid-cols-1">
          <MatchControl
            match={knockoutMatches.final}
            onUpdate={(updates) => updateKnockoutMatch('final', 0, updates)}
            seedMap={seedMap}
            allMatches={allMatches}
            groupsCompleted={groupsCompleted}
            isKnockoutStage={true}
          />
        </div>
      </div>
    </div>
  );
}; 
