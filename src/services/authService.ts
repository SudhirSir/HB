import * as WebBrowser from 'expo-web-browser';
import { UserProfile, AuthAuditLog } from '@/types/auth';
import {
  validateGoogleClaims,
  determineUserRole,
  extractDomain,
  EXACT_RESTRICTION_ERROR,
} from './domainValidator';
import { databaseService } from './databaseService';
import { getPlatformType } from '@/utils/platform';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Ensure WebBrowser finishes any pending auth session
WebBrowser.maybeCompleteAuthSession();

export interface ProcessAuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
  auditLog: AuthAuditLog;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  hd?: string; // Hosted domain in Google Workspace
}

export const authService = {
  /**
   * Fetches the authenticated Google profile directly from Google's UserInfo API
   * using the OAuth 2.0 access token.
   */
  async fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Missing or invalid OAuth access token.');
    }

    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Google OAuth token is invalid or expired.');
      }
      throw new Error(`Failed to fetch Google profile (status ${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    return {
      sub: data.sub,
      email: data.email,
      email_verified: Boolean(data.email_verified),
      name: data.name,
      picture: data.picture,
      hd: data.hd,
    };
  },

  /**
   * Verifies an access token against Google's tokeninfo endpoint to confirm it is valid and not revoked.
   */
  async verifyGoogleToken(accessToken: string): Promise<boolean> {
    if (!accessToken) return false;
    try {
      const res = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
      );
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.email && !data.error);
    } catch {
      return false;
    }
  },

  /**
   * Processes an authenticated Google OAuth response:
   * 1. Validates verified email claim (rejects unverified claims).
   * 2. Strictly enforces domain matching (@hbplus.fit).
   * 3. On mismatch: rejects, records RESTRICTED audit log, purges session.
   * 4. On match: creates session, records ALLOWED audit log, persists user.
   */
  async processGoogleOAuthUser(
    googleInfo: GoogleUserInfo,
    accessToken: string,
    allowedDomain: string,
    expiresIn?: number
  ): Promise<ProcessAuthResult> {
    const { email, name, picture, email_verified, sub } = googleInfo;
    const domain = extractDomain(email);
    const platform = getPlatformType();

    // 1. Validate Google OAuth Claims (verified email + exact domain match)
    const validation = validateGoogleClaims(
      { email, email_verified },
      allowedDomain
    );

    if (!validation.isValid) {
      const errorMsg = validation.errorMessage || EXACT_RESTRICTION_ERROR;

      // Record security audit log for restricted attempt
      const auditLog = await databaseService.recordAuditLog({
        timestamp: new Date().toISOString(),
        email: email || 'unknown',
        domain: domain || 'unknown',
        status: 'RESTRICTED',
        reason: errorMsg,
        platform,
      });

      // Ensure NO user session exists
      await databaseService.setCurrentUser(null);

      return {
        success: false,
        error: errorMsg,
        auditLog,
      };
    }

    // 2. Domain Validation Passed - Grant Access
    const role = determineUserRole(email);
    const now = new Date().toISOString();
    const tokenExpiresAt = expiresIn
      ? Date.now() + expiresIn * 1000
      : Date.now() + 3600 * 1000; // default 1 hour expiration

    const userProfile: UserProfile = {
      id: sub || `google-user-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name || email.split('@')[0],
      avatar:
        picture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=0284c7&color=fff&bold=true`,
      role,
      domain,
      token: accessToken,
      tokenExpiresAt,
      provider: 'google-oauth',
      createdAt: now,
      lastLoginAt: now,
    };

    // 3. Persist in database & storage
    await databaseService.saveUser(userProfile);
    await databaseService.setCurrentUser(userProfile);

    // 4. Record audit log
    const auditLog = await databaseService.recordAuditLog({
      timestamp: now,
      email: userProfile.email,
      domain: userProfile.domain,
      status: 'ALLOWED',
      role: userProfile.role,
      platform,
    });

    return {
      success: true,
      user: userProfile,
      auditLog,
    };
  },

  /**
   * Validates a stored session loaded from AsyncStorage on application startup.
   * Ensures the session has a valid token, exact domain, and authentic provider.
   */
  async validateStoredSession(
    user: UserProfile | null,
    allowedDomain: string
  ): Promise<UserProfile | null> {
    if (!user) return null;

    // Check provider: must be real google-oauth
    if (user.provider !== 'google-oauth' && user.provider !== 'google') {
      await databaseService.setCurrentUser(null);
      return null;
    }

    // Check token presence
    if (!user.token || typeof user.token !== 'string' || user.token.length < 10) {
      await databaseService.setCurrentUser(null);
      return null;
    }

    // Check token expiration if tracked
    if (user.tokenExpiresAt && Date.now() > user.tokenExpiresAt) {
      await databaseService.setCurrentUser(null);
      return null;
    }

    // Check domain whitelist
    const validation = validateGoogleClaims(
      { email: user.email, email_verified: true },
      allowedDomain
    );
    if (!validation.isValid) {
      await databaseService.setCurrentUser(null);
      return null;
    }

    return user;
  },

  /**
   * Sign out: clears persistent session and revokes credentials
   */
  async logout(): Promise<void> {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('[Auth] Supabase signOut error:', e);
    } finally {
      await databaseService.setCurrentUser(null);
    }
  },
};
