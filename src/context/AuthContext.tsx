import React, { createContext, useEffect, useState, ReactNode } from 'react';

import { buildApiUrl } from '../config';

export interface AuthContextType {
  isReferee: boolean;
  loading: boolean;
  login: (password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: (options?: { localOnly?: boolean }) => Promise<void>;
  handleUnauthorized: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isReferee, setIsReferee] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await fetch(buildApiUrl('/api/auth/session'), {
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }

        const data = (await response.json()) as { isReferee?: boolean };

        if (!cancelled) {
          setIsReferee(Boolean(data.isReferee));
        }
      } catch (error) {
        console.error('Error fetching auth session:', error);

        if (!cancelled) {
          setIsReferee(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (password: string) => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ error: 'No s\'ha pogut iniciar sessió' }))) as {
          error?: string;
        };

        setIsReferee(false);

        return {
          ok: false,
          error: payload.error === 'Invalid password' ? 'Contrasenya incorrecta' : payload.error,
        };
      }

      const payload = (await response.json()) as { isReferee?: boolean };
      const nextIsReferee = Boolean(payload.isReferee);
      setIsReferee(nextIsReferee);

      return { ok: nextIsReferee };
    } catch (error) {
      console.error('Error logging in referee:', error);
      setIsReferee(false);

      return {
        ok: false,
        error: 'No s\'ha pogut iniciar sessió',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (options?: { localOnly?: boolean }) => {
    if (!options?.localOnly) {
      try {
        await fetch(buildApiUrl('/api/auth/logout'), {
          method: 'POST',
          credentials: 'same-origin',
        });
      } catch (error) {
        console.error('Error logging out referee:', error);
      }
    }

    setIsReferee(false);
  };

  const handleUnauthorized = () => {
    setIsReferee(false);
  };

  return (
    <AuthContext.Provider value={{ isReferee, loading, login, logout, handleUnauthorized }}>
      {children}
    </AuthContext.Provider>
  );
};
