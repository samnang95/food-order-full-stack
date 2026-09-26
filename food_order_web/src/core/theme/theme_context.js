import { createContext } from 'react';
import { ThemeMode } from './theme_constants';

export const ThemeContext = createContext({
  theme: ThemeMode.SYSTEM,
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});
