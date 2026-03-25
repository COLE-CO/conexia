import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  getMe,
  logout as logoutService,
  type UserProfile,
} from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginState: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  patchUser: (changes: Partial<UserProfile>) => void;
  setUser: (nextUser: UserProfile | null) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      console.error('Error validating session:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const loginState = async (token: string) => {
    localStorage.setItem('token', token);
    await fetchUser();
  };

  const patchUser = useCallback((changes: Partial<UserProfile>) => {
    setUser((currentUser) =>
      currentUser ? { ...currentUser, ...changes } : currentUser
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginState,
        logout,
        refreshUser: fetchUser,
        patchUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
