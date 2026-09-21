import 'dart:convert';
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
import 'package:food_order_app/domain/auth/signup/entities/signup_user_entity.dart';
import 'package:food_order_app/domain/auth/signup/repositories/signup_repository.dart';
import 'package:food_order_app/domain/auth/signup/usecases/signup_usecase.dart';
import 'package:food_order_app/features/auth/signup/signup_intent.dart';
import 'package:food_order_app/features/auth/signup/signup_store.dart';
import 'package:food_order_app/features/auth/signup/signup_view.dart';

class MockSignUpRepository implements SignUpRepository {
  final bool shouldFail;
  final String? failureMessage;

  MockSignUpRepository({this.shouldFail = false, this.failureMessage});

  @override
  Future<SignUpUserEntity> signUp({
    required String username,
    required String email,
    required String password,
  }) async {
    if (shouldFail) {
      throw Exception(failureMessage ?? 'Username already taken');
    }
    return const SignUpUserEntity(
      id: 'user_new_123',
      username: 'newfoodie',
      email: 'newfoodie@example.com',
      token: 'mock_signup_token',
      refreshToken: 'mock_refresh_token',
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

class MockGoogleAuthRepository implements GoogleAuthRepository {
  final bool shouldFail;
  final String? failureMessage;

  MockGoogleAuthRepository({this.shouldFail = false, this.failureMessage});

  @override
  Future<GoogleUserEntity> loginWithGoogle(String idToken) async {
    if (shouldFail) {
      throw Exception(failureMessage ?? 'Google registration failed');
    }
    return const GoogleUserEntity(
      id: 'google_user_123',
      username: 'googleuser',
      email: 'google@example.com',
      token: 'mock_google_token',
      refreshToken: 'mock_refresh_token',
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
      throw Exception(failureMessage ?? 'Apple registration failed');
    }
    return const AppleUserEntity(
      id: 'apple_user_123',
      username: 'appleuser',
      email: 'apple@example.com',
      token: 'mock_apple_token',
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
    Get.delete<SignUpStore>(force: true);
  });

  group('SignUpStore Unit Tests', () {
    test('Initial state is correct', () {
      final repo = MockSignUpRepository();
      final useCase = SignUpUseCase(repository: repo);
      final store = SignUpStore(signUpUseCase: useCase);

      expect(store.state.value.username, '');
      expect(store.state.value.email, '');
      expect(store.state.value.password, '');
      expect(store.state.value.confirmPassword, '');
      expect(store.state.value.isPasswordVisible, false);
      expect(store.state.value.isConfirmPasswordVisible, false);
      expect(store.state.value.agreeToTerms, true);
      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, false);
      expect(store.state.value.errorMessage, null);
    });

    test('Validates empty username on submit', () async {
      final repo = MockSignUpRepository();
      final useCase = SignUpUseCase(repository: repo);
      final store = SignUpStore(signUpUseCase: useCase);

      store.onIntent(const SignUpSubmit());
      expect(store.state.value.errorMessage, 'Please enter a username');
    });

    test('Validates username length < 3', () async {
      final repo = MockSignUpRepository();
      final useCase = SignUpUseCase(repository: repo);
      final store = SignUpStore(signUpUseCase: useCase);

      store.onIntent(const SignUpUsernameChanged('ab'));
      store.onIntent(const SignUpSubmit());
      expect(store.state.value.errorMessage, 'Username must be at least 3 characters');
    });

    test('Validates empty email on submit', () async {
      final repo = MockSignUpRepository();
      final useCase = SignUpUseCase(repository: repo);
      final store = SignUpStore(signUpUseCase: useCase);

      store.onIntent(const SignUpUsernameChanged('alice'));
      store.onIntent(const SignUpSubmit());
      expect(store.state.value.errorMessage, 'Please enter an email address');
    });

    test('Validates invalid email format', () async {
      final repo = MockSignUpRepository();
      final useCase = SignUpUseCase(repository: repo);
      final store = SignUpStore(signUpUseCase: useCase);

      store.onIntent(const SignUpUsernameChanged('alice'));
      store.onIntent(const SignUpEmailChanged('not-an-email'));
      store.onIntent(const SignUpSubmit());
      expect(store.state.value.errorMessage, 'Please enter a valid email address');
    });

    test('Validates password length < 6', () async {
      final repo = MockSignUpRepository();
      final useCase = SignUpUseCase(repository: repo);
      final store = SignUpStore(signUpUseCase: useCase);

      store.onIntent(const SignUpUsernameChanged('alice'));
      store.onIntent(const SignUpEmailChanged('alice@example.com'));
      store.onIntent(const SignUpPasswordChanged('123'));
      store.onIntent(const SignUpSubmit());
      expect(store.state.value.errorMessage, 'Password must be at least 6 characters');
    });

    test('Validates mismatched password and confirmPassword', () async {
      final repo = MockSignUpRepository();
      final useCase = SignUpUseCase(repository: repo);
      final store = SignUpStore(signUpUseCase: useCase);

      store.onIntent(const SignUpUsernameChanged('alice'));
      store.onIntent(const SignUpEmailChanged('alice@example.com'));
      store.onIntent(const SignUpPasswordChanged('password123'));
      store.onIntent(const SignUpConfirmPasswordChanged('password999'));
      store.onIntent(const SignUpSubmit());
      expect(store.state.value.errorMessage, 'Passwords do not match');
    });

    test('Validates terms agreement unchecked', () async {
      final repo = MockSignUpRepository();
      final useCase = SignUpUseCase(repository: repo);
      final store = SignUpStore(signUpUseCase: useCase);

      store.onIntent(const SignUpUsernameChanged('alice'));
      store.onIntent(const SignUpEmailChanged('alice@example.com'));
      store.onIntent(const SignUpPasswordChanged('password123'));
      store.onIntent(const SignUpConfirmPasswordChanged('password123'));
      store.onIntent(const SignUpToggleAgreeToTerms(false));
      store.onIntent(const SignUpSubmit());
      expect(store.state.value.errorMessage, 'Please accept the Terms & Privacy Policy to continue');
    });

    test('Successfully signs up with valid inputs', () async {
      final repo = MockSignUpRepository();
      final useCase = SignUpUseCase(repository: repo);
      final store = SignUpStore(signUpUseCase: useCase);

      store.onIntent(const SignUpUsernameChanged('alice'));
      store.onIntent(const SignUpEmailChanged('alice@example.com'));
      store.onIntent(const SignUpPasswordChanged('password123'));
      store.onIntent(const SignUpConfirmPasswordChanged('password123'));
      store.onIntent(const SignUpSubmit());

      await Future.delayed(const Duration(milliseconds: 50));
      expect(store.state.value.isSuccess, true);
      expect(store.state.value.isLoading, false);
      expect(store.state.value.errorMessage, null);
    });

    test('Handles registration failure with error message', () async {
      final repo = MockSignUpRepository(
        shouldFail: true,
        failureMessage: 'Email already registered',
      );
      final useCase = SignUpUseCase(repository: repo);
      final store = SignUpStore(signUpUseCase: useCase);

      store.onIntent(const SignUpUsernameChanged('alice'));
      store.onIntent(const SignUpEmailChanged('alice@example.com'));
      store.onIntent(const SignUpPasswordChanged('password123'));
      store.onIntent(const SignUpConfirmPasswordChanged('password123'));
      store.onIntent(const SignUpSubmit());

      await Future.delayed(const Duration(milliseconds: 50));
      expect(store.state.value.isSuccess, false);
      expect(store.state.value.isLoading, false);
      expect(store.state.value.errorMessage, 'Email already registered');
    });

    test('Handles cancelled Google sign-up without error', () async {
      final repo = MockSignUpRepository();
      final googleRepo = MockGoogleAuthRepository();
      final store = SignUpStore(
        signUpUseCase: SignUpUseCase(repository: repo),
        loginWithGoogleUseCase: LoginWithGoogleUseCase(repository: googleRepo),
        googleAuthService: MockGoogleAuthService(mockToken: null),
      );

      store.onIntent(const SignUpGoogleSubmit());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, false);
      expect(store.state.value.errorMessage, null);
    });

    test('Handles successful Google sign-up submission', () async {
      final repo = MockSignUpRepository();
      final googleRepo = MockGoogleAuthRepository();
      final store = SignUpStore(
        signUpUseCase: SignUpUseCase(repository: repo),
        loginWithGoogleUseCase: LoginWithGoogleUseCase(repository: googleRepo),
        googleAuthService: MockGoogleAuthService(mockToken: 'mock_valid_token'),
      );

      store.onIntent(const SignUpGoogleSubmit());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, true);
      expect(store.state.value.errorMessage, null);
    });

    test('Handles failed Google sign-up with error message', () async {
      final repo = MockSignUpRepository();
      final googleRepo = MockGoogleAuthRepository(
        shouldFail: true,
        failureMessage: 'Google account registration failed',
      );
      final store = SignUpStore(
        signUpUseCase: SignUpUseCase(repository: repo),
        loginWithGoogleUseCase: LoginWithGoogleUseCase(repository: googleRepo),
        googleAuthService: MockGoogleAuthService(mockToken: 'mock_token'),
      );

      store.onIntent(const SignUpGoogleSubmit());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, false);
      expect(store.state.value.errorMessage, 'Google account registration failed');
    });

    test('Handles cancelled Apple sign-up without error', () async {
      final repo = MockSignUpRepository();
      final appleRepo = MockAppleAuthRepository();
      final store = SignUpStore(
        signUpUseCase: SignUpUseCase(repository: repo),
        loginWithAppleUseCase: LoginWithAppleUseCase(repository: appleRepo),
        appleAuthService: MockAppleAuthService(mockResult: null),
      );

      store.onIntent(const SignUpAppleSubmit());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, false);
      expect(store.state.value.errorMessage, null);
    });

    test('Handles successful Apple sign-up submission', () async {
      final repo = MockSignUpRepository();
      final appleRepo = MockAppleAuthRepository();
      final store = SignUpStore(
        signUpUseCase: SignUpUseCase(repository: repo),
        loginWithAppleUseCase: LoginWithAppleUseCase(repository: appleRepo),
        appleAuthService: MockAppleAuthService(),
      );

      store.onIntent(const SignUpAppleSubmit());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, true);
      expect(store.state.value.errorMessage, null);
    });

    test('Handles failed Apple sign-up with error message', () async {
      final repo = MockSignUpRepository();
      final appleRepo = MockAppleAuthRepository(
        shouldFail: true,
        failureMessage: 'Apple account registration failed',
      );
      final store = SignUpStore(
        signUpUseCase: SignUpUseCase(repository: repo),
        loginWithAppleUseCase: LoginWithAppleUseCase(repository: appleRepo),
        appleAuthService: MockAppleAuthService(),
      );

      store.onIntent(const SignUpAppleSubmit());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(store.state.value.isLoading, false);
      expect(store.state.value.isSuccess, false);
      expect(store.state.value.errorMessage, 'Apple account registration failed');
    });
  });

  group('SignUpView Widget Rendering', () {
    testWidgets('Renders all SignUp components properly', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      final repo = MockSignUpRepository();
      final useCase = SignUpUseCase(repository: repo);
      Get.put(SignUpStore(signUpUseCase: useCase));

      await tester.pumpWidget(
        GetMaterialApp(
          supportedLocales: FlutterLocalization.instance.supportedLocales,
          localizationsDelegates: FlutterLocalization.instance.localizationsDelegates,
          home: const SignUpView(),
        ),
      );
      await tester.pumpAndSettle();

      // Check key texts & elements
      expect(find.text('Create Account'), findsWidgets);
      expect(find.text('Username'), findsOneWidget);
      expect(find.text('Email Address'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
      expect(find.text('Confirm Password'), findsOneWidget);
      expect(find.text('Google'), findsOneWidget);
      expect(find.text('Apple'), findsOneWidget);
    });

    testWidgets('Taps Google button and triggers SignUpGoogleSubmit', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      final repo = MockSignUpRepository();
      final googleRepo = MockGoogleAuthRepository();
      final store = SignUpStore(
        signUpUseCase: SignUpUseCase(repository: repo),
        loginWithGoogleUseCase: LoginWithGoogleUseCase(repository: googleRepo),
        googleAuthService: MockGoogleAuthService(mockToken: 'mock_google_id_123'),
      );
      Get.put(store);

      await tester.pumpWidget(
        GetMaterialApp(
          supportedLocales: FlutterLocalization.instance.supportedLocales,
          localizationsDelegates: FlutterLocalization.instance.localizationsDelegates,
          home: const SignUpView(),
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

    testWidgets('Taps Apple button and triggers SignUpAppleSubmit', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      final repo = MockSignUpRepository();
      final appleRepo = MockAppleAuthRepository();
      final store = SignUpStore(
        signUpUseCase: SignUpUseCase(repository: repo),
        loginWithAppleUseCase: LoginWithAppleUseCase(repository: appleRepo),
        appleAuthService: MockAppleAuthService(),
      );
      Get.put(store);

      await tester.pumpWidget(
        GetMaterialApp(
          supportedLocales: FlutterLocalization.instance.supportedLocales,
          localizationsDelegates: FlutterLocalization.instance.localizationsDelegates,
          home: const SignUpView(),
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
