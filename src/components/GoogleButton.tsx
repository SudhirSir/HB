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
  label = 'Sign in with Google',
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        (disabled || isLoading) && styles.disabledButton,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#1e293b" />
      ) : (
        <>
          <View style={styles.iconContainer}>
            {/* Multi-colored Google "G" Icon in pure React Native elements */}
            <View style={styles.googleGContainer}>
              <Text style={styles.googleGLetter}>G</Text>
            </View>
          </View>
          <Text style={styles.buttonText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#dadce0',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 20,
    ...Platform.select({
      web: {
        cursor: 'pointer' as any,
        boxShadow: '0 1px 3px rgba(60,64,67, 0.08), 0 1px 2px rgba(60,64,67, 0.16)',
        transition: 'all 0.15s ease-in-out',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
      },
    }),
  },
  disabledButton: {
    opacity: 0.6,
    ...Platform.select({
      web: {
        cursor: 'not-allowed' as any,
      },
    }),
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGLetter: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Helvetica Neue', android: 'Roboto', default: 'sans-serif' }),
  },
  buttonText: {
    color: '#3c4043',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
