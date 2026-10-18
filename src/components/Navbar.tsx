import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Badge } from './Badge';

export const Navbar: React.FC = () => {
  const { user, logout, allowedDomain } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.header}>
      <View style={styles.innerContainer}>
        {/* Brand / Logo */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => (user ? router.push('/dashboard') : router.push('/login'))}
          style={styles.brandContainer}
        >
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>HB+</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>HB PLUS</Text>
            <Text style={styles.brandSubtitle}>Access Gateway</Text>
          </View>
        </TouchableOpacity>

        {/* Navigation & User actions */}
        {user ? (
          <View style={styles.navActions}>
            {/* Route Navigation Links */}
            <View style={styles.navLinks}>
              <TouchableOpacity
                onPress={() => router.push('/dashboard')}
                style={[
                  styles.navLink,
                  pathname === '/dashboard' && styles.navLinkActive,
                ]}
              >
                <Text
                  style={[
                    styles.navLinkText,
                    pathname === '/dashboard' && styles.navLinkTextActive,
                  ]}
                >
                  Dashboard
                </Text>
              </TouchableOpacity>

              {user.role === 'admin' && (
                <TouchableOpacity
                  onPress={() => router.push('/admin')}
                  style={[
                    styles.navLink,
                    pathname === '/admin' && styles.navLinkActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.navLinkText,
                      pathname === '/admin' && styles.navLinkTextActive,
                    ]}
                  >
                    Admin Console
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* User Profile Pill */}
            <View style={styles.userProfile}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarFallbackText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.name}
                </Text>
                <View style={styles.badgesRow}>
                  <Badge
                    label={user.role}
                    variant={user.role === 'admin' ? 'primary' : 'info'}
                  />
                </View>
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.guestRight}>
            <Badge label={`Domain: @${allowedDomain}`} variant="neutral" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        top: 0,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  innerContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 4,
  },
  navLink: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navLinkActive: {
    backgroundColor: '#f1f5f9',
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  navLinkTextActive: {
    color: '#0284c7',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarFallback: {
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  userInfo: {
    marginRight: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    maxWidth: 120,
  },
  badgesRow: {
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
  guestRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
