import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../features/login/login_store.dart';
import '../features/login/login_view.dart';
import '../features/home/home_store.dart';
import '../features/home/home_intent.dart';
import '../features/home/home_view.dart';
import 'app_routes.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    // initialLocation: AppRoutes.login,
    initialLocation: AppRoutes.home,
    routes: [
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) {
          return BlocProvider(
            create: (_) => LoginStore(),
            child: const LoginView(),
          );
        },
      ),
      GoRoute(
        path: AppRoutes.home,
        builder: (context, state) {
          return BlocProvider(
            create: (_) => HomeStore()..add(const HomeLoadData()),
            child: const HomeView(),
          );
        },
      ),
    ],
  );
}