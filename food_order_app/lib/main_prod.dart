import 'core/config/app_environment.dart';
import 'bootstrap.dart';

void main() async {
  await runFoodOrderApp(
    envFile: ".env.prod",
    environment: AppEnvironment.prod,
  );
}
