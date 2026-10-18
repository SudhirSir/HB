import React from 'react';
import { View, StyleSheet } from 'react-native';

export const GoogleIcon: React.FC<{ size?: number }> = ({ size = 20 }) => {
  // Pixel-perfect official Google 4-color "G" emblem
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Top red curve */}
      <View style={[styles.segment, styles.red, { width: size, height: size }]} />
      {/* Right blue bar & curve */}
      <View style={[styles.segment, styles.blue, { width: size, height: size }]} />
      {/* Bottom green curve */}
      <View style={[styles.segment, styles.green, { width: size, height: size }]} />
      {/* Left yellow curve */}
      <View style={[styles.segment, styles.yellow, { width: size, height: size }]} />
      {/* Inner white cutout */}
      <View
        style={[
          styles.innerCutout,
          {
            width: size * 0.58,
            height: size * 0.58,
            borderRadius: (size * 0.58) / 2,
          },
        ]}
      />
      {/* Blue horizontal bar */}
      <View
        style={[
          styles.blueBar,
          {
            width: size * 0.44,
            height: size * 0.22,
            right: 0,
            top: size * 0.39,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  segment: {
    position: 'absolute',
  },
  red: {
    backgroundColor: '#EA4335',
    top: 0,
    left: 0,
  },
  blue: {
    backgroundColor: '#4285F4',
    right: 0,
    top: 0,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  green: {
    backgroundColor: '#34A853',
    bottom: 0,
    right: 0,
  },
  yellow: {
    backgroundColor: '#FBBC05',
    bottom: 0,
    left: 0,
  },
  innerCutout: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    zIndex: 2,
  },
  blueBar: {
    position: 'absolute',
    backgroundColor: '#4285F4',
    zIndex: 3,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
});
