import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { UserProfile, AuthAuditLog, AuthState } from '@/types/auth';
import { authService } from '@/services/authService';
import { databaseService } from '@/services/databaseService';
import { ENV_CONFIG } from '@/config/env';

// Ensure web browser completes redirect callbacks
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType extends AuthState {
  allowedDomain: string;
  auditLogs: AuthAuditLog[];
  registeredUsers: UserProfile[];
  isGoogleAuthConfigured: boolean;
  loginWithGoogle: (simulatedEmail?: string) => Promise<boolean>;
  triggerLiveGoogleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateAllowedDomain: (newDomain: string) => Promise<void>;
  refreshData: () => Promise<void>;
  clearAuditLogs: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allowedDomain, setAllowedDomain] = useState<string>(ENV_CONFIG.DEFAULT_ALLOWED_DOMAIN);
  const [auditLogs, setAuditLogs] = useState<AuthAuditLog[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);

  const isGoogleAuthConfigured = Boolean(
    ENV_CONFIG.GOOGLE.WEB_CLIENT_ID ||
    ENV_CONFIG.GOOGLE.IOS_CLIENT_ID ||
    ENV_CONFIG.GOOGLE.ANDROID_CLIENT_ID
  );

  // Setup Expo Google Auth Request (for live Google Sign-In when configured)
  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: ENV_CONFIG.GOOGLE.WEB_CLIENT_ID || 'dummy-client-id-for-preview.apps.googleusercontent.com',
    iosClientId: ENV_CONFIG.GOOGLE.IOS_CLIENT_ID || undefined,
    androidClientId: ENV_CONFIG.GOOGLE.ANDROID_CLIENT_ID || undefined,
    scopes: ['openid', 'profile', 'email'],
  });

  // Load persisted session and audit records on mount
  const refreshData = useCallback(async () => {
    try {
      const [storedUser, storedLogs, storedUsers, configuredDomain] = await Promise.all([
        databaseService.getCurrentUser(),
        databaseService.getAuditLogs(),
        databaseService.getAllUsers(),
        databaseService.getAllowedDomain(ENV_CONFIG.DEFAULT_ALLOWED_DOMAIN),
      ]);

      setUser(storedUser);
      setAuditLogs(storedLogs);
      setRegisteredUsers(storedUsers);
      setAllowedDomain(configuredDomain);
    } catch (e) {
      console.error('[AuthProvider] Failed to load initial state:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const [storedUser, storedLogs, storedUsers, configuredDomain] = await Promise.all([
          databaseService.getCurrentUser(),
          databaseService.getAuditLogs(),
          databaseService.getAllUsers(),
          databaseService.getAllowedDomain(ENV_CONFIG.DEFAULT_ALLOWED_DOMAIN),
        ]);

        if (isMounted) {
          setUser(storedUser);
          setAuditLogs(storedLogs);
          setRegisteredUsers(storedUsers);
          setAllowedDomain(configuredDomain);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('[AuthProvider] Failed to load initial state:', e);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLiveGoogleResponse = useCallback(async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const googleInfo = await authService.fetchGoogleUserInfo(accessToken);
      const result = await authService.processGoogleUser(
        {
          id: googleInfo.sub,
          email: googleInfo.email,
          name: googleInfo.name || googleInfo.email,
          picture: googleInfo.picture,
          token: accessToken,
        },
        allowedDomain,
        'google-oauth'
      );

      if (result.success && result.user) {
        setUser(result.user);
        setError(null);
      } else {
        setUser(null);
        setError(result.error || 'Access restricted. Please login using your official domain email.');
      }
      await refreshData();
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate with Google.');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [allowedDomain, refreshData]);

  // Handle OAuth response from Google live flow
  useEffect(() => {
    if (!response) return;

    if (response.type === 'success' && response.authentication?.accessToken) {
      const token = response.authentication.accessToken;
      const timer = setTimeout(() => {
        handleLiveGoogleResponse(token);
      }, 0);
      return () => clearTimeout(timer);
    } else if (response.type === 'error') {
      const timer = setTimeout(() => {
        setError('Google Sign-In failed or was cancelled.');
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [response, handleLiveGoogleResponse]);

  /**
   * Main login handler.
   * If simulatedEmail is provided (or when Google Cloud keys are not provided),
   * runs the domain validation and authentication pipeline directly.
   */
  const loginWithGoogle = async (simulatedEmail?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate realistic network delay for authentic UI feel
      await new Promise(resolve => setTimeout(resolve, 600));

      const targetEmail = simulatedEmail || `user@${allowedDomain}`;
      const result = await authService.simulateGoogleSignIn(targetEmail, allowedDomain);

      if (result.success && result.user) {
        setUser(result.user);
        setError(null);
        await refreshData();
        return true;
      } else {
        setUser(null);
        setError(result.error || 'Access restricted. Please login using your official domain email.');
        await refreshData();
        return false;
      }
    } catch (e: any) {
      const msg = e?.message || 'Authentication error occurred.';
      setError(msg);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Trigger live Google OAuth prompt
   */
  const triggerLiveGoogleLogin = async () => {
    setError(null);
    if (!isGoogleAuthConfigured) {
      // If no client ID configured yet, execute default domain test or guide user
      await loginWithGoogle(`member@${allowedDomain}`);
      return;
    }

    try {
      setIsLoading(true);
      await promptAsync();
    } catch (err: any) {
      setError(err?.message || 'Could not open Google authentication prompt.');
      setIsLoading(false);
    }
  };

  /**
   * Sign out and clear active session
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const updateAllowedDomain = async (newDomain: string) => {
    const cleanDomain = newDomain.trim().toLowerCase();
    setAllowedDomain(cleanDomain);
    await databaseService.setAllowedDomain(cleanDomain);
    await refreshData();
  };

  const clearAuditLogs = async () => {
    await databaseService.clearAuditLogs();
    setAuditLogs([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        allowedDomain,
        auditLogs,
        registeredUsers,
        isGoogleAuthConfigured,
        loginWithGoogle,
        triggerLiveGoogleLogin,
        logout,
        clearError,
        updateAllowedDomain,
        refreshData,
        clearAuditLogs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
