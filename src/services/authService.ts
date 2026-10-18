import * as WebBrowser from 'expo-web-browser';
import { UserProfile, AuthAuditLog } from '@/types/auth';
import { validateDomain, determineUserRole, extractDomain } from './domainValidator';
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

export const authService = {
  /**
   * Processes and validates an authenticated Google user profile against domain restriction.
   * This is the single gatekeeper for both live Google OAuth and simulated OAuth.
   */
  async processGoogleUser(
    googlePayload: {
      id: string;
      email: string;
      name: string;
      picture?: string;
      token?: string;
    },
    allowedDomain: string,
    provider: 'google' | 'google-oauth' | 'google-simulated' = 'google'
  ): Promise<ProcessAuthResult> {
    const { email, name, picture, token } = googlePayload;
    const domain = extractDomain(email);
    const platform = getPlatformType();

    // 1. Strict Domain Validation
    const validation = validateDomain(email, allowedDomain);

    if (!validation.isValid) {
      const errorMsg =
        validation.errorMessage ||
        'Access restricted. Please login using your official domain email.';

      // Record security audit log for restricted attempt
      const auditLog = await databaseService.recordAuditLog({
        timestamp: new Date().toISOString(),
        email,
        domain: domain || 'unknown',
        status: 'RESTRICTED',
        reason: errorMsg,
        platform,
      });

      // Clear any stored user session
      await databaseService.setCurrentUser(null);

      // Return failure - access blocked
      return {
        success: false,
        error: errorMsg,
        auditLog,
      };
    }

    // 2. Domain Validation Passed - Grant Access
    const role = determineUserRole(email);
    const now = new Date().toISOString();

    const userProfile: UserProfile = {
      id: googlePayload.id || `google-user-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name || email.split('@')[0],
      avatar:
        picture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=0284c7&color=fff&bold=true`,
      role,
      domain,
      token: token || `token_${Math.random().toString(36).substring(2)}`,
      provider,
      createdAt: now,
      lastLoginAt: now,
    };

    // 3. Persist in database
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
   * Fetches Google profile using OAuth access token
   */
  async fetchGoogleUserInfo(accessToken: string): Promise<any> {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch Google profile: ${res.statusText}`);
    }
    return await res.json();
  },

  /**
   * OAuth login via Supabase (if configured)
   */
  async signInWithSupabaseGoogle(redirectTo?: string) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  },

  /**
   * Realistic OAuth test authentication for testing domain restriction.
   * Simulates full Google OAuth response to evaluate @hbplus.fit vs @gmail.com behavior.
   */
  async simulateGoogleSignIn(
    email: string,
    allowedDomain: string,
    customName?: string
  ): Promise<ProcessAuthResult> {
    // Generate realistic Google user mock
    const cleanEmail = email.trim();
    const defaultName = customName || cleanEmail.split('@')[0].replace('.', ' ');
    const formattedName = defaultName
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const mockGooglePayload = {
      id: `google_${Math.abs(cleanEmail.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0))}`,
      email: cleanEmail,
      name: formattedName,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=0284c7&color=fff&size=128`,
      token: `mock_oauth_jwt_${Date.now()}`,
    };

    return await this.processGoogleUser(mockGooglePayload, allowedDomain, 'google-simulated');
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
