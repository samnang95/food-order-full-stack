import '../../../domain/food/entities/food_entity.dart';
import '../../../domain/food/repositories/food_repository.dart';
import '../datasources/food_remote_datasource.dart';

class FoodRepositoryImpl implements FoodRepository {
  final FoodRemoteDataSource remoteDataSource;

  FoodRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<FoodEntity>> getFoods({String? category, String? search}) async {
    final models = await remoteDataSource.getFoods(category: category, search: search);
    return models.map((m) => m.toEntity()).toList();
  }
}
