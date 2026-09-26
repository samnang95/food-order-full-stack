import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { LanguageContext, SUPPORTED_LANGUAGES } from './language_context';
import { LocalDB, DBKeys } from '../db';
import en from './locales/en.json';
import km from './locales/km.json';

const translations = { en, km };

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = LocalDB.getString(DBKeys.APP_LANGUAGE, 'en');
    return SUPPORTED_LANGUAGES.includes(saved) ? saved : 'en';
  });

  // Sync to <html> tag
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Sync cross-tab language changes
  useEffect(() => {
    return LocalDB.addListener(DBKeys.APP_LANGUAGE, (newLang) => {
      if (newLang && SUPPORTED_LANGUAGES.includes(newLang)) {
        setLanguageState(newLang);
      }
    });
  }, []);

  const changeLanguage = useCallback((newLang) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) return;
    setLanguageState(newLang);
    LocalDB.setString(DBKeys.APP_LANGUAGE, newLang);
  }, []);

  const toggleLanguage = useCallback(() => {
    changeLanguage(language === 'en' ? 'km' : 'en');
  }, [language, changeLanguage]);

  /**
   * Translate helper supporting nested keys and variable interpolation
   * e.g., t('cart.total'), t('cart.addMoreForFree', { amount: '$5' })
   */
  const t = useCallback(
    (keyPath, params = {}) => {
      if (!keyPath || typeof keyPath !== 'string') return '';

      const keys = keyPath.split('.');
      let val = keys.reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), translations[language]);

      // Fallback to English if missing in selected language
      if (val === undefined && language !== 'en') {
        val = keys.reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), translations.en);
      }

      // If still missing, return the last key or full path as graceful fallback
      if (val === undefined) {
        return keys[keys.length - 1] || keyPath;
      }

      if (typeof val !== 'string') return val;

      // Handle parameter interpolation: {amount}, {count}, etc.
      let result = val;
      Object.keys(params).forEach((paramKey) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
      });

      return result;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      isKhmer: language === 'km',
      isEnglish: language === 'en',
      changeLanguage,
      toggleLanguage,
      t,
    }),
    [language, changeLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
