sealed class HomeIntent {
  const HomeIntent();
}

class HomeLoadData extends HomeIntent {
  const HomeLoadData();
}

class HomeCategorySelected extends HomeIntent {
  final String category;
  const HomeCategorySelected(this.category);
}
