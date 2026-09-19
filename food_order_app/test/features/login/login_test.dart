import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/locale/locale_store.dart';
import 'package:food_order_app/core/theme/theme_store.dart';
import 'package:food_order_app/domain/auth/login/entities/login_user_entity.dart';
import 'package:food_order_app/domain/auth/login/repositories/login_repository.dart';
import 'package:food_order_app/domain/auth/login/usecases/login_usecase.dart';
import 'package:food_order_app/features/login/login_intent.dart';
import 'package:food_order_app/features/login/login_store.dart';
import 'package:food_order_app/features/login/login_view.dart';

class MockLoginRepository implements LoginRepository {
  final bool shouldFail;
  final String? failureMessage;

  MockLoginRepository({this.shouldFail = false, this.failureMessage});

  @override
  Future<LoginUserEntity> login({
    required String username,
    required String password,
  }) async {
    if (shouldFail) {
      throw Exception(failureMessage ?? 'Invalid credentials');
    }
    return const LoginUserEntity(
      id: 'mock_123',
      username: 'testuser',
      email: 'test@example.com',
      token: 'mock_token',
      refreshToken: 'mock_refresh_token',
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

    Get.put(ThemeStore(), permanent: true);
    Get.put(LocaleStore(), permanent: true);
  });

  setUp(() async {
    await LocalDB.clear();
  });

  tearDown(() {
    Get.delete<LoginStore>(force: true);
  });

  group('LoginStore Unit Tests', () {
    test('Initial state is correct', () {
      final repo = MockLoginRepository();
      final useCase = LoginUseCase(repository: repo);
      final store = LoginStore(loginUseCase: useCase);

      expect(store.state.value.username, '');
      expect(store.state.value.password, '');
      expect(store.state.value.isLoading, false);
      expect(store.state.value.isPasswordVisible, false);
      expect(store.state.value.errorMessage, null);
    });

    test('Validates empty username on submit', () async {
      final repo = MockLoginRepository();
      final useCase = LoginUseCase(repository: repo);
      final store = LoginStore(loginUseCase: useCase);

      store.onIntent(const LoginSubmit());
      expect(store.state.value.errorMessage, 'Please enter your username or email');
    });

    test('Validates empty password on submit', () async {
      final repo = MockLoginRepository();
      final useCase = LoginUseCase(repository: repo);
      final store = LoginStore(loginUseCase: useCase);

      store.onIntent(const LoginUsernameChanged('testuser'));
      store.onIntent(const LoginSubmit());
      expect(store.state.value.errorMessage, 'Please enter your password');
    });

    test('Toggles password visibility and remember me', () {
      final repo = MockLoginRepository();
      final useCase = LoginUseCase(repository: repo);
      final store = LoginStore(loginUseCase: useCase);

      expect(store.state.value.isPasswordVisible, false);
      store.onIntent(const LoginTogglePasswordVisibility());
      expect(store.state.value.isPasswordVisible, true);

      expect(store.state.value.rememberMe, true);
      store.onIntent(const LoginToggleRememberMe(false));
      expect(store.state.value.rememberMe, false);
      store.onIntent(const LoginToggleRememberMe(true));
      expect(store.state.value.rememberMe, true);
    });

    test('Handles successful login submission', () async {
      final repo = MockLoginRepository();
      final useCase = LoginUseCase(repository: repo);
      final store = LoginStore(loginUseCase: useCase);

      store.onIntent(const LoginUsernameChanged('testuser'));
      store.onIntent(const LoginPasswordChanged('test1234'));
      store.onIntent(const LoginSubmit());

      // Wait for async execution
      await Future.delayed(const Duration(milliseconds: 50));
      expect(store.state.value.isSuccess, true);
      expect(store.state.value.isLoading, false);
      expect(store.state.value.errorMessage, null);
    });

    test('Handles failed login with invalid credentials', () async {
      final repo = MockLoginRepository(shouldFail: true, failureMessage: 'Invalid credentials');
      final useCase = LoginUseCase(repository: repo);
      final store = LoginStore(loginUseCase: useCase);

      store.onIntent(const LoginUsernameChanged('testuser'));
      store.onIntent(const LoginPasswordChanged('wrongpass'));
      store.onIntent(const LoginSubmit());

      await Future.delayed(const Duration(milliseconds: 50));
      expect(store.state.value.isSuccess, false);
      expect(store.state.value.errorMessage, 'Invalid username or password. Please try again.');
    });
  });

  group('LoginView Widget Tests', () {
    testWidgets('Renders all redesigned login elements', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      final repo = MockLoginRepository();
      final useCase = LoginUseCase(repository: repo);
      Get.put(LoginStore(loginUseCase: useCase));

      await tester.pumpWidget(
        GetMaterialApp(
          home: const LoginView(),
          supportedLocales: FlutterLocalization.instance.supportedLocales,
          localizationsDelegates: FlutterLocalization.instance.localizationsDelegates,
        ),
      );
      await tester.pumpAndSettle();

      // Verify Brand Header and Language Switch
      expect(find.text('BiteCraft Express'), findsOneWidget);
      expect(find.text('EN'), findsOneWidget);
      expect(find.text('ខ្មែរ'), findsOneWidget);

      // Verify Welcome Header
      expect(find.text('Welcome Back, Foodie!'), findsOneWidget);

      // Verify Social Logins
      expect(find.text('Google'), findsOneWidget);
      expect(find.text('Apple'), findsOneWidget);

      // Verify Inputs
      expect(find.byType(TextFormField), findsNWidgets(2));

      // Verify Sign In CTA
      expect(find.text('Sign In'), findsOneWidget);
    });

    testWidgets('Triggers client validation error banner when submitted blank', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      final repo = MockLoginRepository();
      final useCase = LoginUseCase(repository: repo);
      Get.put(LoginStore(loginUseCase: useCase));

      await tester.pumpWidget(
        GetMaterialApp(
          home: const LoginView(),
          supportedLocales: FlutterLocalization.instance.supportedLocales,
          localizationsDelegates: FlutterLocalization.instance.localizationsDelegates,
        ),
      );
      await tester.pumpAndSettle();

      // Tap Sign In button with blank fields
      final signInButton = find.text('Sign In');
      await tester.ensureVisible(signInButton);
      await tester.tap(signInButton);
      await tester.pumpAndSettle();

      // Verify error banner is shown
      expect(find.text('Please enter your username or email'), findsOneWidget);
    });
  });
}
