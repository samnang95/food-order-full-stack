import '../../domain/category/entities/category_entity.dart';

sealed class CategoryDetailIntent {
  const CategoryDetailIntent();
}

class CategoryDetailInitialize extends CategoryDetailIntent {
  final CategoryEntity category;
  const CategoryDetailInitialize(this.category);
}

class CategoryDetailSortChanged extends CategoryDetailIntent {
  final String sort; // 'all', 'price_asc', 'price_desc'
  const CategoryDetailSortChanged(this.sort);
}

class CategoryDetailScrollChanged extends CategoryDetailIntent {
  final bool isScrolled;
  const CategoryDetailScrollChanged(this.isScrolled);
}

class CategoryDetailRefreshFoods extends CategoryDetailIntent {
  const CategoryDetailRefreshFoods();
}
