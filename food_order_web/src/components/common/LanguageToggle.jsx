import { useTranslation } from '../../core';

export function LanguageToggle() {
  const { language, toggleLanguage, isKhmer } = useTranslation();

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      aria-label={isKhmer ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'}
      title={isKhmer ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'}
      className="relative px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs hover:shadow-sm focus:outline-hidden flex items-center space-x-1.5 text-xs font-bold active:scale-95"
    >
      <span className="text-sm leading-none" role="img" aria-hidden="true">
        {isKhmer ? '🇰🇭' : '🇬🇧'}
      </span>
      <span className="tracking-wide uppercase font-black text-[11px]">
        {language}
      </span>
    </button>
  );
}
