import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { UserProfile, AuthAuditLog, AuthState } from '@/types/auth';
import { authService } from '@/services/authService';
import { databaseService } from '@/services/databaseService';
import { ENV_CONFIG } from '@/config/env';

// Ensure web browser completes redirect callbacks on web
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType extends AuthState {
  allowedDomain: string;
  auditLogs: AuthAuditLog[];
  registeredUsers: UserProfile[];
  isGoogleAuthConfigured: boolean;
  redirectUri: string;
  loginWithGoogle: () => Promise<void>;
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

  // Determine active client ID for current platform
  const activeClientId = Platform.select({
    web: ENV_CONFIG.GOOGLE.WEB_CLIENT_ID,
    ios: ENV_CONFIG.GOOGLE.IOS_CLIENT_ID || ENV_CONFIG.GOOGLE.WEB_CLIENT_ID,
    android: ENV_CONFIG.GOOGLE.ANDROID_CLIENT_ID || ENV_CONFIG.GOOGLE.WEB_CLIENT_ID,
    default: ENV_CONFIG.GOOGLE.WEB_CLIENT_ID,
  });

  const isGoogleAuthConfigured = Boolean(
    activeClientId && activeClientId.trim().length > 5
  );

  // Determine active redirect URI for Web (window.location.origin)
  const webRedirectUri =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : undefined;

  // Setup Expo Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: activeClientId || 'unconfigured-client-id.apps.googleusercontent.com',
    iosClientId: ENV_CONFIG.GOOGLE.IOS_CLIENT_ID || undefined,
    androidClientId: ENV_CONFIG.GOOGLE.ANDROID_CLIENT_ID || undefined,
    webClientId: ENV_CONFIG.GOOGLE.WEB_CLIENT_ID || undefined,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: webRedirectUri,
  });

  // Refresh persisted data
  const refreshData = useCallback(async () => {
    try {
      const [storedLogs, storedUsers, configuredDomain] = await Promise.all([
        databaseService.getAuditLogs(),
        databaseService.getAllUsers(),
        databaseService.getAllowedDomain(ENV_CONFIG.DEFAULT_ALLOWED_DOMAIN),
      ]);

      setAuditLogs(storedLogs);
      setRegisteredUsers(storedUsers);
      setAllowedDomain(configuredDomain);
    } catch (e) {
      console.error('[AuthProvider] Failed to refresh data:', e);
    }
  }, []);

  // Initialize and validate stored session on startup
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const configuredDomain = await databaseService.getAllowedDomain(
          ENV_CONFIG.DEFAULT_ALLOWED_DOMAIN
        );
        const storedUser = await databaseService.getCurrentUser();

        // Strictly validate stored session: must have token, real google-oauth provider, and verified domain
        const validUser = await authService.validateStoredSession(storedUser, configuredDomain);

        const [storedLogs, storedUsers] = await Promise.all([
          databaseService.getAuditLogs(),
          databaseService.getAllUsers(),
        ]);

        if (isMounted) {
          setUser(validUser);
          setAuditLogs(storedLogs);
          setRegisteredUsers(storedUsers);
          setAllowedDomain(configuredDomain);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('[AuthProvider] Initialization error:', e);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle live Google OAuth response callback
  const handleLiveGoogleResponse = useCallback(
    async (accessToken: string, expiresIn?: number) => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch genuine profile directly from Google
        const googleInfo = await authService.fetchGoogleUserInfo(accessToken);

        // Process profile: enforces email_verified === true and domain matching @hbplus.fit
        const result = await authService.processGoogleOAuthUser(
          googleInfo,
          accessToken,
          allowedDomain,
          expiresIn
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
        setUser(null);
        setError(err?.message || 'Google authentication failed.');
      } finally {
        setIsLoading(false);
      }
    },
    [allowedDomain, refreshData]
  );

  // Monitor OAuth response from Google prompt
  useEffect(() => {
    if (!response) return;

    if (response.type === 'success' && response.authentication?.accessToken) {
      const token = response.authentication.accessToken;
      const expiresIn = response.authentication.expiresIn;
      const timer = setTimeout(() => {
        handleLiveGoogleResponse(token, expiresIn);
      }, 0);
      return () => clearTimeout(timer);
    } else if (response.type === 'cancel' || response.type === 'dismiss') {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    } else if (response.type === 'error') {
      const timer = setTimeout(() => {
        setError(
          response.error?.message ||
          response.params?.error_description ||
          'Google Sign-In failed or was cancelled.'
        );
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [response, handleLiveGoogleResponse]);

  /**
   * Real Google OAuth Login:
   * Launches Google Sign-In prompt.
   * If Google OAuth client IDs are not configured, displays error and refuses to log in.
   */
  const loginWithGoogle = async (): Promise<void> => {
    setError(null);

    // If Google Client ID is not configured, deny access with clear configuration error
    if (!isGoogleAuthConfigured || !activeClientId) {
      setError(
        'Google OAuth is not configured. Please set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your environment variables.'
      );
      setIsLoading(false);
      return;
    }

    if (!request) {
      setError('Google Sign-In request is initializing. Please try again in a moment.');
      return;
    }

    try {
      setIsLoading(true);
      await promptAsync();
    } catch (err: any) {
      setError(err?.message || 'Unable to open Google Sign-In prompt.');
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
    const cleanDomain = newDomain.trim().toLowerCase().replace(/^@/, '');
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
        redirectUri: request?.redirectUri || webRedirectUri || '',
        loginWithGoogle,
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
