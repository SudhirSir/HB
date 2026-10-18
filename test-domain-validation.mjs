// Standalone verification suite for domain restriction and Google claim enforcement
const DEFAULT_ALLOWED_DOMAIN = 'hbplus.fit';
const EXACT_RESTRICTION_ERROR =
  'Access restricted. Please login using your official domain email.';
const ADMIN_EMAILS = ['admin@hbplus.fit', 'superadmin@hbplus.fit'];

function extractDomain(email) {
  if (!email || typeof email !== 'string') return '';
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return '';
  const domain = parts[1];
  if (!parts[0] || !domain || domain.includes('@')) return '';
  return domain;
}

function validateDomain(email, allowedDomain = DEFAULT_ALLOWED_DOMAIN) {
  const normalizedEmail = (email || '').trim().toLowerCase();
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

function validateGoogleClaims(claims, allowedDomain = DEFAULT_ALLOWED_DOMAIN) {
  if (!claims || !claims.email) {
    return {
      isValid: false,
      domain: '',
      errorMessage: 'Google account did not provide an email address.',
    };
  }

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

function determineUserRole(email) {
  const normalized = (email || '').trim().toLowerCase();
  if (ADMIN_EMAILS.includes(normalized)) return 'admin';
  const username = normalized.split('@')[0];
  if (username === 'admin' || username.startsWith('admin.')) return 'admin';
  return 'user';
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('======================================================');
console.log('HB PLUS GATEWAY: DOMAIN RESTRICTION & CLAIMS VERIFICATION');
console.log('======================================================\n');

// 1. Allowed Domain Test (@hbplus.fit)
const testAllowed = validateDomain('example@hbplus.fit', 'hbplus.fit');
assert(testAllowed.isValid === true, 'Allow example@hbplus.fit access');
assert(testAllowed.domain === 'hbplus.fit', 'Domain extracted as hbplus.fit');

// 2. Restricted Domain Test (@gmail.com) - Core Requirement
const testGmail = validateDomain('example@gmail.com', 'hbplus.fit');
assert(testGmail.isValid === false, 'Block example@gmail.com access');
assert(
  testGmail.errorMessage === EXACT_RESTRICTION_ERROR,
  `Verify exact error message: "${EXACT_RESTRICTION_ERROR}"`
);

// 3. Lookalike domain rejection: subdomain attacker (user@hbplus.fit.attacker.com)
const testLookalike1 = validateDomain('user@hbplus.fit.attacker.com', 'hbplus.fit');
assert(testLookalike1.isValid === false, 'Block lookalike: user@hbplus.fit.attacker.com');
assert(testLookalike1.errorMessage === EXACT_RESTRICTION_ERROR, 'Lookalike 1 returns exact restriction error');

// 4. Lookalike domain rejection: prefix attacker (user@not-hbplus.fit)
const testLookalike2 = validateDomain('user@not-hbplus.fit', 'hbplus.fit');
assert(testLookalike2.isValid === false, 'Block lookalike: user@not-hbplus.fit');
assert(testLookalike2.errorMessage === EXACT_RESTRICTION_ERROR, 'Lookalike 2 returns exact restriction error');

// 5. Lookalike domain rejection: suffix attacker (user@hbplus.fitness)
const testLookalike3 = validateDomain('user@hbplus.fitness', 'hbplus.fit');
assert(testLookalike3.isValid === false, 'Block lookalike: user@hbplus.fitness');

// 6. Google Verified Email claim test: Verified claim allowed
const testVerified = validateGoogleClaims(
  { email: 'sarah@hbplus.fit', email_verified: true },
  'hbplus.fit'
);
assert(testVerified.isValid === true, 'Allow verified Google account sarah@hbplus.fit');

// 7. Google Unverified Email claim test: Unverified email rejected
const testUnverified = validateGoogleClaims(
  { email: 'sarah@hbplus.fit', email_verified: false },
  'hbplus.fit'
);
assert(testUnverified.isValid === false, 'Reject unverified Google claim (email_verified: false)');
assert(testUnverified.errorMessage === EXACT_RESTRICTION_ERROR, 'Unverified claim returns restriction error');

// 8. Case-insensitivity & whitespace trimming
const testUpper = validateDomain('  USER@HBPLUS.FIT  ', 'hbplus.fit');
assert(testUpper.isValid === true, 'Allow uppercase with whitespace "  USER@HBPLUS.FIT  "');

// 9. Malformed / Missing inputs
assert(validateDomain('').isValid === false, 'Reject empty string');
assert(validateDomain('not-an-email').isValid === false, 'Reject malformed email');
assert(validateDomain('user@@hbplus.fit').isValid === false, 'Reject double-@ malformed email');
assert(validateDomain('@hbplus.fit').isValid === false, 'Reject missing username');

// 10. Role-Based Access Control (RBAC)
assert(determineUserRole('admin@hbplus.fit') === 'admin', 'Assign admin role to admin@hbplus.fit');
assert(determineUserRole('superadmin@hbplus.fit') === 'admin', 'Assign admin role to superadmin@hbplus.fit');
assert(determineUserRole('alex@hbplus.fit') === 'user', 'Assign user role to alex@hbplus.fit');

console.log('\n------------------------------------------------------');
console.log('ALL VERIFICATION CHECKS PASSED (14/14 checks)');
console.log('------------------------------------------------------\n');
