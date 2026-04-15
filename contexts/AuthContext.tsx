"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tryRefreshSession = useCallback(async () => {
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    return refreshResponse.ok;
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      let response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.status === 401) {
        const refreshed = await tryRefreshSession();
        if (refreshed) {
          response = await fetch('/api/auth/me', {
            credentials: 'include'
          });
        }
      }
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [tryRefreshSession]);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        return { success: true, redirectTo: data.redirectTo };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state even if API call fails
      setUser(null);
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for checking if user has required role
export function useRequireAuth(requiredRole?: 'teacher' | 'student' | 'parent') {
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      window.location.href = '/';
    } else if (!isLoading && user && requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate dashboard if wrong role
      const redirectTo = user.role === 'teacher'
        ? '/teacher-dashboard'
        : user.role === 'student'
        ? '/student-dashboard'
        : '/parent-dashboard';
      window.location.href = redirectTo;
    }
  }, [user, isLoading, requiredRole]);

  return { user, isLoading };
}