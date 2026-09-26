import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_fonts.dart';

import 'custom_themes/light/light_app_bar_theme.dart';
import 'custom_themes/light/light_elevated_button_theme.dart';
import 'custom_themes/light/light_input_decoration_theme.dart';
import 'custom_themes/light/light_text_theme.dart';

import 'custom_themes/dark/dark_app_bar_theme.dart';
import 'custom_themes/dark/dark_elevated_button_theme.dart';
import 'custom_themes/dark/dark_input_decoration_theme.dart';
import 'custom_themes/dark/dark_text_theme.dart';

class AppTheme {
  AppTheme._();

  static final ThemeData lightTheme = _buildLightTheme();
  static final ThemeData darkTheme = _buildDarkTheme();

  static ThemeData _buildLightTheme() {
    return ThemeData(
      useMaterial3: true,
      fontFamily: AppFonts.roboto,
      fontFamilyFallback: const [AppFonts.hanuman],
      scaffoldBackgroundColor: const Color(0xffFFEDE6),
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: Colors.white,
      ),
      appBarTheme: LightAppBarTheme.theme,
      elevatedButtonTheme: LightElevatedButtonTheme.theme,
      inputDecorationTheme: LightInputDecorationTheme.theme,
      textTheme: LightTextTheme.theme,
    );
  }

  static ThemeData _buildDarkTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: AppFonts.roboto,
      fontFamilyFallback: const [AppFonts.hanuman],
      scaffoldBackgroundColor: const Color(0xff263143),
      colorScheme: ColorScheme.fromSeed(
        brightness: Brightness.dark,
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: const Color(0xFF1E1E1E),
      ),
      appBarTheme: DarkAppBarTheme.theme,
      elevatedButtonTheme: DarkElevatedButtonTheme.theme,
      inputDecorationTheme: DarkInputDecorationTheme.theme,
      textTheme: DarkTextTheme.theme,
    );
  }
}
