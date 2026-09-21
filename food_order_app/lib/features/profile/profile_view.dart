import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/db/local_db.dart';
import '../../core/locale/locale_store.dart';
import '../../core/theme/theme_store.dart';
import '../../routes/app_routes.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final username = LocalDB.getString('user_username') ?? 'Food Lover';
    final role = LocalDB.getString('user_role') ?? 'User';

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'profileTitle'.getString(context).isNotEmpty
              ? 'profileTitle'.getString(context)
              : 'My Profile',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        titleSpacing: 16,
      ),
      body: SafeArea(
        child: ListView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          children: [
            // User Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFF97316), Color(0xFFEA580C)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: Center(
                      child: Text(
                        username.isNotEmpty ? username[0].toUpperCase() : 'U',
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          username,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            role.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Quick Stats Card
            Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? const Color(0xFF2E3A52) : AppColors.borderColor,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem(context, '3', 'Orders', Icons.receipt_long_rounded),
                  _buildDivider(isDark),
                  _buildStatItem(context, '120', 'Points', Icons.stars_rounded),
                  _buildDivider(isDark),
                  _buildStatItem(context, '5', 'Favorites', Icons.favorite_rounded),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Settings & Preferences
            Text(
              'Preferences',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white60 : AppColors.subtitleColor,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),

            Material(
              color: cardBg,
              clipBehavior: Clip.antiAlias,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(
                  color: isDark ? const Color(0xFF2E3A52) : AppColors.borderColor,
                ),
              ),
              child: Column(
                children: [
                  // Dark Mode Switch
                  ListTile(
                    leading: const Icon(Icons.dark_mode_rounded, color: AppColors.primary),
                    title: Text(
                      'darkMode'.getString(context).isNotEmpty
                          ? 'darkMode'.getString(context)
                          : 'Dark Mode',
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    trailing: Switch.adaptive(
                      value: isDark,
                      activeThumbColor: AppColors.primary,
                      activeTrackColor: AppColors.primary.withValues(alpha: 0.5),
                      onChanged: (_) {
                        Get.find<ThemeStore>().toggleTheme(context);
                      },
                    ),
                  ),
                  const Divider(height: 1),

                  // Language Switcher
                  ListTile(
                    leading: const Icon(Icons.language_rounded, color: AppColors.primary),
                    title: Text(
                      'language'.getString(context).isNotEmpty
                          ? 'language'.getString(context)
                          : 'Language',
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        (FlutterLocalization.instance.currentLocale?.languageCode ?? 'en') == 'km'
                            ? 'ខ្មែរ (KM)'
                            : 'English (EN)',
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    onTap: () {
                      final current = FlutterLocalization.instance.currentLocale?.languageCode ?? 'en';
                      final next = current == 'en' ? 'km' : 'en';
                      Get.find<LocaleStore>().changeLocale(next);
                    },
                  ),
                  const Divider(height: 1),

                  // Saved Addresses
                  ListTile(
                    leading: const Icon(Icons.location_on_outlined, color: AppColors.primary),
                    title: Text(
                      'savedAddresses'.getString(context).isNotEmpty
                          ? 'savedAddresses'.getString(context)
                          : 'Saved Addresses',
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                    onTap: () {},
                  ),
                  const Divider(height: 1),

                  // Payment Methods
                  ListTile(
                    leading: const Icon(Icons.credit_card_rounded, color: AppColors.primary),
                    title: Text(
                      'paymentMethods'.getString(context).isNotEmpty
                          ? 'paymentMethods'.getString(context)
                          : 'Payment Methods',
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                    onTap: () {},
                  ),
                  const Divider(height: 1),

                  // Help & Support
                  ListTile(
                    leading: const Icon(Icons.help_outline_rounded, color: AppColors.primary),
                    title: Text(
                      'helpCenter'.getString(context).isNotEmpty
                          ? 'helpCenter'.getString(context)
                          : 'Help & Support',
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                    onTap: () {},
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Sign Out Button
            ElevatedButton.icon(
              onPressed: () => _confirmSignOut(context),
              icon: const Icon(Icons.logout_rounded, size: 18),
              label: Text(
                'signOut'.getString(context).isNotEmpty
                    ? 'signOut'.getString(context)
                    : 'Sign Out',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: isDark ? const Color(0xFF2E3A52) : const Color(0xFFFEE2E2),
                foregroundColor: const Color(0xFFEF4444),
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(BuildContext context, String value, String label, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
            color: Theme.of(context).brightness == Brightness.dark
                ? Colors.white54
                : AppColors.subtitleColor,
          ),
        ),
      ],
    );
  }

  Widget _buildDivider(bool isDark) {
    return Container(
      width: 1,
      height: 32,
      color: isDark ? const Color(0xFF2E3A52) : AppColors.borderColor,
    );
  }

  void _confirmSignOut(BuildContext context) {
    Get.defaultDialog(
      title: 'Sign Out',
      middleText: 'Are you sure you want to sign out of BiteCraft?',
      textConfirm: 'Sign Out',
      textCancel: 'Cancel',
      confirmTextColor: Colors.white,
      buttonColor: const Color(0xFFEF4444),
      cancelTextColor: AppColors.subtitleColor,
      onConfirm: () async {
        await LocalDB.remove('auth_token');
        await LocalDB.remove('refresh_token');
        await LocalDB.remove('user_username');
        await LocalDB.remove('user_role');
        Get.offAllNamed(AppRoutes.login);
      },
    );
  }
}
