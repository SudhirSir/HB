import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { AuditTable } from '@/components/AuditTable';
import { getPlatformDisplayName } from '@/utils/platform';

export default function DashboardScreen() {
  const { user, logout, allowedDomain, auditLogs } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const isAdmin = user.role === 'admin';
  const userLogs = auditLogs.filter(log => log.email === user.email);

  return (
    <View style={styles.screen}>
      <Navbar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Page Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.pageTitle}>Personal Workspace</Text>
              <Text style={styles.pageSubtitle}>
                Verified corporate session for @{user.domain}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <Badge
                label={`Domain: @${user.domain}`}
                variant="success"
                showDot
              />
              <Badge
                label={isAdmin ? 'Administrator' : 'Standard Member'}
                variant={isAdmin ? 'primary' : 'neutral'}
                showDot
              />
            </View>
          </View>

          {/* Admin Banner (Shown if user has Admin role) */}
          {isAdmin && (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/admin')}
              style={styles.adminBanner}
            >
              <View style={styles.adminBannerLeft}>
                <View style={styles.adminIconWrap}>
                  <Text style={styles.adminIconText}>A</Text>
                </View>
                <View>
                  <Text style={styles.adminBannerTitle}>Admin Console Access Available</Text>
                  <Text style={styles.adminBannerSubtitle}>
                    Manage domain whitelists, review global authentication audit trails, and inspect user directories.
                  </Text>
                </View>
              </View>
              <View style={styles.adminBannerAction}>
                <Text style={styles.adminBannerActionText}>Open Console →</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Top Two Column Grid: Identity Card & Security Clearance Card */}
          <View style={styles.twoColGrid}>
            {/* Identity Card */}
            <Card style={styles.gridCard}>
              <Text style={styles.cardSectionLabel}>Identity & Authorization</Text>

              <View style={styles.profileRow}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarFallbackText}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={styles.profileMeta}>
                  <Text style={styles.profileName}>{user.name}</Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                  <View style={styles.badgeRow}>
                    <Badge
                      label={user.role === 'admin' ? 'Super Admin' : 'Active Member'}
                      variant={user.role === 'admin' ? 'primary' : 'neutral'}
                      showDot
                    />
                    <Badge label="Google SSO" variant="neutral" />
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Corporate Domain</Text>
                <Text style={styles.specValue}>@{user.domain}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>SSO Provider</Text>
                <Text style={styles.specValue}>Google OAuth 2.0</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Client Device</Text>
                <Text style={styles.specValue}>{getPlatformDisplayName()}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Session Authenticated</Text>
                <Text style={styles.specValue}>
                  {new Date(user.lastLoginAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </Card>

            {/* Security Clearance Card */}
            <Card style={styles.gridCard}>
              <Text style={styles.cardSectionLabel}>Security & Perimeter Status</Text>

              <View style={styles.statusList}>
                <View style={styles.statusItem}>
                  <View style={styles.statusBullet} />
                  <View style={styles.statusTextWrap}>
                    <Text style={styles.statusTitle}>Domain Whitelist Verification</Text>
                    <Text style={styles.statusDesc}>
                      Matched corporate whitelist (@{allowedDomain}).
                    </Text>
                  </View>
                  <Badge label="Passed" variant="success" showDot />
                </View>

                <View style={styles.statusItem}>
                  <View style={styles.statusBullet} />
                  <View style={styles.statusTextWrap}>
                    <Text style={styles.statusTitle}>OAuth Bearer Token Validation</Text>
                    <Text style={styles.statusDesc}>
                      Token parsed and verified via OpenID Connect.
                    </Text>
                  </View>
                  <Badge label="Verified" variant="success" showDot />
                </View>

                <View style={styles.statusItem}>
                  <View style={styles.statusBullet} />
                  <View style={styles.statusTextWrap}>
                    <Text style={styles.statusTitle}>Navigation Guards</Text>
                    <Text style={styles.statusDesc}>
                      Protected workspace routes unlocked.
                    </Text>
                  </View>
                  <Badge label="Active" variant="success" showDot />
                </View>

                <View style={styles.statusItem}>
                  <View style={styles.statusBullet} />
                  <View style={styles.statusTextWrap}>
                    <Text style={styles.statusTitle}>Encrypted Session Storage</Text>
                    <Text style={styles.statusDesc}>
                      Isolated local credentials cache.
                    </Text>
                  </View>
                  <Badge label="Isolated" variant="success" showDot />
                </View>
              </View>
            </Card>
          </View>

          {/* Activity & Authentication Logs Card */}
          <Card style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <View>
                <Text style={styles.tableTitle}>Recent Authentication Events</Text>
                <Text style={styles.tableSubtitle}>
                  Monitored access activity recorded by the domain gatekeeper
                </Text>
              </View>
              <Badge label="Live Audit" variant="neutral" showDot />
            </View>

            <AuditTable logs={userLogs.length > 0 ? userLogs : auditLogs.slice(0, 5)} maxEntries={5} />
          </Card>

          {/* Bottom Sign-out Action */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              style={styles.footerLogoutButton}
            >
              <Text style={styles.footerLogoutText}>Sign out of this session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 1100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  adminBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer' as any,
      },
    }),
  },
  adminBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 260,
  },
  adminIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#6D28D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminIconText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  adminBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4C1D95',
  },
  adminBannerSubtitle: {
    fontSize: 12,
    color: '#6D28D9',
    marginTop: 2,
  },
  adminBannerAction: {
    backgroundColor: '#6D28D9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  adminBannerActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  twoColGrid: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    gap: 16,
    marginBottom: 16,
  },
  gridCard: {
    flex: 1,
    padding: 20,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarFallback: {
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  profileEmail: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  specLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  specValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  statusList: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  statusTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  statusDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  tableCard: {
    padding: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  tableSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  footerRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerLogoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        cursor: 'pointer' as any,
      },
    }),
  },
  footerLogoutText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
});
