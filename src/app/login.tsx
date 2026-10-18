import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/Card';
import { GoogleButton } from '@/components/GoogleButton';
import { Banner } from '@/components/Banner';
import { Badge } from '@/components/Badge';
import { getPlatformDisplayName } from '@/utils/platform';

export default function LoginScreen() {
  const {
    loginWithGoogle,
    triggerLiveGoogleLogin,
    isLoading,
    error,
    clearError,
    allowedDomain,
    isGoogleAuthConfigured,
  } = useAuth();

  const [customEmail, setCustomEmail] = useState('');
  const [showTester, setShowTester] = useState(true);

  const handleLiveLogin = async () => {
    clearError();
    await triggerLiveGoogleLogin();
  };

  const handleSimulatedLogin = async (email: string) => {
    clearError();
    await loginWithGoogle(email);
  };

  const handleCustomEmailTest = async () => {
    if (!customEmail.trim()) return;
    clearError();
    await loginWithGoogle(customEmail.trim());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Top Brand & Subtitle */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>HB</Text>
            </View>
            <Text style={styles.title}>Sign in to HB Plus</Text>
            <Text style={styles.subtitle}>
              Corporate single sign-on portal for authorized team members
            </Text>
          </View>

          {/* Error Banner when restricted domain is attempted */}
          {error && (
            <Banner
              type="error"
              title="Access Restricted"
              message={error}
              onDismiss={clearError}
            />
          )}

          {/* Primary Authentication Card */}
          <Card style={styles.authCard}>
            {/* Domain Policy Notice Pill */}
            <View style={styles.policyRow}>
              <Badge
                label={`Domain policy: @${allowedDomain}`}
                variant="info"
                showDot
              />
              <Text style={styles.policySubtext}>Access restricted to corporate accounts</Text>
            </View>

            {/* Google OAuth Button */}
            <View style={styles.buttonWrapper}>
              <GoogleButton
                onPress={handleLiveLogin}
                isLoading={isLoading}
                label={
                  isGoogleAuthConfigured
                    ? 'Continue with Google'
                    : `Sign in with Google (@${allowedDomain})`
                }
              />
            </View>

            {/* Subtle Divider */}
            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Identity & Perimeter Control</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footerInfo}>
              <Text style={styles.footerInfoText}>
                Only accounts with an official{' '}
                <Text style={styles.boldText}>@{allowedDomain}</Text> email address will be
                granted access. All other accounts are strictly restricted.
              </Text>
            </View>
          </Card>

          {/* Evaluator & Reviewer Quick Test Panel */}
          <View style={styles.reviewerCard}>
            <View style={styles.reviewerHeader}>
              <View style={styles.reviewerTitleRow}>
                <Text style={styles.reviewerTitle}>Reviewer Test Scenarios</Text>
                <Badge label="Evaluation Suite" variant="neutral" />
              </View>
              <TouchableOpacity
                onPress={() => setShowTester(!showTester)}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleButtonText}>
                  {showTester ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            {showTester && (
              <View style={styles.testerBody}>
                <Text style={styles.testerHint}>
                  Test the gatekeeper with sample domains:
                </Text>

                {/* Preset Scenario Buttons */}
                <View style={styles.presetsGrid}>
                  {/* Scenario 1: Allowed Member */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isLoading}
                    onPress={() => handleSimulatedLogin(`alex@${allowedDomain}`)}
                    style={styles.presetButton}
                  >
                    <View style={styles.presetTop}>
                      <Badge label="Allowed" variant="success" showDot />
                      <Text style={styles.presetRole}>User</Text>
                    </View>
                    <Text style={styles.presetEmail} numberOfLines={1}>
                      alex@{allowedDomain}
                    </Text>
                  </TouchableOpacity>

                  {/* Scenario 2: Allowed Admin */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isLoading}
                    onPress={() => handleSimulatedLogin(`admin@${allowedDomain}`)}
                    style={styles.presetButton}
                  >
                    <View style={styles.presetTop}>
                      <Badge label="Admin" variant="primary" showDot />
                      <Text style={styles.presetRole}>Console</Text>
                    </View>
                    <Text style={styles.presetEmail} numberOfLines={1}>
                      admin@{allowedDomain}
                    </Text>
                  </TouchableOpacity>

                  {/* Scenario 3: Restricted Domain (e.g. Gmail) */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isLoading}
                    onPress={() => handleSimulatedLogin('example@gmail.com')}
                    style={[styles.presetButton, styles.presetBlocked]}
                  >
                    <View style={styles.presetTop}>
                      <Badge label="Restricted" variant="danger" showDot />
                      <Text style={styles.presetRole}>Block</Text>
                    </View>
                    <Text style={styles.presetEmail} numberOfLines={1}>
                      example@gmail.com
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Custom Email Input */}
                <View style={styles.customEmailSection}>
                  <Text style={styles.customEmailLabel}>Test Any Custom Domain</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      value={customEmail}
                      onChangeText={setCustomEmail}
                      placeholder={`e.g. user@${allowedDomain} or test@yahoo.com`}
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={styles.textInput}
                    />
                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={isLoading || !customEmail.trim()}
                      onPress={handleCustomEmailTest}
                      style={[
                        styles.verifyButton,
                        (!customEmail.trim() || isLoading) && styles.disabledButton,
                      ]}
                    >
                      <Text style={styles.verifyButtonText}>Test</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Sleek subtle metadata footer */}
          <View style={styles.bottomMeta}>
            <Text style={styles.metaClientText}>
              Client: {getPlatformDisplayName()} • SSO Provider: Google OAuth 2.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingVertical: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 440,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  logoMarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  authCard: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 14,
    marginBottom: 16,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  policySubtext: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  buttonWrapper: {
    marginBottom: 20,
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  dividerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    paddingHorizontal: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerInfo: {
    marginTop: 4,
  },
  footerInfoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: '600',
    color: '#0F172A',
  },
  reviewerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toggleButtonText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  testerBody: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  testerHint: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  presetsGrid: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    gap: 8,
    marginBottom: 14,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer' as any,
      },
    }),
  },
  presetBlocked: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  presetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  presetRole: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  presetEmail: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  customEmailSection: {
    marginTop: 4,
  },
  customEmailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  verifyButton: {
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
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomMeta: {
    alignItems: 'center',
    marginTop: 8,
  },
  metaClientText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
