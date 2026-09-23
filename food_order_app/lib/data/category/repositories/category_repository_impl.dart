import '../../../domain/category/entities/category_entity.dart';
import '../../../domain/category/repositories/category_repository.dart';
import '../datasources/category_remote_datasource.dart';

class CategoryRepositoryImpl implements CategoryRepository {
  final CategoryRemoteDataSource remoteDataSource;

  CategoryRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<CategoryEntity>> getCategories() async {
    final models = await remoteDataSource.getCategories();
    return models.map((m) => m.toEntity()).toList();
  }
}
