import { createI18n } from 'vue-i18n';
import en from './locales/en';
import km from './locales/km';
import { LocalDB } from '../db/local_db';
import { DBKeys } from '../db/db_keys';

export type SupportedLocale = 'en' | 'km';

export interface LocaleOption {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  shortLabel: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  {
    code: 'en',
    name: 'English (US)',
    nativeName: 'English',
    flag: '🇬🇧',
    shortLabel: 'EN',
  },
  {
    code: 'km',
    name: 'Khmer (Cambodia)',
    nativeName: 'ភាសាខ្មែរ',
    flag: '🇰🇭',
    shortLabel: 'KH',
  },
];

const savedLocale = (LocalDB.getString(DBKeys.LOCALE, 'en') as SupportedLocale) || 'en';
const initialLocale: SupportedLocale = savedLocale === 'km' ? 'km' : 'en';

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    km,
  },
});

export default i18n;
