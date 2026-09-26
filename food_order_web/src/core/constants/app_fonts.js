export const AppFonts = Object.freeze({
  ROBOTO: 'Roboto',
  HANUMAN: 'Hanuman',
  FAMILY: "'Roboto', 'Hanuman', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  getFontForLocale(languageCode = 'en') {
    if (languageCode === 'km') {
      return this.HANUMAN;
    }
    return this.ROBOTO;
  },
});
