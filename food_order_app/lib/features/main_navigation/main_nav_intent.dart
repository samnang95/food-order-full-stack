sealed class MainNavIntent {
  const MainNavIntent();
}

class ChangeTabIntent extends MainNavIntent {
  final int index;
  const ChangeTabIntent(this.index);
}
