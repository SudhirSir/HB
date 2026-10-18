import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface BannerProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export const Banner: React.FC<BannerProps> = ({
  type = 'error',
  title,
  message,
  onDismiss,
}) => {
  const getTheme = () => {
    switch (type) {
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#FCA5A5',
          title: '#991B1B',
          text: '#7F1D1D',
          badge: '#DC2626',
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#FCD34D',
          title: '#92400E',
          text: '#78350F',
          badge: '#D97706',
        };
      case 'success':
        return {
          bg: '#ECFDF5',
          border: '#A7F3D0',
          title: '#065F46',
          text: '#047857',
          badge: '#059669',
        };
      case 'info':
      default:
        return {
          bg: '#F0F9FF',
          border: '#BAE6FD',
          title: '#0369A1',
          text: '#0C4A6E',
          badge: '#0284C7',
        };
    }
  };

  const theme = getTheme();

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: theme.bg, borderColor: theme.border },
      ]}
    >
      <View style={styles.contentWrap}>
        <View style={[styles.indicatorBar, { backgroundColor: theme.badge }]} />
        <View style={styles.textContainer}>
          {title ? (
            <Text style={[styles.title, { color: theme.title }]}>{title}</Text>
          ) : null}
          <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onDismiss}
            style={styles.closeButton}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 12,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  contentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  indicatorBar: {
    width: 3,
    height: '100%',
    minHeight: 28,
    borderRadius: 2,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  message: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  closeButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 4,
  },
  closeIcon: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
