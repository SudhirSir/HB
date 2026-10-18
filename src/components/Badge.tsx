import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', style }) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'danger':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
      case 'warning':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      case 'info':
        return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
      case 'primary':
        return { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' };
      case 'neutral':
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg, borderColor: colors.border },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
