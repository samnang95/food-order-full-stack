import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:food_order_app/core/food_order_app.dart';
import 'package:food_order_app/features/login/login_view.dart';
import 'package:food_order_app/core/db/local_db.dart';

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();
    
    final String enJson = await rootBundle.loadString('assets/translate/en.json');
    final String kmJson = await rootBundle.loadString('assets/translate/km.json');
    
    final Map<String, dynamic> enMap = json.decode(enJson);
    final Map<String, dynamic> kmMap = json.decode(kmJson);

    await FlutterLocalization.instance.ensureInitialized();
    FlutterLocalization.instance.init(
      mapLocales: [
        MapLocale('en', enMap),
        MapLocale('km', kmMap),
      ],
      initLanguageCode: 'en',
    );
  });

  testWidgets('Login route smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const FoodOrderApp());
    await tester.pumpAndSettle();

    expect(find.byType(LoginView), findsOneWidget);
  });
}
