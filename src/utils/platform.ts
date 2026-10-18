import { Platform, Dimensions } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export function getPlatformType(): 'web' | 'ios' | 'android' | 'other' {
  if (Platform.OS === 'web') return 'web';
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'other';
}

export function getPlatformDisplayName(): string {
  switch (Platform.OS) {
    case 'web':
      return 'Web Browser';
    case 'ios':
      return 'Apple iOS';
    case 'android':
      return 'Google Android';
    default:
      return 'Mobile';
  }
}

export function isLargeScreen(): boolean {
  if (!isWeb) return false;
  return Dimensions.get('window').width >= 768;
}
