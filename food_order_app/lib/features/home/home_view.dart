import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:food_order_app/core/constants/app_images.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/x_search_bar.dart';
import '../../core/theme/theme_store.dart';
import '../../core/db/local_db.dart';
import 'home_store.dart';

class HomeView extends GetView<HomeStore> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Obx(() {
          final state = controller.state.value;
          if (state.isLoading) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            );
          }
          return CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    AppBar(
                      title: Row(
                        children: [
                          Image.asset(AppImages.bitecraftLogo, height: 36),
                          const SizedBox(width: 4),
                          Text(
                            "foodFeed".getString(context),
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                        ],
                      ),
                      // centerTitle: false,
                      titleSpacing: 12, // Controls distance from screen edge
                      actions: [
                        Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: GestureDetector(
                            onTap: () async {
                              final localization = FlutterLocalization.instance;
                              String newLang = 'en';
                              if (localization.currentLocale?.languageCode == 'en') {
                                newLang = 'km';
                              }
                              localization.translate(newLang);
                              await LocalDB.setString('app_language', newLang);
                            },
                            child: const Icon(Icons.language),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(right: 12),
                          child: GestureDetector(
                            onTap: () {
                              Get.find<ThemeStore>().toggleTheme(context);
                            },
                            child: const Icon(Icons.brightness_6),
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                      child: XSearchBar(
                        onFilterTap: () {
                          // Filter tapped
                        },
                      ),
                    ),
                  ],
                ),
              ),
              // You can add more Slivers here later!
            ],
          );
        }),
      ),
    );
  }
}
