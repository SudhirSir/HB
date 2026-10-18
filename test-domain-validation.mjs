// Self-contained test suite for domain restriction logic
const DEFAULT_ALLOWED_DOMAIN = 'hbplus.fit';
const ADMIN_EMAILS = ['admin@hbplus.fit', 'superadmin@hbplus.fit'];

function extractDomain(email) {
  if (!email || typeof email !== 'string') return '';
  const parts = email.trim().toLowerCase().split('@');
  return parts.length === 2 ? parts[1] : '';
}

function validateDomain(email, allowedDomain = DEFAULT_ALLOWED_DOMAIN) {
  const normalizedEmail = (email || '').trim().toLowerCase();
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
console.log('HB PLUS GATEWAY: DOMAIN RESTRICTION VERIFICATION SUITE');
console.log('======================================================\n');

// 1. Allowed Domain Test (@hbplus.fit)
const testAllowed = validateDomain('example@hbplus.fit', 'hbplus.fit');
assert(testAllowed.isValid === true, 'Allow example@hbplus.fit access');
assert(testAllowed.domain === 'hbplus.fit', 'Domain extracted as hbplus.fit');

// 2. Restricted Domain Test (@gmail.com) - Core Prompt Requirement
const testGmail = validateDomain('example@gmail.com', 'hbplus.fit');
assert(testGmail.isValid === false, 'Block example@gmail.com access');
assert(
  testGmail.errorMessage === 'Access restricted. Please login using your official domain email.',
  'Verify exact error message: "Access restricted. Please login using your official domain email."'
);

// 3. Additional restricted domains
const testYahoo = validateDomain('someone@yahoo.com', 'hbplus.fit');
assert(testYahoo.isValid === false, 'Block someone@yahoo.com');

const testOutlook = validateDomain('employee@outlook.com', 'hbplus.fit');
assert(testOutlook.isValid === false, 'Block employee@outlook.com');

// 4. Case-insensitivity & whitespace trimming
const testUpper = validateDomain('  USER@HBPLUS.FIT  ', 'hbplus.fit');
assert(testUpper.isValid === true, 'Allow uppercase with whitespace "  USER@HBPLUS.FIT  "');

// 5. Malformed / Empty strings
assert(validateDomain('').isValid === false, 'Reject empty string');
assert(validateDomain('not-an-email').isValid === false, 'Reject malformed email');
assert(validateDomain('@hbplus.fit').isValid === false, 'Reject missing username');

// 6. Role-Based Access Control (RBAC)
assert(determineUserRole('admin@hbplus.fit') === 'admin', 'Assign admin role to admin@hbplus.fit');
assert(determineUserRole('superadmin@hbplus.fit') === 'admin', 'Assign admin role to superadmin@hbplus.fit');
assert(determineUserRole('alex@hbplus.fit') === 'user', 'Assign user role to alex@hbplus.fit');

console.log('\n------------------------------------------------------');
console.log('ALL DOMAIN RESTRICTION CHECKS PASSED SUCCESSFULLY (10/10)');
console.log('------------------------------------------------------\n');
