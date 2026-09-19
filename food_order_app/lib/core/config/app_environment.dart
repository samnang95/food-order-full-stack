enum AppEnvironment {
  dev,
  staging,
  prod,
}

class AppConfig {
  static AppEnvironment environment = AppEnvironment.dev;

  static bool get isDev => environment == AppEnvironment.dev;
  static bool get isStaging => environment == AppEnvironment.staging;
  static bool get isProd => environment == AppEnvironment.prod;

  static String get name => environment.name.toUpperCase();

  static bool get enableWakelock => isDev;
}
