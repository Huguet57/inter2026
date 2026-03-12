import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isReferee: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isReferee, setIsReferee] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    const refereeStatus = localStorage.getItem('isReferee');
    if (refereeStatus === 'true') {
      setIsReferee(true);
    }
  }, []);

  const login = () => {
    localStorage.setItem('isReferee', 'true');
    setIsReferee(true);
  };

  const logout = () => {
    localStorage.removeItem('isReferee');
    setIsReferee(false);
  };

  return (
    <AuthContext.Provider value={{ isReferee, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 