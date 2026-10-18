import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  showDot?: boolean;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  showDot = false,
  style,
}) => {
  const getTheme = () => {
    switch (variant) {
      case 'success':
        return {
          bg: '#ECFDF5',
          text: '#047857',
          border: '#D1FAE5',
          dot: '#10B981',
        };
      case 'danger':
        return {
          bg: '#FEF2F2',
          text: '#B91C1C',
          border: '#FEE2E2',
          dot: '#EF4444',
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          text: '#B45309',
          border: '#FEF3C7',
          dot: '#F59E0B',
        };
      case 'info':
        return {
          bg: '#F0F9FF',
          text: '#0369A1',
          border: '#E0F2FE',
          dot: '#0EA5E9',
        };
      case 'primary':
        return {
          bg: '#F5F3FF',
          text: '#6D28D9',
          border: '#EDE9FE',
          dot: '#8B5CF6',
        };
      case 'neutral':
      default:
        return {
          bg: '#F8FAFC',
          text: '#475569',
          border: '#E2E8F0',
          dot: '#94A3B8',
        };
    }
  };

  const theme = getTheme();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: theme.bg, borderColor: theme.border },
        style,
      ]}
    >
      {showDot && <View style={[styles.dot, { backgroundColor: theme.dot }]} />}
      <Text style={[styles.text, { color: theme.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
