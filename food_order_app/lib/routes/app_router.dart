import 'package:get/get.dart';

import '../core/services/api_client.dart';
import '../features/auth/login/login_binding.dart';
import '../features/auth/login/login_view.dart';
import '../features/main_navigation/main_nav_binding.dart';
import '../features/main_navigation/main_nav_view.dart';
import '../features/auth/signup/signup_binding.dart';
import '../features/auth/signup/signup_view.dart';
import '../features/food_detail/food_detail_binding.dart';
import '../features/food_detail/food_detail_view.dart';
import 'app_routes.dart';

class AppRouter {
  static final List<GetPage> pages = [
    GetPage(
      name: AppRoutes.login,
      page: () => const LoginView(),
      binding: LoginBinding(),
    ),
    GetPage(
      name: AppRoutes.signUp,
      page: () => const SignUpView(),
      binding: SignUpBinding(),
    ),
    GetPage(
      name: AppRoutes.home,
      page: () => const MainNavView(),
      binding: MainNavBinding(),
    ),
    GetPage(
      name: AppRoutes.foodDetail,
      page: () => const FoodDetailView(),
      binding: FoodDetailBinding(),
      transition: Transition.fadeIn,
    ),
  ];

  static String get initialRoute => ApiClient.isAuthenticated ? AppRoutes.home : AppRoutes.login;
}