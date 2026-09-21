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
import 'package:food_order_app/core/services/apple_auth_service.dart';
import 'package:food_order_app/core/services/google_auth_service.dart';
import 'package:food_order_app/domain/auth/apple/entities/apple_user_entity.dart';
import 'package:food_order_app/domain/auth/apple/repositories/apple_auth_repository.dart';
import 'package:food_order_app/domain/auth/apple/usecases/login_with_apple_usecase.dart';
import 'package:food_order_app/domain/auth/google/entities/google_user_entity.dart';
import 'package:food_order_app/domain/auth/google/repositories/google_auth_repository.dart';
import 'package:food_order_app/domain/auth/google/usecases/login_with_google_usecase.dart';
import 'package:food_order_app/domain/auth/login/entities/login_user_entity.dart';
import 'package:food_order_app/domain/auth/login/repositories/login_repository.dart';
import 'package:food_order_app/domain/auth/login/usecases/login_usecase.dart';
import 'package:food_order_app/features/auth/login/login_intent.dart';
import 'package:food_order_app/features/auth/login/login_store.dart';
import 'package:food_order_app/features/auth/login/login_view.dart';

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

class MockGoogleAuthRepository implements GoogleAuthRepository {
  final bool shouldFail;
  final String? failureMessage;

  MockGoogleAuthRepository({this.shouldFail = false, this.failureMessage});

  @override
  Future<GoogleUserEntity> loginWithGoogle(String idToken) async {
    if (shouldFail) {
      throw Exception(failureMessage ?? 'Invalid Google credentials');
    }
    return const GoogleUserEntity(
      id: 'mock_google_123',
      username: 'googleuser',
      email: 'google@example.com',
      token: 'mock_google_token',
      refreshToken: 'mock_google_refresh_token',
    );
  }
}

class MockAppleAuthRepository implements AppleAuthRepository {
  final bool shouldFail;
  final String? failureMessage;

  MockAppleAuthRepository({this.shouldFail = false, this.failureMessage});

  @override
  Future<AppleUserEntity> loginWithApple({
    required String identityToken,
    String? email,
    String? name,
  }) async {
    if (shouldFail) {
      throw Exception(failureMessage ?? 'Invalid Apple credentials');
    }
    return const AppleUserEntity(
      id: 'mock_apple_123',
      username: 'appleuser',
      email: 'apple@example.com',
      token: 'mock_apple_token',
      refreshToken: 'mock_apple_refresh_token',
    );
  }
}

class MockGoogleAuthService implements GoogleAuthService {
  final String? mockToken;
  final bool shouldThrow;
  final String? errorMessage;

  MockGoogleAuthService({
    this.mockToken = 'valid_mock_google_id_token',
    this.shouldThrow = false,
    this.errorMessage,
  });

  @override
  Future<String?> signIn() async {
    if (shouldThrow) {
      throw Exception(errorMessage ?? 'Google Sign-In failed');
    }
    return mockToken;
  }

  @override
  Future<void> signOut() async {}

  @override
  Future<bool> isSignedIn() async => mockToken != null;
}

class MockAppleAuthService implements AppleAuthService {
  final AppleAuthResult? mockResult;
  final bool shouldThrow;
  final String? errorMessage;
  final bool available;

  MockAppleAuthService({
    this.mockResult = const AppleAuthResult(
      identityToken: 'valid_mock_apple_token',
      email: 'apple@example.com',
      name: 'Apple User',
    ),
    this.shouldThrow = false,
    this.errorMessage,
    this.available = true,
  });

  @override
  Future<AppleAuthResult?> signIn() async {
    if (shouldThrow) {
      throw Exception(errorMessage ?? 'Apple Sign-In failed');
    }
    return mockResult;
  }

  @override
  Future<bool> isAvailable() async => available;
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

    test('Handles cancelled Google sign-in without error', () async {
      final repo = MockLoginRepository();
      final googleRepo = MockGoogleAuthRepository();
      final store = LoginStore(
        loginUseCase: LoginUseCase(repository: repo),
        loginWithGoogleUseCase: LoginWithGoogleUseCase(repository: googleRepo),
        googleAuthService: MockGoogleAuthService(mockToken: null),
      );

      store.onIntent(const LoginGoogleSubmit());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, false);
      expect(store.state.value.errorMessage, null);
    });

    test('Handles successful Google sign-in submission', () async {
      final repo = MockLoginRepository();
      final googleRepo = MockGoogleAuthRepository();
      final store = LoginStore(
        loginUseCase: LoginUseCase(repository: repo),
        loginWithGoogleUseCase: LoginWithGoogleUseCase(repository: googleRepo),
        googleAuthService: MockGoogleAuthService(mockToken: 'mock_valid_token'),
      );

      store.onIntent(const LoginGoogleSubmit());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, true);
      expect(store.state.value.errorMessage, null);
    });

    test('Handles failed Google sign-in with error message', () async {
      final repo = MockLoginRepository();
      final googleRepo = MockGoogleAuthRepository(
        shouldFail: true,
        failureMessage: 'Google token expired or invalid',
      );
      final store = LoginStore(
        loginUseCase: LoginUseCase(repository: repo),
        loginWithGoogleUseCase: LoginWithGoogleUseCase(repository: googleRepo),
        googleAuthService: MockGoogleAuthService(mockToken: 'mock_expired_token'),
      );

      store.onIntent(const LoginGoogleSubmit());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, false);
      expect(store.state.value.errorMessage, 'Google token expired or invalid');
    });

    test('Handles cancelled Apple sign-in without error', () async {
      final repo = MockLoginRepository();
      final appleRepo = MockAppleAuthRepository();
      final store = LoginStore(
        loginUseCase: LoginUseCase(repository: repo),
        loginWithAppleUseCase: LoginWithAppleUseCase(repository: appleRepo),
        appleAuthService: MockAppleAuthService(mockResult: null),
      );

      store.onIntent(const LoginAppleSubmit());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, false);
      expect(store.state.value.errorMessage, null);
    });

    test('Handles successful Apple sign-in submission', () async {
      final repo = MockLoginRepository();
      final appleRepo = MockAppleAuthRepository();
      final store = LoginStore(
        loginUseCase: LoginUseCase(repository: repo),
        loginWithAppleUseCase: LoginWithAppleUseCase(repository: appleRepo),
        appleAuthService: MockAppleAuthService(),
      );

      store.onIntent(const LoginAppleSubmit());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, true);
      expect(store.state.value.errorMessage, null);
    });

    test('Handles failed Apple sign-in with error message', () async {
      final repo = MockLoginRepository();
      final appleRepo = MockAppleAuthRepository(
        shouldFail: true,
        failureMessage: 'Apple token expired or invalid',
      );
      final store = LoginStore(
        loginUseCase: LoginUseCase(repository: repo),
        loginWithAppleUseCase: LoginWithAppleUseCase(repository: appleRepo),
        appleAuthService: MockAppleAuthService(),
      );

      store.onIntent(const LoginAppleSubmit());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, false);
      expect(store.state.value.errorMessage, 'Apple token expired or invalid');
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

    testWidgets('Taps Google Sign-In button and triggers LoginGoogleSubmit', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      final repo = MockLoginRepository();
      final googleRepo = MockGoogleAuthRepository();
      final store = LoginStore(
        loginUseCase: LoginUseCase(repository: repo),
        loginWithGoogleUseCase: LoginWithGoogleUseCase(repository: googleRepo),
        googleAuthService: MockGoogleAuthService(mockToken: 'mock_token_123'),
      );
      Get.put(store);

      await tester.pumpWidget(
        GetMaterialApp(
          home: const LoginView(),
          supportedLocales: FlutterLocalization.instance.supportedLocales,
          localizationsDelegates: FlutterLocalization.instance.localizationsDelegates,
        ),
      );
      await tester.pumpAndSettle();

      final googleBtn = find.text('Google');
      expect(googleBtn, findsOneWidget);
      await tester.ensureVisible(googleBtn);
      await tester.tap(googleBtn);
      await tester.pumpAndSettle();

      expect(store.state.value.isSuccess, true);
    });

    testWidgets('Taps Apple Sign-In button and triggers LoginAppleSubmit', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      final repo = MockLoginRepository();
      final appleRepo = MockAppleAuthRepository();
      final store = LoginStore(
        loginUseCase: LoginUseCase(repository: repo),
        loginWithAppleUseCase: LoginWithAppleUseCase(repository: appleRepo),
        appleAuthService: MockAppleAuthService(),
      );
      Get.put(store);

      await tester.pumpWidget(
        GetMaterialApp(
          home: const LoginView(),
          supportedLocales: FlutterLocalization.instance.supportedLocales,
          localizationsDelegates: FlutterLocalization.instance.localizationsDelegates,
        ),
      );
      await tester.pumpAndSettle();

      final appleBtn = find.text('Apple');
      expect(appleBtn, findsOneWidget);
      await tester.ensureVisible(appleBtn);
      await tester.tap(appleBtn);
      await tester.pumpAndSettle();

      expect(store.state.value.isSuccess, true);
    });
  });
}
