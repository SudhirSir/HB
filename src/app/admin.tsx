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
          <Text style={styles.unauthorizedTitle}>Administrator Access Required</Text>
          <Text style={styles.unauthorizedDesc}>
            Your current account ({user?.email || 'Guest'}) does not hold super-admin permissions.
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
    setSuccessMsg(`Allowed domain updated to @${cleanDomain}`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleClearLogs = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Clear all recorded authentication audit logs?')) {
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
              <Text style={styles.pageTitle}>Security Administration</Text>
              <Text style={styles.pageSubtitle}>
                Domain whitelist management, identity directory, and perimeter telemetry
              </Text>
            </View>
            <Badge label="Super Admin" variant="primary" showDot />
          </View>

          {successMsg && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          {/* Telemetry Metrics Row */}
          <View style={styles.metricsGrid}>
            <Card style={styles.metricCard}>
              <Text style={styles.metricValue}>{totalAttempts}</Text>
              <Text style={styles.metricTitle}>Total Auth Requests</Text>
              <Text style={styles.metricSubtitle}>Through OAuth gatekeeper</Text>
            </Card>

            <Card style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#047857' }]}>{allowedCount}</Text>
              <Text style={styles.metricTitle}>Allowed Logins</Text>
              <Text style={styles.metricSubtitle}>Matched @{allowedDomain}</Text>
            </Card>

            <Card style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#B91C1C' }]}>{restrictedCount}</Text>
              <Text style={styles.metricTitle}>Blocked Attempts</Text>
              <Text style={styles.metricSubtitle}>Restricted domain mismatch</Text>
            </Card>

            <Card style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#6D28D9' }]}>{registeredUsers.length}</Text>
              <Text style={styles.metricTitle}>Directory Profiles</Text>
              <Text style={styles.metricSubtitle}>{enforcementRate}% compliance rate</Text>
            </Card>
          </View>

          {/* Domain Whitelist Configuration Card */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Domain Whitelist Policy</Text>
            <Text style={styles.sectionDesc}>
              Update the active corporate domain. Only Google accounts belonging to this domain
              will be allowed to authenticate.
            </Text>

            <View style={styles.domainConfigRow}>
              <View style={styles.currentDomainPill}>
                <Text style={styles.currentDomainLabel}>Active Policy:</Text>
                <Text style={styles.currentDomainVal}>@{allowedDomain}</Text>
              </View>

              <View style={styles.domainInputWrapper}>
                <TextInput
                  value={newDomainInput}
                  onChangeText={setNewDomainInput}
                  placeholder="e.g. hbplus.fit or acme.org"
                  placeholderTextColor="#94A3B8"
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

          {/* Registered Users Directory */}
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderWithAction}>
              <View>
                <Text style={styles.sectionTitle}>User Directory</Text>
                <Text style={styles.sectionDesc}>
                  Profiles registered in the persistent corporate database
                </Text>
              </View>
              <Badge label={`${registeredUsers.length} Users`} variant="neutral" />
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
                      label={u.role === 'admin' ? 'Super Admin' : 'Member'}
                      variant={u.role === 'admin' ? 'primary' : 'neutral'}
                      showDot
                    />
                    <Text style={styles.userMetaDate}>
                      Last active: {new Date(u.lastLoginAt).toLocaleDateString()}
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
                  Chronological security audit log of every login attempt
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
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
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#047857',
    fontWeight: '500',
    fontSize: 13,
  },
  metricsGrid: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    padding: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  metricSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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
    gap: 12,
    alignItems: Platform.select({ web: 'center', default: 'stretch' }),
  },
  currentDomainPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentDomainLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  currentDomainVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  domainInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  domainInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  updateDomainButton: {
    height: 38,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer' as any,
      },
    }),
  },
  disabledButton: {
    opacity: 0.5,
  },
  updateDomainButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  usersList: {
    gap: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  userAvatarFallback: {
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarFallbackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  userInfoWrap: {
    flex: 1,
  },
  userNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  userEmailText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  userMetaWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  userMetaDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  clearLogsButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer' as any,
      },
    }),
  },
  clearLogsButtonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  unauthorizedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
  },
  unauthorizedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  unauthorizedDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 360,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
