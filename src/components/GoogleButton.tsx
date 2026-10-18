import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import { GoogleIcon } from './GoogleIcon';

interface GoogleButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  style?: ViewStyle;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
  label = 'Continue with Google',
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        (disabled || isLoading) && styles.disabledButton,
        style,
      ]}
    >
      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#0F172A" />
          <Text style={styles.loadingText}>Authenticating with Google...</Text>
        </View>
      ) : (
        <View style={styles.contentRow}>
          <View style={styles.iconWrapper}>
            <GoogleIcon size={18} />
          </View>
          <Text style={styles.buttonText}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    ...Platform.select({
      web: {
        cursor: 'pointer' as any,
        transition: 'all 0.15s ease',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      default: {
        elevation: 1,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
  disabledButton: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        cursor: 'not-allowed' as any,
      },
    }),
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
});
