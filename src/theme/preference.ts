import { useCallback, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'light' | 'dark';

const KEY = 'theme-preference';

// null tells RN to follow the phones setting again
export function applyThemePreference(pref: ThemePreference) {
  Appearance.setColorScheme(pref === 'system' ? 'auto' : pref);
}

export async function loadThemePreference(): Promise<ThemePreference> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

// for the settings screen: the current choice, and a function that applies and saves a new one
export function useThemePreference() {
  const [preference, setPref] = useState<ThemePreference>('system');

  useEffect(() => {
    loadThemePreference().then(setPref);
  }, []);

  const setPreference = useCallback(async (next: ThemePreference) => {
    setPref(next);
    applyThemePreference(next);
    try {
      await AsyncStorage.setItem(KEY, next);
    } catch (e) {
      console.log('Could not save the theme preference:', e);
    }
  }, []);

  return { preference, setPreference };
}