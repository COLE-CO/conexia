import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getMe, logout as logoutService } from '../services/authService';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  must_change_password: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginState: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginState,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
