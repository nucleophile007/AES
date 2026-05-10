"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { AuthUser } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEFAULT_REFRESH_INTERVAL_SECONDS = 240;
const MIN_REFRESH_INTERVAL_SECONDS = 30;

function resolveRequestUrl(input: RequestInfo | URL): URL | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    if (typeof input === 'string') {
      return new URL(input, window.location.origin);
    }

    if (input instanceof URL) {
      return input;
    }

    if (input instanceof Request) {
      return new URL(input.url, window.location.origin);
    }
  } catch (error) {
    console.error('Failed to parse request URL for auth refresh handling:', error);
  }

  return null;
}

function shouldAttemptSessionRecovery(input: RequestInfo | URL): boolean {
  const requestUrl = resolveRequestUrl(input);
  if (!requestUrl) {
    return false;
  }

  if (requestUrl.origin !== window.location.origin) {
    return false;
  }

  if (!requestUrl.pathname.startsWith('/api/')) {
    return false;
  }

  return !['/api/auth/refresh', '/api/auth/login', '/api/auth/logout'].includes(requestUrl.pathname);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const baseFetchRef = useRef<typeof window.fetch | null>(null);
  const refreshInFlightRef = useRef<Promise<boolean> | null>(null);

  const tryRefreshSession = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const refreshPromise = (async () => {
      const fetchImpl = baseFetchRef.current ?? window.fetch.bind(window);

      try {
        const refreshResponse = await fetchImpl('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });

        if (!refreshResponse.ok) {
          return false;
        }

        const data = await refreshResponse.json().catch(() => null);
        if (data?.success && data?.user) {
          setUser(data.user);
        }

        return true;
      } catch (error) {
        console.error('Session refresh failed:', error);
        return false;
      } finally {
        refreshInFlightRef.current = null;
      }
    })();

    refreshInFlightRef.current = refreshPromise;
    return refreshPromise;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!baseFetchRef.current) {
      baseFetchRef.current = window.fetch.bind(window);
    }

    const originalFetch = baseFetchRef.current;

    window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const firstAttemptInput = input instanceof Request ? input.clone() : input;
      let response = await originalFetch(firstAttemptInput as RequestInfo | URL, init);

      if (response.status !== 401 || !shouldAttemptSessionRecovery(input)) {
        return response;
      }

      const refreshed = await tryRefreshSession();
      if (!refreshed) {
        return response;
      }

      const retryInput = input instanceof Request ? input.clone() : input;
      response = await originalFetch(retryInput as RequestInfo | URL, init);
      return response;
    }) as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, [tryRefreshSession]);

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

  useEffect(() => {
    if (!user) {
      return;
    }

    const configuredIntervalSeconds = Number(
      process.env.NEXT_PUBLIC_AUTH_REFRESH_INTERVAL_SECONDS ?? DEFAULT_REFRESH_INTERVAL_SECONDS
    );
    const normalizedIntervalSeconds =
      Number.isFinite(configuredIntervalSeconds) && configuredIntervalSeconds > 0
        ? Math.floor(configuredIntervalSeconds)
        : DEFAULT_REFRESH_INTERVAL_SECONDS;
    const intervalMs = Math.max(normalizedIntervalSeconds, MIN_REFRESH_INTERVAL_SECONDS) * 1000;

    const refreshOnActivity = () => {
      void tryRefreshSession();
    };

    const refreshOnVisibility = () => {
      if (document.visibilityState === 'visible') {
        void tryRefreshSession();
      }
    };

    const intervalId = window.setInterval(refreshOnActivity, intervalMs);
    window.addEventListener('focus', refreshOnActivity);
    document.addEventListener('visibilitychange', refreshOnVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshOnActivity);
      document.removeEventListener('visibilitychange', refreshOnVisibility);
    };
  }, [user, tryRefreshSession]);

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
  const { user, isLoading, refreshUser } = useAuth();
  const hasAttemptedRecoveryRef = useRef(false);
  
  useEffect(() => {
    if (!isLoading && !user) {
      if (!hasAttemptedRecoveryRef.current) {
        hasAttemptedRecoveryRef.current = true;
        void refreshUser();
        return;
      }

      const redirectTimer = window.setTimeout(() => {
        // Redirect to login only after one recovery attempt.
        window.location.href = '/';
      }, 1200);

      return () => {
        window.clearTimeout(redirectTimer);
      };
    } else if (!isLoading && user && requiredRole && user.role !== requiredRole) {
      hasAttemptedRecoveryRef.current = false;
      // Redirect to appropriate dashboard if wrong role
      const redirectTo = user.role === 'teacher'
        ? '/teacher-dashboard'
        : user.role === 'student'
        ? '/student-dashboard'
        : '/parent-dashboard';
      window.location.href = redirectTo;
    } else if (!isLoading && user) {
      hasAttemptedRecoveryRef.current = false;
    }
  }, [user, isLoading, requiredRole, refreshUser]);

  return { user, isLoading };
}
