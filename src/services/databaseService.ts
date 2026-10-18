import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAuditLog, UserProfile } from '@/types/auth';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  CURRENT_USER: '@hb_current_user',
  ALL_USERS: '@hb_all_users',
  AUDIT_LOGS: '@hb_audit_logs',
  ALLOWED_DOMAIN: '@hb_allowed_domain',
};

// Default seed logs to showcase enterprise telemetry on initial load
const SEED_AUDIT_LOGS: AuthAuditLog[] = [
  {
    id: 'seed-log-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    email: 'admin@hbplus.fit',
    domain: 'hbplus.fit',
    status: 'ALLOWED',
    role: 'admin',
    platform: 'web',
  },
  {
    id: 'seed-log-2',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    email: 'hacker@gmail.com',
    domain: 'gmail.com',
    status: 'RESTRICTED',
    reason: 'Access restricted. Please login using your official domain email.',
    platform: 'web',
  },
  {
    id: 'seed-log-3',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    email: 'sarah.connor@hbplus.fit',
    domain: 'hbplus.fit',
    status: 'ALLOWED',
    role: 'user',
    platform: 'android',
  },
];

export const databaseService = {
  /**
   * Persists the active session user
   */
  async setCurrentUser(user: UserProfile | null): Promise<void> {
    try {
      if (!user) {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      }
    } catch (e) {
      console.error('[DB] Error saving current user:', e);
    }
  },

  /**
   * Retrieves the active session user
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('[DB] Error loading current user:', e);
      return null;
    }
  },

  /**
   * Upserts a user in the registered users directory
   */
  async saveUser(user: UserProfile): Promise<void> {
    try {
      // 1. Save to local persistent storage
      const existingUsers = await this.getAllUsers();
      const updatedUsers = [
        user,
        ...existingUsers.filter(u => u.id !== user.id && u.email !== user.email),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(updatedUsers));

      // 2. If Supabase is enabled, sync to Supabase `profiles` table
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          domain: user.domain,
          last_login_at: user.lastLoginAt,
          created_at: user.createdAt,
        });
      }
    } catch (e) {
      console.error('[DB] Error saving user to database:', e);
    }
  },

  /**
   * Gets all registered users
   */
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            email: row.email,
            name: row.name,
            avatar: row.avatar,
            role: row.role || 'user',
            domain: row.domain,
            provider: 'google',
            createdAt: row.created_at,
            lastLoginAt: row.last_login_at,
          }));
        }
      }

      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ALL_USERS);
      if (stored) {
        return JSON.parse(stored);
      }

      // Default sample users
      const defaultUsers: UserProfile[] = [
        {
          id: 'user-admin',
          email: 'admin@hbplus.fit',
          name: 'Security Admin',
          role: 'admin',
          domain: 'hbplus.fit',
          provider: 'google',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          lastLoginAt: new Date().toISOString(),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        },
        {
          id: 'user-member-1',
          email: 'sarah.connor@hbplus.fit',
          name: 'Sarah Connor',
          role: 'user',
          domain: 'hbplus.fit',
          provider: 'google',
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
          lastLoginAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        },
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(defaultUsers));
      return defaultUsers;
    } catch (e) {
      console.error('[DB] Error getting all users:', e);
      return [];
    }
  },

  /**
   * Records an authentication audit log (Allowed or Restricted attempt)
   */
  async recordAuditLog(log: Omit<AuthAuditLog, 'id'>): Promise<AuthAuditLog> {
    const newLog: AuthAuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    try {
      // 1. Save to local storage
      const existing = await this.getAuditLogs();
      const updated = [newLog, ...existing.slice(0, 99)]; // Keep latest 100 entries
      await AsyncStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));

      // 2. If Supabase configured, save to `auth_audit_logs` table
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('auth_audit_logs').insert({
          id: newLog.id,
          email: newLog.email,
          domain: newLog.domain,
          status: newLog.status,
          reason: newLog.reason,
          role: newLog.role,
          platform: newLog.platform,
          created_at: newLog.timestamp,
        });
      }
    } catch (e) {
      console.error('[DB] Error recording audit log:', e);
    }

    return newLog;
  },

  /**
   * Retrieves all audit logs
   */
  async getAuditLogs(): Promise<AuthAuditLog[]> {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('auth_audit_logs')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            email: row.email,
            domain: row.domain,
            status: row.status,
            reason: row.reason,
            role: row.role,
            platform: row.platform || 'web',
            timestamp: row.created_at,
          }));
        }
      }

      const stored = await AsyncStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (stored) {
        return JSON.parse(stored);
      }

      // Seed initial logs
      await AsyncStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
      return SEED_AUDIT_LOGS;
    } catch (e) {
      console.error('[DB] Error retrieving audit logs:', e);
      return SEED_AUDIT_LOGS;
    }
  },

  /**
   * Clears audit logs (Admin utility)
   */
  async clearAuditLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    } catch (e) {
      console.error('[DB] Error clearing audit logs:', e);
    }
  },

  /**
   * Get configured allowed domain
   */
  async getAllowedDomain(fallback: string): Promise<string> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.ALLOWED_DOMAIN);
      return val || fallback;
    } catch {
      return fallback;
    }
  },

  /**
   * Update allowed domain (Admin configuration)
   */
  async setAllowedDomain(domain: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ALLOWED_DOMAIN, domain.trim().toLowerCase());
    } catch (e) {
      console.error('[DB] Error saving allowed domain:', e);
    }
  },
};
