import { useEffect, useState, useMemo, useCallback } from 'react';
import { ThemeContext } from './theme_context';
import { ThemeMode, THEME_STORAGE_KEY } from './theme_constants';
import { LocalDB } from '../db';

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = LocalDB.getString(THEME_STORAGE_KEY);
    if (saved && Object.values(ThemeMode).includes(saved)) {
      return saved;
    }
    return ThemeMode.SYSTEM;
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for system appearance preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for cross-tab theme changes via LocalDB
  useEffect(() => {
    return LocalDB.addListener(THEME_STORAGE_KEY, (newTheme) => {
      if (newTheme && Object.values(ThemeMode).includes(newTheme)) {
        setThemeState(newTheme);
      }
    });
  }, []);

  // Compute effective dark state
  const isDark = useMemo(() => {
    if (theme === ThemeMode.DARK) return true;
    if (theme === ThemeMode.LIGHT) return false;
    return systemIsDark;
  }, [theme, systemIsDark]);

  // Synchronize 'dark' class on <html> document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const setTheme = useCallback((themeOrUpdater) => {
    setThemeState((prev) => {
      const nextTheme =
        typeof themeOrUpdater === 'function' ? themeOrUpdater(prev) : themeOrUpdater;
      LocalDB.setString(THEME_STORAGE_KEY, nextTheme);
      return nextTheme;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const currentlyDark =
        prev === ThemeMode.DARK || (prev === ThemeMode.SYSTEM && systemIsDark);
      const nextTheme = currentlyDark ? ThemeMode.LIGHT : ThemeMode.DARK;
      LocalDB.setString(THEME_STORAGE_KEY, nextTheme);
      return nextTheme;
    });
  }, [systemIsDark]);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      setTheme,
      toggleTheme,
    }),
    [theme, isDark, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
