import { DBKeys } from '../db/db_keys';

export const ThemeMode = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
});

export const THEME_STORAGE_KEY = DBKeys.THEME_MODE;
