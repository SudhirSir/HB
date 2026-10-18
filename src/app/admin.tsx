import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { AuditTable } from '@/components/AuditTable';

export default function AdminScreen() {
  const {
    user,
    allowedDomain,
    updateAllowedDomain,
    auditLogs,
    registeredUsers,
    clearAuditLogs,
  } = useAuth();

  const [newDomainInput, setNewDomainInput] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fallback guard
  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.screen}>
        <Navbar />
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedIcon}>🚫</Text>
          <Text style={styles.unauthorizedTitle}>Access Restricted (Admin Only)</Text>
          <Text style={styles.unauthorizedDesc}>
            Your account ({user?.email || 'Guest'}) does not have administrator privileges.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/dashboard')}
          >
            <Text style={styles.backButtonText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleUpdateDomain = async () => {
    if (!newDomainInput.trim()) return;
    const cleanDomain = newDomainInput.trim().toLowerCase().replace(/^@/, '');
    await updateAllowedDomain(cleanDomain);
    setNewDomainInput('');
    setSuccessMsg(`Allowed domain successfully updated to @${cleanDomain}`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleClearLogs = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to clear all authentication audit logs?')) {
        await clearAuditLogs();
      }
    } else {
      Alert.alert(
        'Clear Audit Logs',
        'Are you sure you want to clear all authentication audit logs?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: clearAuditLogs },
        ]
      );
    }
  };

  // Calculations for telemetry
  const totalAttempts = auditLogs.length;
  const allowedCount = auditLogs.filter(l => l.status === 'ALLOWED').length;
  const restrictedCount = auditLogs.filter(l => l.status === 'RESTRICTED').length;
  const enforcementRate =
    totalAttempts > 0 ? Math.round((allowedCount / totalAttempts) * 100) : 100;

  return (
    <View style={styles.screen}>
      <Navbar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.pageCategory}>Role-Based Access Control</Text>
              <Text style={styles.pageTitle}>Security Administration Console</Text>
            </View>
            <Badge label="Super Admin Privileges" variant="primary" />
          </View>

          {successMsg && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✅ {successMsg}</Text>
            </View>
          )}

          {/* Telemetry Grid */}
          <View style={styles.metricsGrid}>
            <Card style={styles.metricCard}>
              <Text style={styles.metricValue}>{totalAttempts}</Text>
              <Text style={styles.metricTitle}>Total Auth Requests</Text>
              <Text style={styles.metricSubtitle}>Recorded via OAuth gateway</Text>
            </Card>

            <Card style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#16a34a' }]}>{allowedCount}</Text>
              <Text style={styles.metricTitle}>Authorized Logins</Text>
              <Text style={styles.metricSubtitle}>Passed @{allowedDomain} rule</Text>
            </Card>

            <Card style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#dc2626' }]}>{restrictedCount}</Text>
              <Text style={styles.metricTitle}>Blocked Attempts</Text>
              <Text style={styles.metricSubtitle}>Restricted domain mismatch</Text>
            </Card>

            <Card style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#7c3aed' }]}>{registeredUsers.length}</Text>
              <Text style={styles.metricTitle}>Registered Profiles</Text>
              <Text style={styles.metricSubtitle}>{enforcementRate}% compliance rate</Text>
            </Card>
          </View>

          {/* Domain Whitelist Configuration Card */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Domain Whitelist Policy Manager</Text>
            <Text style={styles.sectionDesc}>
              Modify the primary allowed domain for the application in real-time. Only users
              with Google accounts ending in this domain will be granted entry.
            </Text>

            <View style={styles.domainConfigRow}>
              <View style={styles.currentDomainBox}>
                <Text style={styles.currentDomainLabel}>Current Whitelisted Domain:</Text>
                <Text style={styles.currentDomainVal}>@{allowedDomain}</Text>
              </View>

              <View style={styles.domainInputWrapper}>
                <TextInput
                  value={newDomainInput}
                  onChangeText={setNewDomainInput}
                  placeholder="e.g. hbplus.fit or acme.org"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  style={styles.domainInput}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={!newDomainInput.trim()}
                  onPress={handleUpdateDomain}
                  style={[
                    styles.updateDomainButton,
                    !newDomainInput.trim() && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.updateDomainButtonText}>Update Whitelist</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Registered Users Database Directory */}
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderWithAction}>
              <View>
                <Text style={styles.sectionTitle}>User Directory (Persistent Database)</Text>
                <Text style={styles.sectionDesc}>
                  Profiles synchronized with secure database storage
                </Text>
              </View>
              <Badge label={`${registeredUsers.length} Users`} variant="info" />
            </View>

            <View style={styles.usersList}>
              {registeredUsers.map(u => (
                <View key={u.id} style={styles.userRow}>
                  {u.avatar ? (
                    <Image source={{ uri: u.avatar }} style={styles.userAvatar} />
                  ) : (
                    <View style={[styles.userAvatar, styles.userAvatarFallback]}>
                      <Text style={styles.userAvatarFallbackText}>
                        {u.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.userInfoWrap}>
                    <Text style={styles.userNameText}>{u.name}</Text>
                    <Text style={styles.userEmailText}>{u.email}</Text>
                  </View>

                  <View style={styles.userMetaWrap}>
                    <Badge
                      label={u.role.toUpperCase()}
                      variant={u.role === 'admin' ? 'primary' : 'info'}
                    />
                    <Text style={styles.userMetaDate}>
                      Last: {new Date(u.lastLoginAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Full Audit Logs Card */}
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderWithAction}>
              <View>
                <Text style={styles.sectionTitle}>Global Authentication Audit Trail</Text>
                <Text style={styles.sectionDesc}>
                  Complete cryptographic security audit log of every login attempt
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleClearLogs}
                style={styles.clearLogsButton}
              >
                <Text style={styles.clearLogsButtonText}>Clear Log History</Text>
              </TouchableOpacity>
            </View>

            <AuditTable logs={auditLogs} maxEntries={50} />
          </Card>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  pageCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  successBanner: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#15803d',
    fontWeight: '600',
    fontSize: 13,
  },
  metricsGrid: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    padding: 16,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 2,
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  metricSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  sectionCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  cardHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  domainConfigRow: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    gap: 16,
    alignItems: Platform.select({ web: 'center', default: 'stretch' }),
  },
  currentDomainBox: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  currentDomainLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  currentDomainVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0284c7',
    marginTop: 2,
  },
  domainInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  domainInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  updateDomainButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    opacity: 0.6,
  },
  updateDomainButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  usersList: {
    gap: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
  },
  userAvatarFallback: {
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarFallbackText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  userInfoWrap: {
    flex: 1,
  },
  userNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  userEmailText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  userMetaWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  userMetaDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  clearLogsButton: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearLogsButtonText: {
    color: '#e11d48',
    fontSize: 12,
    fontWeight: '700',
  },
  unauthorizedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
  },
  unauthorizedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  unauthorizedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#991b1b',
    marginBottom: 8,
  },
  unauthorizedDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 400,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
