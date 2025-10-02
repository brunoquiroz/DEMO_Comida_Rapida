import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, isAuthenticated, isAdmin } from '../services/auth';

interface User {
  id: number;
  username: string;
  isStaff: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdminUser: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = () => {
    const isLoggedIn = isAuthenticated();
    setIsLoggedIn(isLoggedIn);
    
    const isAdminUser = isAdmin();
    setIsAdminUser(isAdminUser);
    
    if (isLoggedIn) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (e) {
          console.error('Error parsing user data:', e);
          // Limpiar datos corruptos
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setIsAdminUser(false);
          setUser(null);
        }
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar la aplicación
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiLogin(username, password);
      setUser({
        id: response.user_id,
        username: response.username,
        isStaff: response.is_staff
      });
      setIsLoggedIn(true);
      setIsAdminUser(response.is_staff);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiLogout();
      setUser(null);
      setIsLoggedIn(false);
      setIsAdminUser(false);
    } catch (error) {
      console.error('Error during logout:', error);
      // Aún así, limpiar el estado local
      setUser(null);
      setIsLoggedIn(false);
      setIsAdminUser(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn, 
      isAdminUser, 
      isLoading, 
      login, 
      logout, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};