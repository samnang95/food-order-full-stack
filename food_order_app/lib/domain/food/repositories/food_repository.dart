import '../entities/food_entity.dart';

abstract class FoodRepository {
  Future<List<FoodEntity>> getFoods({String? category, String? search});
}
