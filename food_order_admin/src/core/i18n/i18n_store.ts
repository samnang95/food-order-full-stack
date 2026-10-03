import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { i18n, SUPPORTED_LOCALES, type SupportedLocale, type LocaleOption } from './index';
import { LocalDB } from '../db/local_db';
import { DBKeys } from '../db/db_keys';

export const useI18nStore = defineStore('i18n', () => {
  const currentLocale = ref<SupportedLocale>('en');

  const activeLocaleOption = computed<LocaleOption>(() => {
    return SUPPORTED_LOCALES.find((l) => l.code === currentLocale.value) || SUPPORTED_LOCALES[0];
  });

  const isKhmer = computed(() => currentLocale.value === 'km');
  const isEnglish = computed(() => currentLocale.value === 'en');

  function applyLocaleToDom(locale: SupportedLocale) {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      if (locale === 'km') {
        document.documentElement.classList.add('locale-km');
      } else {
        document.documentElement.classList.remove('locale-km');
      }
    }
  }

  function setLocale(locale: SupportedLocale) {
    if (locale !== 'en' && locale !== 'km') return;
    currentLocale.value = locale;

    // In vue-i18n composition mode (legacy: false), locale is a Ref
    if (typeof (i18n.global.locale as unknown as { value: string }).value !== 'undefined') {
      (i18n.global.locale as unknown as { value: string }).value = locale;
    } else {
      (i18n.global as unknown as { locale: string }).locale = locale;
    }

    applyLocaleToDom(locale);
    LocalDB.setString(DBKeys.LOCALE, locale);
  }

  function toggleLocale() {
    setLocale(currentLocale.value === 'en' ? 'km' : 'en');
  }

  function initLocale() {
    const saved = LocalDB.getString(DBKeys.LOCALE, 'en') as SupportedLocale;
    const initial = saved === 'km' ? 'km' : 'en';
    setLocale(initial);
  }

  return {
    currentLocale,
    activeLocaleOption,
    supportedLocales: SUPPORTED_LOCALES,
    isKhmer,
    isEnglish,
    setLocale,
    toggleLocale,
    initLocale,
  };
});
