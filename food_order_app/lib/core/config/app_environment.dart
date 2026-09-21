import 'package:flutter_dotenv/flutter_dotenv.dart';

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

  static String get googleServerClientId {
    try {
      if (dotenv.isInitialized) {
        return dotenv.env['GOOGLE_SERVER_CLIENT_ID'] ??
            '292432059407-su4bs36ab566qrakbfliurt01epc3pi5.apps.googleusercontent.com';
      }
    } catch (_) {}
    return '292432059407-su4bs36ab566qrakbfliurt01epc3pi5.apps.googleusercontent.com';
  }
}

