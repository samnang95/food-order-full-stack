import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'main_nav_intent.dart';
import 'main_nav_model.dart';

class MainNavStore extends GetxController {
  final Rx<MainNavModel> state = const MainNavModel().obs;

  int get currentIndex => state.value.currentIndex;

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
  }
}
