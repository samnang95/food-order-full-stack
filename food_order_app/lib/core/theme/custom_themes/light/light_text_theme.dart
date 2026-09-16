import 'package:flutter/material.dart';
import '../../../constants/app_colors.dart';
import '../../../constants/app_fonts.dart';

class LightTextTheme {
  LightTextTheme._();

  static const _baseFamily = AppFonts.roboto;
  static const _fallback = [AppFonts.hanuman];

  static TextTheme theme = TextTheme(
    displayLarge: const TextStyle().copyWith(fontSize: 57.0, fontWeight: FontWeight.bold, color: AppColors.neutral, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    displayMedium: const TextStyle().copyWith(fontSize: 45.0, fontWeight: FontWeight.bold, color: AppColors.neutral, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    displaySmall: const TextStyle().copyWith(fontSize: 36.0, fontWeight: FontWeight.bold, color: AppColors.neutral, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    headlineLarge: const TextStyle().copyWith(fontSize: 32.0, fontWeight: FontWeight.bold, color: AppColors.neutral, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    headlineMedium: const TextStyle().copyWith(fontSize: 28.0, fontWeight: FontWeight.bold, color: AppColors.neutral, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    headlineSmall: const TextStyle().copyWith(fontSize: 24.0, fontWeight: FontWeight.bold, color: AppColors.neutral, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    titleLarge: const TextStyle().copyWith(fontSize: 22.0, fontWeight: FontWeight.bold, color: AppColors.neutral, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    titleMedium: const TextStyle().copyWith(fontSize: 16.0, fontWeight: FontWeight.w600, color: AppColors.neutral, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    titleSmall: const TextStyle().copyWith(fontSize: 14.0, fontWeight: FontWeight.w600, color: AppColors.neutral, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    bodyLarge: const TextStyle().copyWith(fontSize: 16.0, fontWeight: FontWeight.normal, color: AppColors.neutral, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    bodyMedium: const TextStyle().copyWith(fontSize: 14.0, fontWeight: FontWeight.normal, color: AppColors.neutral, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    bodySmall: const TextStyle().copyWith(fontSize: 12.0, fontWeight: FontWeight.normal, color: AppColors.subtitleColor, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    labelLarge: const TextStyle().copyWith(fontSize: 14.0, fontWeight: FontWeight.bold, color: AppColors.neutral, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
    labelMedium: const TextStyle().copyWith(fontSize: 12.0, fontWeight: FontWeight.bold, color: AppColors.subtitleColor, fontFamily: _baseFamily, fontFamilyFallback: _fallback),
  );
}
