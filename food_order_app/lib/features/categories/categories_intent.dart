sealed class CategoriesIntent {
  const CategoriesIntent();
}

class CategoriesLoadData extends CategoriesIntent {
  const CategoriesLoadData();
}

class CategoriesRefreshData extends CategoriesIntent {
  const CategoriesRefreshData();
}

class CategoriesSearchChanged extends CategoriesIntent {
  final String query;
  const CategoriesSearchChanged(this.query);
}

class CategoriesClearSearch extends CategoriesIntent {
  const CategoriesClearSearch();
}

class CategoriesTagSelected extends CategoriesIntent {
  final String tag; // 'all', 'trending', 'quick', 'budget', 'top_rated'
  const CategoriesTagSelected(this.tag);
}

class CategoriesScrollChanged extends CategoriesIntent {
  final bool isScrolled;
  const CategoriesScrollChanged(this.isScrolled);
}
