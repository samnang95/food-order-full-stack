import 'package:flutter/material.dart';

import 'package:flutter_localization/flutter_localization.dart';

import '../routes/app_router.dart';
import 'theme/app_theme.dart';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'theme/theme_store.dart';

final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

class FoodOrderApp extends StatefulWidget {
  const FoodOrderApp({super.key});

  @override
  State<FoodOrderApp> createState() => _FoodOrderAppState();
}

class _FoodOrderAppState extends State<FoodOrderApp> {
  @override
  void initState() {
    super.initState();
    FlutterLocalization.instance.onTranslatedLanguage = _onTranslatedLanguage;
  }

  void _onTranslatedLanguage(Locale? locale) {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeStore, ThemeMode>(
      builder: (context, themeMode) {
        return MaterialApp.router(
          supportedLocales: FlutterLocalization.instance.supportedLocales,
          localizationsDelegates: FlutterLocalization.instance.localizationsDelegates,
          title: 'BiteCraft',
          scaffoldMessengerKey: scaffoldMessengerKey,
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: themeMode,
          routerConfig: AppRouter.router,
        );
      },
    );
  }
}