import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../orders/orders_intent.dart';
import '../orders/orders_store.dart';
import 'main_nav_intent.dart';
import 'main_nav_model.dart';

class MainNavStore extends GetxController {
  final Rx<MainNavModel> state = const MainNavModel().obs;

  int get currentIndex => state.value.currentIndex;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is int && args >= 0 && args <= 3) {
      state.value = state.value.copyWith(currentIndex: args);
      if (args == 2 && Get.isRegistered<OrdersStore>()) {
        Get.find<OrdersStore>().onIntent(const FetchOrdersIntent());
      }
    }
  }

  void onIntent(MainNavIntent intent) {
    switch (intent) {
      case ChangeTabIntent(:final index):
        _onChangeTab(index);
    }
  }

  void _onChangeTab(int index) {
    if (index < 0 || index > 3 || index == state.value.currentIndex) return;
    HapticFeedback.selectionClick();
    state.value = state.value.copyWith(currentIndex: index);

    // Refresh orders automatically whenever the user navigates to the Orders tab
    if (index == 2 && Get.isRegistered<OrdersStore>()) {
      Get.find<OrdersStore>().onIntent(const FetchOrdersIntent());
    }
  }
}
