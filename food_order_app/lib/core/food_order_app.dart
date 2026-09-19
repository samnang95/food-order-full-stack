import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_localization/flutter_localization.dart';

import '../routes/app_router.dart';
import 'bindings/initial_binding.dart';
import 'locale/locale_store.dart';
import 'theme/app_theme.dart';
import 'theme/theme_store.dart';

final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

class FoodOrderApp extends StatelessWidget {
  const FoodOrderApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeStore = Get.find<ThemeStore>();
    final localeStore = Get.find<LocaleStore>();

    return Obx(() {
      // Access both reactive values to trigger rebuild on change
      final _ = localeStore.locale.value;
      return GetMaterialApp(
        supportedLocales: FlutterLocalization.instance.supportedLocales,
        localizationsDelegates: FlutterLocalization.instance.localizationsDelegates,
        title: 'BiteCraft',
        scaffoldMessengerKey: scaffoldMessengerKey,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: themeStore.themeMode,
        initialBinding: InitialBinding(),
        initialRoute: AppRouter.initialRoute,
        getPages: AppRouter.pages,
        builder: (context, child) {
          return GestureDetector(
            onTap: () => FocusManager.instance.primaryFocus?.unfocus(),
            child: child,
          );
        },
      );
    });
  }
}