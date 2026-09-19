import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_localization/flutter_localization.dart';
import '../db/local_db.dart';

class LocaleStore extends GetxController {
  final Rx<Locale> locale = const Locale('en').obs;

  @override
  void onInit() {
    super.onInit();
    final current = FlutterLocalization.instance.currentLocale;
    if (current != null) {
      locale.value = current;
    }
    FlutterLocalization.instance.onTranslatedLanguage = _onTranslatedLanguage;
  }

  void _onTranslatedLanguage(Locale? newLocale) {
    if (newLocale != null) {
      locale.value = newLocale;
    }
  }

  void changeLocale(String languageCode) {
    FlutterLocalization.instance.translate(languageCode);
    LocalDB.setString('app_language', languageCode);
    locale.value = Locale(languageCode);
    Get.updateLocale(Locale(languageCode));
  }
}
