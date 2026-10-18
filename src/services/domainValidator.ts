import { DomainValidationResult, UserRole } from '@/types/auth';
import { ENV_CONFIG } from '@/config/env';

export const EXACT_RESTRICTION_ERROR =
  'Access restricted. Please login using your official domain email.';

/**
 * Extracts and normalizes the exact domain from an email address.
 * E.g. "User@HBPLUS.FIT" -> "hbplus.fit"
 * Handles edge cases, multiple '@', trailing dots, whitespace.
 */
export function extractDomain(email: string): string {
  if (!email || typeof email !== 'string') return '';
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return '';
  const domain = parts[1];
  // Basic validation that local and domain parts are non-empty
  if (!parts[0] || !domain || domain.includes('@')) return '';
  return domain;
}

/**
 * Validates whether an email belongs strictly to the allowed domain.
 * - Normalizes casing and whitespace.
 * - Rejects missing, malformed, or multiple '@' inputs.
 * - Strictly rejects lookalike domains (e.g. user@hbplus.fit.attacker.com, user@not-hbplus.fit).
 * - Exact required error message on domain mismatch:
 *   "Access restricted. Please login using your official domain email."
 */
export function validateDomain(
  email: string,
  allowedDomain: string = ENV_CONFIG.DEFAULT_ALLOWED_DOMAIN
): DomainValidationResult {
  const normalizedEmail = (email || '').trim().toLowerCase();

  // RFC 5322 standard email regex pattern
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    return {
      isValid: false,
      domain: '',
      errorMessage: 'Invalid email address provided.',
    };
  }

  const parts = normalizedEmail.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      domain: '',
      errorMessage: EXACT_RESTRICTION_ERROR,
    };
  }

  const domain = parts[1];
  const targetDomain = allowedDomain.trim().toLowerCase().replace(/^@/, '');

  // Exact domain equality check to prevent lookalikes (e.g., hbplus.fit.attacker.com)
  if (domain !== targetDomain) {
    return {
      isValid: false,
      domain,
      errorMessage: EXACT_RESTRICTION_ERROR,
    };
  }

  return {
    isValid: true,
    domain,
  };
}

/**
 * Validates Google OAuth Identity claims:
 * - Checks email presence
 * - Checks verified email claim (email_verified === true)
 * - Checks domain validity against allowed domain
 */
export function validateGoogleClaims(
  claims: {
    email?: string | null;
    email_verified?: boolean | string | null;
  },
  allowedDomain: string = ENV_CONFIG.DEFAULT_ALLOWED_DOMAIN
): DomainValidationResult {
  if (!claims || !claims.email) {
    return {
      isValid: false,
      domain: '',
      errorMessage: 'Google account did not provide an email address.',
    };
  }

  // Reject unverified email claims
  const isVerified = claims.email_verified === true || claims.email_verified === 'true';
  if (!isVerified) {
    return {
      isValid: false,
      domain: extractDomain(claims.email),
      errorMessage: EXACT_RESTRICTION_ERROR,
    };
  }

  return validateDomain(claims.email, allowedDomain);
}

/**
 * Determines whether the user should be granted Admin or standard User role.
 */
export function determineUserRole(email: string): UserRole {
  const normalized = (email || '').trim().toLowerCase();

  // Check exact admin email list
  if (ENV_CONFIG.ADMIN_EMAILS.map(e => e.toLowerCase()).includes(normalized)) {
    return 'admin';
  }

  // Check if prefix indicates an admin role (e.g. admin@hbplus.fit)
  const username = normalized.split('@')[0];
  if (username === 'admin' || username.startsWith('admin.')) {
    return 'admin';
  }

  return 'user';
}
