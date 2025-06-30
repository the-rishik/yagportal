import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAdvisor: boolean;
  isStaff: boolean;
  isStudent: boolean;
  hasStudentAccess: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (user?.mustChangePassword) {
      navigate('/account');
    }
  }, [user, navigate]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiService.register(userData);
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isAdvisor = user?.role === 'advisor';
  const isStaff = user?.role === 'staff';
  const isStudent = user?.role === 'user';
  const hasStudentAccess = isStudent || isAdvisor || isStaff; // Advisors and staff have same access as students

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAdvisor,
    isStaff,
    isStudent,
    hasStudentAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 