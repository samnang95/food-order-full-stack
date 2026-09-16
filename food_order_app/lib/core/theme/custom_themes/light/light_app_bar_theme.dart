import 'package:flutter/material.dart';
import '../../../constants/app_colors.dart';
import '../../../constants/app_fonts.dart';

class LightAppBarTheme {
  LightAppBarTheme._();

  static const AppBarTheme theme = AppBarTheme(
    backgroundColor: Colors.transparent,
    elevation: 0,
    centerTitle: true,
    iconTheme: IconThemeData(color: AppColors.neutral),
    titleTextStyle: TextStyle(
      color: AppColors.neutral,
      fontSize: 18,
      fontWeight: FontWeight.w700,
      fontFamily: AppFonts.roboto,
      fontFamilyFallback: [AppFonts.hanuman],
    ),
  );
}
