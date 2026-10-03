import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { LocalDB } from '../db/local_db';
import { DBKeys } from '../db/db_keys';

export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'orange' | 'emerald' | 'blue' | 'purple' | 'rose' | 'amber';

export interface AccentOption {
  id: AccentColor;
  label: string;
  hex: string;
  gradientClass: string;
  ringClass: string;
  bgSubtle: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  {
    id: 'orange',
    label: 'Flame Orange',
    hex: '#f97316',
    gradientClass: 'from-orange-500 to-amber-500',
    ringClass: 'ring-orange-500',
    bgSubtle: 'bg-orange-500/15',
  },
  {
    id: 'emerald',
    label: 'Emerald Fresh',
    hex: '#10b981',
    gradientClass: 'from-emerald-500 to-teal-500',
    ringClass: 'ring-emerald-500',
    bgSubtle: 'bg-emerald-500/15',
  },
  {
    id: 'blue',
    label: 'Ocean Cyan',
    hex: '#0ea5e9',
    gradientClass: 'from-sky-500 to-blue-500',
    ringClass: 'ring-sky-500',
    bgSubtle: 'bg-sky-500/15',
  },
  {
    id: 'purple',
    label: 'Royal Violet',
    hex: '#8b5cf6',
    gradientClass: 'from-purple-500 to-pink-500',
    ringClass: 'ring-purple-500',
    bgSubtle: 'bg-purple-500/15',
  },
  {
    id: 'rose',
    label: 'Crimson Spice',
    hex: '#f43f5e',
    gradientClass: 'from-rose-500 to-red-500',
    ringClass: 'ring-rose-500',
    bgSubtle: 'bg-rose-500/15',
  },
  {
    id: 'amber',
    label: 'Golden Amber',
    hex: '#f59e0b',
    gradientClass: 'from-amber-500 to-yellow-500',
    ringClass: 'ring-amber-500',
    bgSubtle: 'bg-amber-500/15',
  },
];

const ACCENT_KEY = 'foodhub_accent_color';

export const useThemeStore = defineStore('theme', () => {
  // State
  const mode = ref<ThemeMode>(
    (LocalDB.getString(DBKeys.THEME_MODE) as ThemeMode) || 'dark'
  );

  const accent = ref<AccentColor>(
    (LocalDB.getString(ACCENT_KEY) as AccentColor) || 'orange'
  );

  const systemIsDark = ref(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  );

  // Resolved active mode ('dark' or 'light')
  const resolvedMode = computed<'dark' | 'light'>(() => {
    if (mode.value === 'system') {
      return systemIsDark.value ? 'dark' : 'light';
    }
    return mode.value;
  });

  const isDark = computed(() => resolvedMode.value === 'dark');

  const currentAccent = computed(() => {
    return ACCENT_OPTIONS.find((a) => a.id === accent.value) || ACCENT_OPTIONS[0];
  });

  // Apply DOM classes and attributes
  function applyThemeToDOM(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Toggle dark class
    if (resolvedMode.value === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Set accent attribute
    root.setAttribute('data-accent', accent.value);
  }

  // Setup system listener
  function setupSystemListener(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      systemIsDark.value = e.matches;
      if (mode.value === 'system') {
        applyThemeToDOM();
      }
    });
  }

  // Actions
  function setMode(newMode: ThemeMode): void {
    mode.value = newMode;
    LocalDB.setString(DBKeys.THEME_MODE, newMode);
    applyThemeToDOM();
  }

  function setAccent(newAccent: AccentColor): void {
    accent.value = newAccent;
    LocalDB.setString(ACCENT_KEY, newAccent);
    applyThemeToDOM();
  }

  function toggleMode(): void {
    if (mode.value === 'dark') {
      setMode('light');
    } else if (mode.value === 'light') {
      setMode('system');
    } else {
      setMode('dark');
    }
  }

  // Init
  function initTheme(): void {
    setupSystemListener();
    applyThemeToDOM();
  }

  return {
    mode,
    resolvedMode,
    isDark,
    accent,
    currentAccent,
    setMode,
    setAccent,
    toggleMode,
    initTheme,
  };
});
