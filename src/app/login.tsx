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
import { validateDomain } from '@/services/domainValidator';
import { getPlatformDisplayName } from '@/utils/platform';

export default function LoginScreen() {
  const {
    loginWithGoogle,
    isLoading,
    error,
    clearError,
    allowedDomain,
    isGoogleAuthConfigured,
    redirectUri,
  } = useAuth();

  // State for static domain policy checker (does NOT grant session)
  const [testEmailInput, setTestEmailInput] = useState('');
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
  } | null>(null);

  const handleGoogleSignIn = async () => {
    clearError();
    await loginWithGoogle();
  };

  const handleTestDomainCheck = () => {
    if (!testEmailInput.trim()) return;
    const validation = validateDomain(testEmailInput.trim(), allowedDomain);
    setTestResult({
      tested: true,
      valid: validation.isValid,
      message: validation.isValid
        ? `Valid domain format (@${validation.domain}). Requires verified Google OAuth login.`
        : validation.errorMessage ||
          'Access restricted. Please login using your official domain email.',
    });
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
          {/* Top Brand Mark & Title */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>HB</Text>
            </View>
            <Text style={styles.title}>Sign in to HB Plus</Text>
            <Text style={styles.subtitle}>
              Corporate single sign-on portal for authorized team members
            </Text>
          </View>

          {/* Active Error Banner */}
          {error && (
            <Banner
              type="error"
              title="Access Restricted"
              message={error}
              onDismiss={clearError}
            />
          )}

          {/* Configuration Warning if Client IDs are missing */}
          {!isGoogleAuthConfigured && (
            <Banner
              type="warning"
              title="Google OAuth Configuration Required"
              message="No Google Client ID detected for this platform. Please set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env file."
            />
          )}

          {/* Primary Authentication Card */}
          <Card style={styles.authCard}>
            {/* Domain Policy Notice */}
            <View style={styles.policyRow}>
              <Badge
                label={`Domain policy: @${allowedDomain}`}
                variant="info"
                showDot
              />
              <Text style={styles.policySubtext}>Restricted to verified accounts</Text>
            </View>

            {/* Google OAuth Button (Enforces Real Authentication) */}
            <View style={styles.buttonWrapper}>
              <GoogleButton
                onPress={handleGoogleSignIn}
                isLoading={isLoading}
                label="Continue with Google"
              />
            </View>

            {/* Configured OAuth Redirect URI */}
            {redirectUri ? (
              <View style={styles.redirectUriBox}>
                <Text style={styles.redirectUriLabel}>OAuth Authorized Redirect URI:</Text>
                <Text style={styles.redirectUriValue} selectable={true}>
                  {redirectUri}
                </Text>
              </View>
            ) : null}

            {/* Divider */}
            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Zero-Trust Gatekeeper</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footerInfo}>
              <Text style={styles.footerInfoText}>
                Access is strictly restricted to verified{' '}
                <Text style={styles.boldText}>@{allowedDomain}</Text> Google Workspace accounts.
                All other domains are blocked immediately upon authentication.
              </Text>
            </View>
          </Card>

          {/* Informational Domain Whitelist Inspector (Does NOT log in or grant session) */}
          <View style={styles.inspectorCard}>
            <View style={styles.inspectorHeader}>
              <Text style={styles.inspectorTitle}>Domain Policy Inspector</Text>
              <Badge label="Rule Checker Only" variant="neutral" />
            </View>
            <Text style={styles.inspectorDesc}>
              Verify how the gatekeeper validates email addresses against the{' '}
              <Text style={styles.boldText}>@{allowedDomain}</Text> domain restriction:
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                value={testEmailInput}
                onChangeText={(text) => {
                  setTestEmailInput(text);
                  if (testResult) setTestResult(null);
                }}
                placeholder={`e.g. employee@${allowedDomain} or user@gmail.com`}
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.textInput}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={!testEmailInput.trim()}
                onPress={handleTestDomainCheck}
                style={[
                  styles.checkButton,
                  !testEmailInput.trim() && styles.disabledButton,
                ]}
              >
                <Text style={styles.checkButtonText}>Check Rule</Text>
              </TouchableOpacity>
            </View>

            {testResult && (
              <View
                style={[
                  styles.resultBox,
                  testResult.valid ? styles.resultBoxValid : styles.resultBoxInvalid,
                ]}
              >
                <Text
                  style={[
                    styles.resultText,
                    testResult.valid ? styles.resultTextValid : styles.resultTextInvalid,
                  ]}
                >
                  {testResult.message}
                </Text>
              </View>
            )}

            <Text style={styles.inspectorNotice}>
              Notice: This checker evaluates domain syntax and whitelisting only. It does not create
              sessions or grant dashboard access.
            </Text>
          </View>

          {/* Footer Metadata */}
          <View style={styles.bottomMeta}>
            <Text style={styles.metaClientText}>
              Client: {getPlatformDisplayName()} • Enforcing Real Google OAuth 2.0
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
    marginBottom: 16,
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
  inspectorCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inspectorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  inspectorDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
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
  checkButton: {
    height: 38,
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
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
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  resultBox: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 10,
  },
  resultBoxValid: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  resultBoxInvalid: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  resultText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  resultTextValid: {
    color: '#047857',
  },
  resultTextInvalid: {
    color: '#B91C1C',
  },
  inspectorNotice: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  bottomMeta: {
    alignItems: 'center',
    marginTop: 8,
  },
  metaClientText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  redirectUriBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 8,
  },
  redirectUriLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  redirectUriValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
});
