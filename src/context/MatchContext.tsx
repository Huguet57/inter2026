import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  Match,
  KnockoutMatches,
  KnockoutRoundKey,
  groupMatches as initialGroupMatches,
  knockoutMatches as initialKnockoutMatches,
} from '../data/tournament';
import { buildApiUrl } from '../config';

const cloneMatches = (matches: Match[]): Match[] => matches.map((match) => ({ ...match }));

const cloneKnockoutMatches = (matches: KnockoutMatches): KnockoutMatches => ({
  roundOf16: cloneMatches(matches.roundOf16),
  quarterFinals: cloneMatches(matches.quarterFinals),
  semiFinals: cloneMatches(matches.semiFinals),
  thirdPlace: { ...matches.thirdPlace },
  final: { ...matches.final },
});

const normalizeKnockoutMatches = (knockoutData?: Partial<KnockoutMatches>): KnockoutMatches => ({
  roundOf16: Array.isArray(knockoutData?.roundOf16)
    ? cloneMatches(knockoutData.roundOf16)
    : cloneMatches(initialKnockoutMatches.roundOf16),
  quarterFinals: Array.isArray(knockoutData?.quarterFinals)
    ? cloneMatches(knockoutData.quarterFinals)
    : cloneMatches(initialKnockoutMatches.quarterFinals),
  semiFinals: Array.isArray(knockoutData?.semiFinals)
    ? cloneMatches(knockoutData.semiFinals)
    : cloneMatches(initialKnockoutMatches.semiFinals),
  thirdPlace: knockoutData?.thirdPlace
    ? { ...knockoutData.thirdPlace }
    : { ...initialKnockoutMatches.thirdPlace },
  final: knockoutData?.final
    ? { ...knockoutData.final }
    : { ...initialKnockoutMatches.final },
});

interface MatchContextType {
  matches: Match[];
  knockoutMatches: KnockoutMatches;
  updateMatch: (index: number, updates: Partial<Match>) => void;
  updateKnockoutMatch: (round: KnockoutRoundKey, index: number, updates: Partial<Match>) => void;
  loading: boolean;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>(() => cloneMatches(initialGroupMatches));
  const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatches>(() =>
    cloneKnockoutMatches(initialKnockoutMatches),
  );
  const [loading, setLoading] = useState(true);

  // Fetch data from API on initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch group matches
        const matchesResponse = await fetch(buildApiUrl('/api/matches'));
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          if (Array.isArray(matchesData)) {
            setMatches(matchesData);
          }
        }
        
        // Fetch knockout matches
        const knockoutResponse = await fetch(buildApiUrl('/api/knockout'));
        if (knockoutResponse.ok) {
          const knockoutData = await knockoutResponse.json();
          if (knockoutData) {
            setKnockoutMatches(normalizeKnockoutMatches(knockoutData));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update a group match
  const updateMatch = async (index: number, updates: Partial<Match>) => {
    try {
      const previousMatches = matches;

      // Optimistically update UI
      const newMatches = cloneMatches(matches);
      newMatches[index] = { ...newMatches[index], ...updates };
      setMatches(newMatches);
      
      // Send update to API
      const response = await fetch(buildApiUrl(`/api/matches/${index}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        console.error('Failed to update match');
        // Revert to original state if API update fails
        setMatches(previousMatches);
      }
    } catch (error) {
      console.error('Error updating match:', error);
      // Revert to original state on error
      setMatches(matches);
    }
  };

  // Update a knockout match
  const updateKnockoutMatch = async (
    round: KnockoutRoundKey,
    index: number,
    updates: Partial<Match>
  ) => {
    try {
      // Optimistically update UI
      setKnockoutMatches(prev => {
        if (round === 'thirdPlace' || round === 'final') {
          return {
            ...prev,
            [round]: { ...prev[round], ...updates }
          };
        }
        
        const newRound = [...prev[round]];
        newRound[index] = { ...newRound[index], ...updates };
        return {
          ...prev,
          [round]: newRound
        };
      });
      
      // Send update to API
      const response = await fetch(buildApiUrl(`/api/knockout/${round}/${index}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        console.error('Failed to update knockout match');
        // You could revert the state here if needed
      }
    } catch (error) {
      console.error('Error updating knockout match:', error);
      // You could revert the state here if needed
    }
  };

  return (
    <MatchContext.Provider value={{ matches, knockoutMatches, updateMatch, updateKnockoutMatch, loading }}>
      {children}
    </MatchContext.Provider>
  );
};

export const useMatches = () => {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatches must be used within a MatchProvider');
  }
  return context;
}; 
