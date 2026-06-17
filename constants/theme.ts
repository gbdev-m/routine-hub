/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// App Theme Colors
export const AppThemes = {
  dark: {
    background: '#12141C',
    card: '#1E2230',
    text: '#FFFFFF',
    textSecondary: '#B6BEC8',
    border: '#242A38',
    buttonBackground: '#2C3246',
    buttonText: '#FFFFFF',
    modalOverlay: '#1E2230',
    input: '#242A38',
    inputBorder: '#2C3246',
    inputText: '#FFFFFF',
  },
  light: {
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    buttonBackground: '#E5E7EB',
    buttonText: '#1F2937',
    modalOverlay: '#FFFFFF',
    input: '#F3F4F6',
    inputBorder: '#D1D5DB',
    inputText: '#1F2937',
  },
};

export type ThemeMode = 'sistema' | 'escuro' | 'claro';

// Helper to get theme name from mode
export function getActualTheme(mode: ThemeMode, systemColorScheme?: 'light' | 'dark' | null): 'dark' | 'light' {
  if (mode === 'sistema') {
    return systemColorScheme === 'light' ? 'light' : 'dark';
  }
  return mode === 'claro' ? 'light' : 'dark';
}

// Helper to load theme preference from AsyncStorage
export async function loadThemePreference(): Promise<ThemeMode> {
  try {
    const saved = await AsyncStorage.getItem('settings.theme');
    if (saved && ['sistema', 'escuro', 'claro'].includes(saved)) {
      return saved as ThemeMode;
    }
  } catch (e) {
    console.error('Erro ao carregar tema:', e);
  }
  return 'sistema';
}
