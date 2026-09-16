class AppFonts {
  AppFonts._();

  static const String roboto = 'Roboto';
  static const String hanuman = 'Hanuman';
  
  /// Helper to get the correct font family based on locale code (e.g. 'en' or 'km')
  static String getFontForLocale(String languageCode) {
    if (languageCode == 'km') {
      return hanuman;
    }
    return roboto;
  }
}