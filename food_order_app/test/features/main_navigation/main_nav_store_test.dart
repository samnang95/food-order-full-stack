import 'package:flutter_test/flutter_test.dart';
import 'package:food_order_app/features/main_navigation/main_nav_intent.dart';
import 'package:food_order_app/features/main_navigation/main_nav_store.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('MainNavStore Unit Tests', () {
    late MainNavStore store;

    setUp(() {
      store = MainNavStore();
    });

    test('Initial tab index is 0 (Explore)', () {
      expect(store.currentIndex, 0);
      expect(store.state.value.currentIndex, 0);
    });

    test('Switches tab index upon ChangeTabIntent', () {
      store.onIntent(const ChangeTabIntent(1));
      expect(store.currentIndex, 1);

      store.onIntent(const ChangeTabIntent(2));
      expect(store.currentIndex, 2);

      store.onIntent(const ChangeTabIntent(3));
      expect(store.currentIndex, 3);

      store.onIntent(const ChangeTabIntent(0));
      expect(store.currentIndex, 0);
    });

    test('Ignores invalid tab indexes outside [0, 3]', () {
      store.onIntent(const ChangeTabIntent(4));
      expect(store.currentIndex, 0);

      store.onIntent(const ChangeTabIntent(-1));
      expect(store.currentIndex, 0);
    });

    test('Ignores switching to current tab index', () {
      store.onIntent(const ChangeTabIntent(0));
      expect(store.currentIndex, 0);
    });
  });
}
