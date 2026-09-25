import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';
import 'core/config/app_environment.dart';
import 'core/db/local_db.dart';
import 'core/food_order_app.dart';
import 'core/locale/locale_store.dart';
import 'core/locale/translation_helper.dart';
import 'core/services/cart_service.dart';
import 'core/services/favorites_service.dart';
import 'core/services/firebase_notification_service.dart';
import 'core/services/local_notification_service.dart';
import 'core/services/services_network.dart';
import 'core/services/wakelock_service.dart';
import 'core/theme/theme_store.dart';
import 'features/notifications/notification_store.dart';
import 'firebase_options.dart';

Future<void> runFoodOrderApp({
  required String envFile,
  required AppEnvironment environment,
}) async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  AppConfig.environment = environment;
  await dotenv.load(fileName: envFile);
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await LocalDB.init();
  await WakelockService.initialize();
  await LocalNotificationService.instance.initialize();
  NetworkService.instance.initialize(scaffoldMessengerKey);
  
  final String enJson = await rootBundle.loadString('assets/translate/en.json');
  final String kmJson = await rootBundle.loadString('assets/translate/km.json');
  
  final Map<String, dynamic> enMap = TranslationHelper.flatten(json.decode(enJson));
  final Map<String, dynamic> kmMap = TranslationHelper.flatten(json.decode(kmJson));
  
  await FlutterLocalization.instance.ensureInitialized();
  final savedLanguage = LocalDB.getString('app_language') ?? 'en';
  
  FlutterLocalization.instance.init(
    mapLocales: [MapLocale('en', enMap), MapLocale('km', kmMap)],
    initLanguageCode: savedLanguage,
  );

  // Global controllers needed before GetMaterialApp builds
  Get.put(ThemeStore(), permanent: true);
  Get.put(LocaleStore(), permanent: true);
  Get.put(FavoritesService(), permanent: true);
  Get.put(CartService(), permanent: true);
  Get.put(NotificationStore(), permanent: true);

  await FirebaseNotificationService.instance.initialize();

  runApp(const FoodOrderApp());
}
