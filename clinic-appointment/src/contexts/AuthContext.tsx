import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored auth state on component mount
    const storedUser = localStorage.getItem('clinicUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('clinicUser');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Fetch users data
      const response = await fetch('/data/users.json');
      const data = await response.json();
      
      // Combine all users from different roles
      const allUsers = [
        ...data.patients,
        ...data.doctors,
        ...data.receptionists
      ];
      
      // Find user with matching credentials
      const foundUser = allUsers.find(
        (u: User) => u.email === email && u.password === password
      );
      
      if (foundUser) {
        // Remove password from user object before storing
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword as User);
        setIsAuthenticated(true);
        localStorage.setItem('clinicUser', JSON.stringify(userWithoutPassword));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('clinicUser');
  };

  const register = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      // For now, we'll just simulate successful registration
      const newUser: User = {
        ...userData,
        id: `${userData.role}_${Date.now()}`
      };
      
      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword as User);
      setIsAuthenticated(true);
      localStorage.setItem('clinicUser', JSON.stringify(userWithoutPassword));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const value: AuthState = {
    user,
    isAuthenticated,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
