sealed class HomeIntent {
  const HomeIntent();
}

class HomeLoadData extends HomeIntent {
  const HomeLoadData();
}

class HomeRefreshData extends HomeIntent {
  const HomeRefreshData();
}

class HomeCategorySelected extends HomeIntent {
  final String categoryId;
  const HomeCategorySelected(this.categoryId);
}

class HomeSearchChanged extends HomeIntent {
  final String query;
  const HomeSearchChanged(this.query);
}
