import '../entities/food_entity.dart';
import '../repositories/food_repository.dart';

class GetFoodsUseCase {
  final FoodRepository repository;

  GetFoodsUseCase({required this.repository});

  Future<List<FoodEntity>> execute({String? category, String? search}) async {
    return await repository.getFoods(category: category, search: search);
  }
}
