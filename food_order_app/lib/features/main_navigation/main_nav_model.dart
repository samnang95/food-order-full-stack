import 'package:flutter/foundation.dart';

@immutable
class MainNavModel {
  final int currentIndex;

  const MainNavModel({
    this.currentIndex = 0,
  });

  MainNavModel copyWith({
    int? currentIndex,
  }) {
    return MainNavModel(
      currentIndex: currentIndex ?? this.currentIndex,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MainNavModel &&
          runtimeType == other.runtimeType &&
          currentIndex == other.currentIndex;

  @override
  int get hashCode => currentIndex.hashCode;
}
