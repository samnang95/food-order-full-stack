import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'core/food_order_app.dart';
import 'core/db/local_db.dart';
import 'core/services/services_network.dart';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/theme/theme_store.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LocalDB.init();
  NetworkService.instance.initialize(scaffoldMessengerKey);
  
  final String enJson = await rootBundle.loadString('assets/translate/en.json');
  final String kmJson = await rootBundle.loadString('assets/translate/km.json');
  
  final Map<String, dynamic> enMap = json.decode(enJson);
  final Map<String, dynamic> kmMap = json.decode(kmJson);
  
  await FlutterLocalization.instance.ensureInitialized();
  final savedLanguage = LocalDB.getString('app_language') ?? 'en';
  
  FlutterLocalization.instance.init(
    mapLocales: [MapLocale('en', enMap), MapLocale('km', kmMap)],
    initLanguageCode: savedLanguage,
  );

  runApp(
    BlocProvider(
      create: (_) => ThemeStore(),
      child: const FoodOrderApp(),
    ),
  );
}