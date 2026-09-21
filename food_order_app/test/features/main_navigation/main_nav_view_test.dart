import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/theme/theme_store.dart';
import 'package:food_order_app/features/home/home_store.dart';
import 'package:food_order_app/features/main_navigation/main_nav_store.dart';
import 'package:food_order_app/features/main_navigation/main_nav_view.dart';
import 'package:food_order_app/features/main_navigation/widgets/custom_bottom_nav_bar.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();
  });

  setUp(() {
    Get.reset();
    Get.put(ThemeStore());
    Get.put(HomeStore());
    Get.put(MainNavStore());
  });

  tearDown(() {
    Get.reset();
  });

  testWidgets('MainNavView renders bottom navigation bar and switches tabs on tap', (tester) async {
    await tester.pumpWidget(
      const GetMaterialApp(
        home: MainNavView(),
      ),
    );
    // Allow initial home async load to complete
    await tester.pump(const Duration(milliseconds: 600));
    await tester.pump(const Duration(milliseconds: 200));

    // Verify CustomBottomNavBar is present
    expect(find.byType(CustomBottomNavBar), findsOneWidget);

    // Verify all 4 nav items are present by keys
    expect(find.byKey(const Key('nav_item_0')), findsOneWidget);
    expect(find.byKey(const Key('nav_item_1')), findsOneWidget);
    expect(find.byKey(const Key('nav_item_2')), findsOneWidget);
    expect(find.byKey(const Key('nav_item_3')), findsOneWidget);

    // Verify initial active tab is 0
    final navStore = Get.find<MainNavStore>();
    expect(navStore.currentIndex, 0);

    // Tap on Categories tab (index 1)
    await tester.tap(find.byKey(const Key('nav_item_1')));
    await tester.pump(const Duration(milliseconds: 250));
    expect(navStore.currentIndex, 1);

    // Tap on Orders tab (index 2)
    await tester.tap(find.byKey(const Key('nav_item_2')));
    await tester.pump(const Duration(milliseconds: 250));
    expect(navStore.currentIndex, 2);

    // Tap on Profile tab (index 3)
    await tester.tap(find.byKey(const Key('nav_item_3')));
    await tester.pump(const Duration(milliseconds: 250));
    expect(navStore.currentIndex, 3);

    // Tap back to Explore tab (index 0)
    await tester.tap(find.byKey(const Key('nav_item_0')));
    await tester.pump(const Duration(milliseconds: 250));
    expect(navStore.currentIndex, 0);
  });
}
