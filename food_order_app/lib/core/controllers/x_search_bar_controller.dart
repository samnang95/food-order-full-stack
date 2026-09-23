import 'package:flutter/material.dart';
import 'package:get/get.dart';

class XSearchBarController extends GetxController {
  late final TextEditingController textController;
  final RxBool hasText = false.obs;
  final bool isInternalController;

  XSearchBarController({TextEditingController? externalController})
      : isInternalController = externalController == null {
    textController = externalController ?? TextEditingController();
    hasText.value = textController.text.isNotEmpty;
    textController.addListener(_onTextChanged);
  }

  void _onTextChanged() {
    final isNotEmpty = textController.text.isNotEmpty;
    if (hasText.value != isNotEmpty) {
      hasText.value = isNotEmpty;
    }
  }

  void clear() {
    textController.clear();
    hasText.value = false;
  }

  @override
  void onClose() {
    textController.removeListener(_onTextChanged);
    if (isInternalController) {
      textController.dispose();
    }
    super.onClose();
  }
}
