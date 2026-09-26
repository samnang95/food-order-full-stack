import { useEffect, useState, useMemo, useCallback } from 'react';
import { ThemeContext } from './theme_context';
import { ThemeMode, THEME_STORAGE_KEY } from './theme_constants';

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && Object.values(ThemeMode).includes(saved)) {
        return saved;
      }
    } catch {
      // LocalStorage access fallback
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

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage error
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === ThemeMode.LIGHT) return ThemeMode.DARK;
      if (prev === ThemeMode.DARK) return ThemeMode.LIGHT;
      // If currently system, toggle opposite to current system state
      return isDark ? ThemeMode.LIGHT : ThemeMode.DARK;
    });
  }, [isDark, setTheme]);

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
