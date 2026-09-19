import 'package:get/get.dart';

import '../features/login/login_binding.dart';
import '../features/login/login_view.dart';
import '../features/home/home_binding.dart';
import '../features/home/home_view.dart';
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
      page: () => const HomeView(),
      binding: HomeBinding(),
    ),
  ];

  static const String initialRoute = AppRoutes.login;
}