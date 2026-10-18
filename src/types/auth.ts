export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  domain: string;
  token: string;
  tokenExpiresAt?: number;
  provider: 'google-oauth' | 'google';
  createdAt: string;
  lastLoginAt: string;
}

export type AuthStatus = 'ALLOWED' | 'RESTRICTED';

export interface AuthAuditLog {
  id: string;
  timestamp: string;
  email: string;
  domain: string;
  status: AuthStatus;
  reason?: string;
  role?: UserRole;
  platform: 'web' | 'ios' | 'android' | 'other';
}

export interface DomainValidationResult {
  isValid: boolean;
  domain: string;
  errorMessage?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
