import React, { useMemo } from 'react';
import BarChart from 'lucide-react/dist/esm/icons/bar-chart';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import { useMatches } from '../context/MatchContext';
import { groups } from '../data/tournament';
import { calculateGroupStandings } from '../utils/knockoutUtils';

// Custom type for team statistics with category
interface TeamStat {
  team: string;
  value: number;
  group: number;
}

export const Statistics: React.FC = () => {
  const { matches } = useMatches();
  
  // Calculate all team statistics using the existing utility function
  const teamStats = useMemo(() => {
    return calculateGroupStandings(groups, matches);
  }, [matches]);

  // Derive specific statistics
  const statsCategories = useMemo(() => {
    // Sort teams by different metrics
    const mostGoalsScored = [...teamStats]
      .sort((a, b) => b.goalsFor - a.goalsFor)
      .slice(0, 5)
      .map(team => ({
        team: team.name,
        value: team.goalsFor,
        group: team.group
      }));
      
    const mostGoalsConceded = [...teamStats]
      .sort((a, b) => b.goalsAgainst - a.goalsAgainst)
      .slice(0, 5)
      .map(team => ({
        team: team.name,
        value: team.goalsAgainst,
        group: team.group
      }));
      
    const bestGoalDifference = [...teamStats]
      .sort((a, b) => (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
      .slice(0, 5)
      .map(team => ({
        team: team.name,
        value: team.goalsFor - team.goalsAgainst,
        group: team.group
      }));

    const mostPoints = [...teamStats]
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map(team => ({
        team: team.name,
        value: team.points,
        group: team.group
      }));

    const mostWins = [...teamStats]
      .sort((a, b) => b.won - a.won)
      .slice(0, 5)
      .map(team => ({
        team: team.name,
        value: team.won,
        group: team.group
      }));

    return {
      mostGoalsScored,
      mostGoalsConceded,
      bestGoalDifference,
      mostPoints,
      mostWins
    };
  }, [teamStats]);

  // Helper function to render a stat card
  const renderStatCard = (title: string, stats: TeamStat[], valueSuffix: string = '') => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white p-3 flex items-center">
        <BarChart className="w-5 h-5 mr-2" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="p-4">
        <ol className="space-y-3">
          {stats.map((stat, index) => (
            <li key={stat.team} className="flex items-center justify-between">
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 font-semibold w-7 h-7 rounded-full flex items-center justify-center mr-3">
                  {index + 1}
                </span>
                <div>
                  <span className="font-medium">{stat.team}</span>
                  <span className="text-xs text-gray-500 block">Grup {stat.group}</span>
                </div>
              </div>
              <span className="font-bold text-lg">{stat.value}{valueSuffix}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
          Estadístiques del Torneig
        </h2>
        <p className="text-gray-600 mt-2">
          Resum dels millors equips del torneig en diverses categories
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderStatCard('Equips amb més gols', statsCategories.mostGoalsScored)}
        {renderStatCard('Equips amb més gols encaixats', statsCategories.mostGoalsConceded)}
        {renderStatCard('Equips amb millor diferència', statsCategories.bestGoalDifference, 
          statsCategories.bestGoalDifference[0]?.value > 0 ? '+' : '')}
        {renderStatCard('Equips amb més punts', statsCategories.mostPoints, 'pts')}
        {renderStatCard('Equips amb més victòries', statsCategories.mostWins)}
      </div>
    </div>
  );
}; 