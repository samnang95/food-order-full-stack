import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:food_order_app/core/constants/app_images.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/locale/locale_store.dart';
import '../../core/theme/theme_store.dart';
import '../../data/order/datasources/order_remote_datasource.dart';
import '../../data/order/repositories/order_repository_impl.dart';
import '../../domain/order/repositories/order_repository.dart';
import '../../routes/app_routes.dart';
import '../main_navigation/main_nav_intent.dart';
import '../main_navigation/main_nav_store.dart';
import '../notifications/notification_store.dart';
import 'profile_intent.dart';
import 'profile_store.dart';
import 'widgets/widgets.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  ProfileStore get controller {
    if (Get.isRegistered<ProfileStore>()) {
      return Get.find<ProfileStore>();
    }
    final remote = Get.isRegistered<OrderRemoteDataSource>()
        ? Get.find<OrderRemoteDataSource>()
        : Get.put<OrderRemoteDataSource>(OrderRemoteDataSourceImpl());
    final repo = Get.isRegistered<OrderRepository>()
        ? Get.find<OrderRepository>()
        : Get.put<OrderRepository>(OrderRepositoryImpl(remoteDataSource: remote));
    return Get.put(ProfileStore(orderRepository: repo));
  }

  String _loc(BuildContext context, String key, String fallback) {
    final str = key.getString(context);
    if (str.isEmpty || str.endsWith('not found') || str == key) {
      return fallback;
    }
    return str;
  }

  @override
  Widget build(BuildContext context) {
    final store = controller;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;

    return Scaffold(
      appBar: AppBar(
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        title: Row(
          children: [
            Image.asset(AppImages.bitecraftLogo, height: 36),
            const SizedBox(width: 4),
            Text(
              _loc(context, 'profileTitle', 'My Profile'),
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ],
        ),
        titleSpacing: 12,
      ),
      body: SafeArea(
        child: Obx(() {
          final state = store.state.value;

          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => store.onIntent(const LoadProfileIntent()),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
              children: [
                // 1. User Header Card
                ProfileHeaderCard(
                  state: state,
                  onEditPressed: () => EditProfileDialog.show(context, store),
                  onAvatarSelected: (filePath) {
                    store.onIntent(UpdateAvatarIntent(filePath));
                  },
                ),
                const SizedBox(height: 16),

                // 2. Quick Stats Card (Orders, Points, Favorites)
                ProfileStatsCard(
                  state: state,
                  isDark: isDark,
                  cardBg: cardBg,
                ),
                const SizedBox(height: 20),

                // 3. Settings & Preferences Section
                Text(
                  _loc(context, 'preferences', 'Preferences'),
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white60 : AppColors.subtitleColor,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 8),

                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: borderColor),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Material(
                    color: Colors.transparent,
                    child: Column(
                      children: [
                        // Dark Mode Switch
                        ListTile(
                          onTap: () {
                            Get.find<ThemeStore>().toggleTheme(context);
                          },
                          leading: Obx(() {
                            final isDarkVal = Get.find<ThemeStore>().isDarkMode(context);
                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeInOut,
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: isDarkVal
                                    ? AppColors.primary.withValues(alpha: 0.15)
                                    : Colors.amber.withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                              ),
                              child: AnimatedSwitcher(
                                duration: const Duration(milliseconds: 300),
                                transitionBuilder: (child, anim) => RotationTransition(
                                  turns: anim,
                                  child: FadeTransition(opacity: anim, child: child),
                                ),
                                child: Icon(
                                  isDarkVal ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                                  key: ValueKey(isDarkVal),
                                  color: isDarkVal ? AppColors.primary : Colors.amber.shade700,
                                  size: 20,
                                ),
                              ),
                            );
                          }),
                          title: Text(
                            _loc(context, 'darkMode', 'Dark Mode'),
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                          ),
                          trailing: Obx(() {
                            final themeStore = Get.find<ThemeStore>();
                            final isDarkVal = themeStore.isDarkMode(context);
                            return Switch.adaptive(
                              value: isDarkVal,
                              activeThumbColor: AppColors.primary,
                              activeTrackColor: AppColors.primary.withValues(alpha: 0.5),
                              onChanged: (_) {
                                themeStore.toggleTheme(context);
                              },
                            );
                          }),
                        ),
                        Divider(height: 1, color: borderColor),

                      // Language Switcher
                      ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF3B82F6).withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.language_rounded, color: Color(0xFF3B82F6), size: 20),
                        ),
                        title: Text(
                          _loc(context, 'language', 'Language'),
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
                                ? '🇰🇭 ខ្មែរ (KM)'
                                : '🇺🇸 English (EN)',
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
                      Divider(height: 1, color: borderColor),

                      // Saved Addresses
                      ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.location_on_rounded, color: Color(0xFF10B981), size: 20),
                        ),
                        title: Text(
                          _loc(context, 'savedAddresses', 'Saved Addresses'),
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (state.savedAddresses.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                margin: const EdgeInsets.only(right: 6),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE5E7EB),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${state.savedAddresses.length}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? Colors.white70 : AppColors.subtitleColor,
                                  ),
                                ),
                              ),
                            const Icon(Icons.chevron_right_rounded, size: 20),
                          ],
                        ),
                        onTap: () => SavedAddressesSheet.show(context, store),
                      ),
                      Divider(height: 1, color: borderColor),

                      // My Favorites Shortcut
                      ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEF4444).withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.favorite_rounded, color: Color(0xFFEF4444), size: 20),
                        ),
                        title: Text(
                          _loc(context, 'favorites', 'My Favorites'),
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (state.favoritesCount > 0)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                margin: const EdgeInsets.only(right: 6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${state.favoritesCount}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFFEF4444),
                                  ),
                                ),
                              ),
                            const Icon(Icons.chevron_right_rounded, size: 20),
                          ],
                        ),
                        onTap: () => Get.toNamed(AppRoutes.favorites),
                      ),
                      Divider(height: 1, color: borderColor),

                      // Notification Center Shortcut
                      ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.notifications_active_rounded, color: Color(0xFFF59E0B), size: 20),
                        ),
                        title: Text(
                          _loc(context, 'notificationsTitle', 'Notifications'),
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (Get.isRegistered<NotificationStore>())
                              Obx(() {
                                final unread = Get.find<NotificationStore>().unreadCount;
                                if (unread == 0) return const SizedBox.shrink();
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  margin: const EdgeInsets.only(right: 6),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    '$unread',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                );
                              }),
                            const Icon(Icons.chevron_right_rounded, size: 20),
                          ],
                        ),
                        onTap: () => Get.toNamed(AppRoutes.notifications),
                      ),
                      Divider(height: 1, color: borderColor),

                      // Order History Shortcut
                      ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF8B5CF6).withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.history_rounded, color: Color(0xFF8B5CF6), size: 20),
                        ),
                        title: Text(
                          _loc(context, 'orderHistory', 'Order History'),
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                        onTap: () {
                          if (Get.isRegistered<MainNavStore>()) {
                            Get.find<MainNavStore>().onIntent(const ChangeTabIntent(2));
                          }
                        },
                      ),
                      Divider(height: 1, color: borderColor),

                      // Help & Support
                      ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEC4899).withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.headset_mic_rounded, color: Color(0xFFEC4899), size: 20),
                        ),
                        title: Text(
                          _loc(context, 'helpCenter', 'Help & Support'),
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                        onTap: () => _showHelpSupport(context, isDark),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

                // 4. Sign Out Button
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: ElevatedButton.icon(
                    onPressed: () => _confirmSignOut(context, store),
                    icon: const Icon(Icons.logout_rounded, size: 18),
                    label: Text(
                      _loc(context, 'signOut', 'Sign Out'),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      foregroundColor: const Color(0xFFEF4444),
                      elevation: 0,
                      shadowColor: Colors.transparent,
                      padding: const EdgeInsets.symmetric(vertical: 15),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // App Version info
                Center(
                  child: Text(
                    'BiteCraft Express v1.0.0 (Dev)',
                    style: TextStyle(
                      fontSize: 11.5,
                      color: isDark ? Colors.white38 : AppColors.subtitleColor.withValues(alpha: 0.6),
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  void _showHelpSupport(BuildContext context, bool isDark) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) {
        final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
        return Container(
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? Colors.white24 : Colors.black12,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.support_agent_rounded, size: 40, color: AppColors.primary),
              ),
              const SizedBox(height: 16),
              const Text(
                'BiteCraft Support',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Need help with an order or have questions?\nReach out to our customer happiness team.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? Colors.white60 : AppColors.subtitleColor,
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: const Icon(Icons.email_outlined, color: AppColors.primary),
                title: const Text('support@bitecraft.com', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                subtitle: const Text('Response within 24 hours', style: TextStyle(fontSize: 12)),
              ),
              ListTile(
                leading: const Icon(Icons.phone_outlined, color: Color(0xFF10B981)),
                title: const Text('+855 23 888 999', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                subtitle: const Text('Mon - Sun: 7:00 AM - 10:00 PM', style: TextStyle(fontSize: 12)),
              ),
              const SizedBox(height: 12),
            ],
          ),
        );
      },
    );
  }

  void _confirmSignOut(BuildContext context, ProfileStore store) {
    Get.defaultDialog(
      title: 'Sign Out',
      middleText: 'Are you sure you want to sign out of BiteCraft?',
      textConfirm: 'Sign Out',
      textCancel: 'Cancel',
      confirmTextColor: Colors.white,
      buttonColor: const Color(0xFFEF4444),
      cancelTextColor: AppColors.subtitleColor,
      onConfirm: () {
        store.onIntent(const SignOutIntent());
      },
    );
  }
}
