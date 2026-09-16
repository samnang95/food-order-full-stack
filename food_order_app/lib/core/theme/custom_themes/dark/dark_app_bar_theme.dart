import 'package:flutter/material.dart';
import '../../../constants/app_fonts.dart';

class DarkAppBarTheme {
  DarkAppBarTheme._();

  static const AppBarTheme theme = AppBarTheme(
    backgroundColor: Colors.transparent,
    elevation: 0,
    centerTitle: true,
    iconTheme: IconThemeData(color: Colors.white),
    titleTextStyle: TextStyle(
      color: Colors.white,
      fontSize: 18,
      fontWeight: FontWeight.w700,
      fontFamily: AppFonts.roboto,
      fontFamilyFallback: [AppFonts.hanuman],
    ),
  );
}
