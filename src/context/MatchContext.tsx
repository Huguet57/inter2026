import React, { createContext, ReactNode, useEffect, useState } from 'react';

import {
  Match,
  KnockoutMatches,
  KnockoutRoundKey,
  groupMatches as initialGroupMatches,
  knockoutMatches as initialKnockoutMatches,
} from '../data/tournament';
import { buildApiUrl } from '../config';
import { useAuth } from './useAuth';

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
  updateMatch: (index: number, updates: Partial<Match>) => Promise<void>;
  updateKnockoutMatch: (round: KnockoutRoundKey, index: number, updates: Partial<Match>) => Promise<void>;
  loading: boolean;
}

export const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>(() => cloneMatches(initialGroupMatches));
  const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatches>(() =>
    cloneKnockoutMatches(initialKnockoutMatches),
  );
  const [loading, setLoading] = useState(true);
  const { handleUnauthorized } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        const matchesResponse = await fetch(buildApiUrl('/api/matches'));
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          if (!cancelled && Array.isArray(matchesData)) {
            setMatches(matchesData);
          }
        }

        const knockoutResponse = await fetch(buildApiUrl('/api/knockout'));
        if (knockoutResponse.ok) {
          const knockoutData = await knockoutResponse.json();
          if (!cancelled && knockoutData) {
            setKnockoutMatches(normalizeKnockoutMatches(knockoutData));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateMatch = async (index: number, updates: Partial<Match>) => {
    const previousMatches = cloneMatches(matches);
    const nextMatches = cloneMatches(matches);
    nextMatches[index] = { ...nextMatches[index], ...updates };
    setMatches(nextMatches);

    try {
      const response = await fetch(buildApiUrl(`/api/matches/${index}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(updates),
      });

      if (response.status === 401) {
        setMatches(previousMatches);
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        console.error('Failed to update match');
        setMatches(previousMatches);
      }
    } catch (error) {
      console.error('Error updating match:', error);
      setMatches(previousMatches);
    }
  };

  const updateKnockoutMatch = async (
    round: KnockoutRoundKey,
    index: number,
    updates: Partial<Match>,
  ) => {
    const previousKnockoutMatches = cloneKnockoutMatches(knockoutMatches);

    setKnockoutMatches((currentKnockoutMatches) => {
      if (round === 'thirdPlace' || round === 'final') {
        return {
          ...currentKnockoutMatches,
          [round]: { ...currentKnockoutMatches[round], ...updates },
        };
      }

      const nextRound = [...currentKnockoutMatches[round]];
      nextRound[index] = { ...nextRound[index], ...updates };

      return {
        ...currentKnockoutMatches,
        [round]: nextRound,
      };
    });

    try {
      const response = await fetch(buildApiUrl(`/api/knockout/${round}/${index}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(updates),
      });

      if (response.status === 401) {
        setKnockoutMatches(previousKnockoutMatches);
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        console.error('Failed to update knockout match');
        setKnockoutMatches(previousKnockoutMatches);
        return;
      }

      const payload = await response.json();
      if (payload) {
        setKnockoutMatches(normalizeKnockoutMatches(payload));
      }
    } catch (error) {
      console.error('Error updating knockout match:', error);
      setKnockoutMatches(previousKnockoutMatches);
    }
  };

  return (
    <MatchContext.Provider value={{ matches, knockoutMatches, updateMatch, updateKnockoutMatch, loading }}>
      {children}
    </MatchContext.Provider>
  );
};
