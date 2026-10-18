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
        {/* Left: Brand & Organization */}
        <View style={styles.leftGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => (user ? router.push('/dashboard') : router.push('/login'))}
            style={styles.brandContainer}
          >
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>HB</Text>
            </View>
            <View style={styles.brandMeta}>
              <View style={styles.titleRow}>
                <Text style={styles.brandTitle}>HB Plus</Text>
                <Text style={styles.titleSeparator}>/</Text>
                <Text style={styles.workspaceLabel}>Workspace</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Navigation Links for Authenticated Users */}
          {user && (
            <View style={styles.navLinks}>
              <TouchableOpacity
                onPress={() => router.push('/dashboard')}
                style={[
                  styles.navItem,
                  pathname === '/dashboard' && styles.navItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.navItemText,
                    pathname === '/dashboard' && styles.navItemTextActive,
                  ]}
                >
                  Dashboard
                </Text>
              </TouchableOpacity>

              {user.role === 'admin' && (
                <TouchableOpacity
                  onPress={() => router.push('/admin')}
                  style={[
                    styles.navItem,
                    pathname === '/admin' && styles.navItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.navItemText,
                      pathname === '/admin' && styles.navItemTextActive,
                    ]}
                  >
                    Admin Console
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Right: User Profile & Actions */}
        {user ? (
          <View style={styles.rightGroup}>
            <View style={styles.userSection}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarFallbackText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.userTextWrap}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
              <Badge
                label={user.role === 'admin' ? 'Admin' : 'Member'}
                variant={user.role === 'admin' ? 'primary' : 'neutral'}
                showDot
                style={styles.roleBadge}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.guestGroup}>
            <Badge
              label={`@${allowedDomain}`}
              variant="neutral"
              showDot
            />
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
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 20,
    height: 60,
    justifyContent: 'center',
    zIndex: 20,
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        top: 0,
      },
    }),
  },
  innerContainer: {
    maxWidth: 1140,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandMeta: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  titleSeparator: {
    fontSize: 13,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  workspaceLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  navItemActive: {
    backgroundColor: '#F1F5F9',
  },
  navItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  navItemTextActive: {
    color: '#0F172A',
    fontWeight: '600',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  avatarFallback: {
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  userTextWrap: {
    marginRight: 8,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: 120,
  },
  userEmail: {
    fontSize: 11,
    color: '#94A3B8',
    maxWidth: 120,
  },
  roleBadge: {
    marginLeft: 4,
  },
  logoutButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        cursor: 'pointer' as any,
      },
    }),
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  guestGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
