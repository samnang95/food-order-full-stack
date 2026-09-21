import 'package:get/get.dart';

import '../features/login/login_binding.dart';
import '../features/login/login_view.dart';
import '../features/main_navigation/main_nav_binding.dart';
import '../features/main_navigation/main_nav_view.dart';
import 'app_routes.dart';

class AppRouter {
  static final List<GetPage> pages = [
    GetPage(
      name: AppRoutes.login,
      page: () => const LoginView(),
      binding: LoginBinding(),
    ),
    GetPage(
      name: AppRoutes.home,
      page: () => const MainNavView(),
      binding: MainNavBinding(),
    ),
  ];

  static const String initialRoute = AppRoutes.login;
}