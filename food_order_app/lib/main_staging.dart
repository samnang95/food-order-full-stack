import 'core/config/app_environment.dart';
import 'bootstrap.dart';

void main() async {
  await runFoodOrderApp(
    envFile: ".env.staging",
    environment: AppEnvironment.staging,
  );
}
