import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/locale/locale_store.dart';
import 'package:food_order_app/core/locale/translation_helper.dart';
import 'package:food_order_app/core/theme/theme_store.dart';
import 'package:food_order_app/domain/auth/login/entities/login_user_entity.dart';
import 'package:food_order_app/domain/auth/login/repositories/login_repository.dart';
import 'package:food_order_app/domain/auth/login/usecases/login_usecase.dart';
import 'package:food_order_app/features/auth/login/login_intent.dart';
import 'package:food_order_app/features/auth/login/login_store.dart';
import 'package:food_order_app/features/auth/login/login_view.dart';
import 'package:food_order_app/features/main_navigation/main_nav_view.dart';
import 'package:food_order_app/routes/app_router.dart';
import 'package:food_order_app/routes/app_routes.dart';

class MockLoginRepository implements LoginRepository {
  @override
  Future<LoginUserEntity> login({
    required String username,
    required String password,
  }) async {
    return const LoginUserEntity(
      id: '123',
      username: 'samnang123',
      email: 'rinsamnang50@gmail.com',
      token: 'valid_token',
      refreshToken: 'valid_refresh_token',
    );
  }
}

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    final String enJson = await rootBundle.loadString('assets/translate/en.json');
    final String kmJson = await rootBundle.loadString('assets/translate/km.json');
    final Map<String, dynamic> enMap = TranslationHelper.flatten(json.decode(enJson));
    final Map<String, dynamic> kmMap = TranslationHelper.flatten(json.decode(kmJson));

    await FlutterLocalization.instance.ensureInitialized();
    FlutterLocalization.instance.init(
      mapLocales: [
        MapLocale('en', enMap),
        MapLocale('km', kmMap),
      ],
      initLanguageCode: 'en',
    );

    Get.put(ThemeStore(), permanent: true);
    Get.put(LocaleStore(), permanent: true);
  });

  tearDown(() {
    Get.reset();
    Get.put(ThemeStore(), permanent: true);
    Get.put(LocaleStore(), permanent: true);
  });

  testWidgets('Login success navigates to Home (MainNavView)', (tester) async {
    final repo = MockLoginRepository();
    final useCase = LoginUseCase(repository: repo);
    Get.put(LoginStore(loginUseCase: useCase));

    await tester.pumpWidget(
      GetMaterialApp(
        initialRoute: AppRoutes.login,
        getPages: AppRouter.pages,
        supportedLocales: FlutterLocalization.instance.supportedLocales,
        localizationsDelegates: FlutterLocalization.instance.localizationsDelegates,
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(LoginView), findsOneWidget);

    final store = Get.find<LoginStore>();
    store.onIntent(const LoginUsernameChanged('samnang123'));
    store.onIntent(const LoginPasswordChanged('Rupp@12345'));
    store.onIntent(const LoginSubmit());

    await tester.pumpAndSettle();

    expect(find.byType(MainNavView), findsOneWidget);
    expect(find.byType(LoginView), findsNothing);
  });

  testWidgets('Tapping Sign In button with valid credentials navigates to MainNavView', (tester) async {
    final repo = MockLoginRepository();
    final useCase = LoginUseCase(repository: repo);
    Get.put(LoginStore(loginUseCase: useCase));

    await tester.pumpWidget(
      GetMaterialApp(
        initialRoute: AppRoutes.login,
        getPages: AppRouter.pages,
        supportedLocales: FlutterLocalization.instance.supportedLocales,
        localizationsDelegates: FlutterLocalization.instance.localizationsDelegates,
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(LoginView), findsOneWidget);

    // Enter username & password into TextFormFields
    final textFields = find.byType(TextFormField);
    await tester.enterText(textFields.at(0), 'samnang123');
    await tester.enterText(textFields.at(1), 'Rupp@12345');
    await tester.pumpAndSettle();

    // Tap Sign In button
    final signInButton = find.text('Sign In');
    await tester.ensureVisible(signInButton);
    await tester.tap(signInButton);
    await tester.pumpAndSettle();

    // Verify MainNavView is now showing and LoginView is dismissed
    expect(find.byType(MainNavView), findsOneWidget);
    expect(find.byType(LoginView), findsNothing);
  });
}
