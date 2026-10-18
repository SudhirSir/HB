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

  // RouteGuard handles non-logged in users, but we provide safe fallback
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
          {/* Welcome & Status Banner */}
          <View style={styles.welcomeBanner}>
            <View>
              <Text style={styles.greetingText}>Welcome back,</Text>
              <Text style={styles.userNameText}>{user.name}</Text>
            </View>
            <View style={styles.bannerBadges}>
              <Badge label={`Domain: @${user.domain}`} variant="success" />
              <Badge
                label={`Role: ${user.role.toUpperCase()}`}
                variant={isAdmin ? 'primary' : 'info'}
              />
            </View>
          </View>

          {/* Admin Prompt Banner (if user is admin) */}
          {isAdmin && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/admin')}
              style={styles.adminBanner}
            >
              <View style={styles.adminBannerLeft}>
                <Text style={styles.adminBannerIcon}>🛡️</Text>
                <View>
                  <Text style={styles.adminBannerTitle}>
                    Administrator Privileges Active
                  </Text>
                  <Text style={styles.adminBannerSubtitle}>
                    You have full access to the Audit Log, Whitelist Settings, and User Management.
                  </Text>
                </View>
              </View>
              <View style={styles.adminBannerButton}>
                <Text style={styles.adminBannerButtonText}>Open Console →</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Top Grid: Profile Card & Security Overview Card */}
          <View style={styles.gridRow}>
            {/* User Profile Card */}
            <Card style={styles.profileCard}>
              <View style={styles.profileHeader}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.profileImage} />
                ) : (
                  <View style={[styles.profileImage, styles.profileImageFallback]}>
                    <Text style={styles.profileImageFallbackText}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>{user.name}</Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                  <View style={styles.profileBadges}>
                    <Badge label={user.role} variant={isAdmin ? 'primary' : 'info'} />
                    <Badge label="Google Verified" variant="neutral" />
                  </View>
                </View>
              </View>

              <View style={styles.detailsDivider} />

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Domain Authority</Text>
                <Text style={styles.metaValue}>@{user.domain}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Auth Provider</Text>
                <Text style={styles.metaValue}>Google OAuth 2.0</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Active Client</Text>
                <Text style={styles.metaValue}>{getPlatformDisplayName()}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Last Authenticated</Text>
                <Text style={styles.metaValue}>
                  {new Date(user.lastLoginAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </Card>

            {/* Security Clearance Card */}
            <Card style={styles.securityCard}>
              <Text style={styles.sectionHeader}>Security Compliance State</Text>

              <View style={styles.complianceItem}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
                <View style={styles.complianceTextWrap}>
                  <Text style={styles.complianceTitle}>Domain Whitelist Check Passed</Text>
                  <Text style={styles.complianceDesc}>
                    Email matched authorized company domain (@{allowedDomain}).
                  </Text>
                </View>
              </View>

              <View style={styles.complianceItem}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
                <View style={styles.complianceTextWrap}>
                  <Text style={styles.complianceTitle}>OAuth 2.0 Bearer Token Verified</Text>
                  <Text style={styles.complianceDesc}>
                    Google identity token validated and session secured.
                  </Text>
                </View>
              </View>

              <View style={styles.complianceItem}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
                <View style={styles.complianceTextWrap}>
                  <Text style={styles.complianceTitle}>Protected Route Access Granted</Text>
                  <Text style={styles.complianceDesc}>
                    Navigation guards unlocked for dashboard resources.
                  </Text>
                </View>
              </View>

              <View style={styles.complianceItem}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
                <View style={styles.complianceTextWrap}>
                  <Text style={styles.complianceTitle}>Encrypted Persistent Storage</Text>
                  <Text style={styles.complianceDesc}>
                    Session saved in secure client database with token isolation.
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Quick Metrics Row */}
          <View style={styles.metricsRow}>
            <Card style={styles.metricCard}>
              <Text style={styles.metricNumber}>100%</Text>
              <Text style={styles.metricLabel}>Domain Isolation</Text>
              <Text style={styles.metricSub}>All non-@{allowedDomain} rejected</Text>
            </Card>

            <Card style={styles.metricCard}>
              <Text style={styles.metricNumber}>OAuth 2.0</Text>
              <Text style={styles.metricLabel}>Protocol</Text>
              <Text style={styles.metricSub}>Google OpenID Connect</Text>
            </Card>

            <Card style={styles.metricCard}>
              <Text style={styles.metricNumber}>{isAdmin ? 'Admin' : 'Member'}</Text>
              <Text style={styles.metricLabel}>Access Level</Text>
              <Text style={styles.metricSub}>
                {isAdmin ? 'Full System Privileges' : 'Standard User Access'}
              </Text>
            </Card>
          </View>

          {/* User Sign-In History / Audit Log */}
          <Card style={styles.auditCard}>
            <View style={styles.auditCardHeader}>
              <View>
                <Text style={styles.sectionHeader}>Your Recent Sign-In Events</Text>
                <Text style={styles.sectionSub}>
                  Chronological authentication attempts and gatekeeper validation logs
                </Text>
              </View>
              <Badge label="Real-time Audit" variant="info" />
            </View>

            <AuditTable logs={userLogs.length > 0 ? userLogs : auditLogs.slice(0, 5)} maxEntries={5} />
          </Card>

          {/* Bottom Logout Action */}
          <View style={styles.bottomActionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              style={styles.bottomLogoutButton}
            >
              <Text style={styles.bottomLogoutText}>Sign Out from {user.email}</Text>
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
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 1100,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  greetingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userNameText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  bannerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  adminBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    borderWidth: 1.5,
    borderColor: '#c4b5fd',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  adminBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 260,
  },
  adminBannerIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  adminBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5b21b6',
  },
  adminBannerSubtitle: {
    fontSize: 12,
    color: '#6d28d9',
    marginTop: 2,
    lineHeight: 16,
  },
  adminBannerButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  adminBannerButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  gridRow: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    gap: 16,
    marginBottom: 16,
  },
  profileCard: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#0284c7',
  },
  profileImageFallback: {
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageFallbackText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  profileBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  metaLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  securityCard: {
    flex: 1.2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  checkText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '800',
  },
  complianceTextWrap: {
    flex: 1,
  },
  complianceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  complianceDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginTop: 1,
  },
  metricsRow: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    gap: 16,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0284c7',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 11,
    color: '#64748b',
  },
  auditCard: {
    marginBottom: 20,
  },
  auditCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  bottomActionRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  bottomLogoutButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bottomLogoutText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 14,
  },
});
