import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

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
  const getColors = () => {
    switch (type) {
      case 'error':
        return {
          bg: '#fef2f2',
          border: '#f87171',
          text: '#991b1b',
          title: '#7f1d1d',
          icon: '⚠️',
        };
      case 'warning':
        return {
          bg: '#fffbeb',
          border: '#fcd34d',
          text: '#92400e',
          title: '#78350f',
          icon: '⚡',
        };
      case 'success':
        return {
          bg: '#f0fdf4',
          border: '#86efac',
          text: '#166534',
          title: '#14532d',
          icon: '✅',
        };
      case 'info':
      default:
        return {
          bg: '#f0f9ff',
          border: '#7dd3fc',
          text: '#075985',
          title: '#0c4a6e',
          icon: 'ℹ️',
        };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
    >
      <View style={styles.contentRow}>
        <Text style={styles.icon}>{colors.icon}</Text>
        <View style={styles.textContainer}>
          {title ? (
            <Text style={[styles.title, { color: colors.title }]}>{title}</Text>
          ) : null}
          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    marginVertical: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  dismissButton: {
    padding: 6,
    marginLeft: 8,
  },
  dismissText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
  },
});
