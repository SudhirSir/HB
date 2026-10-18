/**
 * Environment configuration for HB Plus Cross-Platform Application
 */

export const ENV_CONFIG = {
  // Primary allowed domain for Google Authentication restriction
  DEFAULT_ALLOWED_DOMAIN: process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || 'hbplus.fit',

  // Admin emails or prefixes for Role-Based Access Control (RBAC)
  ADMIN_EMAILS: [
    'admin@hbplus.fit',
    'superadmin@hbplus.fit',
    'sushil@hbplus.fit',
  ],

  // Google OAuth 2.0 Client IDs
  GOOGLE: {
    WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
    IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  },

  // Optional Supabase Configuration
  SUPABASE: {
    URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  APP_NAME: 'HB Plus Gateway',
  VERSION: '1.0.0',
};
