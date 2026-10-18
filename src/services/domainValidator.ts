import { DomainValidationResult, UserRole } from '@/types/auth';
import { ENV_CONFIG } from '@/config/env';

/**
 * Extracts and normalizes the domain from an email address.
 * E.g. "User@HBPLUS.FIT" -> "hbplus.fit"
 */
export function extractDomain(email: string): string {
  if (!email || typeof email !== 'string') return '';
  const parts = email.trim().toLowerCase().split('@');
  return parts.length === 2 ? parts[1] : '';
}

/**
 * Validates whether an email belongs to the allowed domain.
 * Exactly satisfies:
 * - If email = example@hbplus.fit -> Allow login
 * - If email = example@gmail.com -> Show error: "Access restricted. Please login using your official domain email."
 */
export function validateDomain(
  email: string,
  allowedDomain: string = ENV_CONFIG.DEFAULT_ALLOWED_DOMAIN
): DomainValidationResult {
  const normalizedEmail = (email || '').trim().toLowerCase();
  
  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    return {
      isValid: false,
      domain: '',
      errorMessage: 'Invalid email address provided.',
    };
  }

  const domain = extractDomain(normalizedEmail);
  const targetDomain = allowedDomain.trim().toLowerCase();

  if (domain !== targetDomain) {
    return {
      isValid: false,
      domain,
      errorMessage: 'Access restricted. Please login using your official domain email.',
    };
  }

  return {
    isValid: true,
    domain,
  };
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
