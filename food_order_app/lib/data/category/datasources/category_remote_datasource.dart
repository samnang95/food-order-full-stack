import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../../core/services/api_client.dart';
import '../models/category_response_model.dart';

abstract class CategoryRemoteDataSource {
  Future<List<CategoryResponseModel>> getCategories();
}

class CategoryRemoteDataSourceImpl implements CategoryRemoteDataSource {
  @override
  Future<List<CategoryResponseModel>> getCategories() async {
    debugPrint('🌐 [CategoryDataSource] GET /categories');
    final response = await ApiClient.get('/categories');
    debugPrint('🌐 [CategoryDataSource] Response: ${response.statusCode}');

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data
          .map((json) => CategoryResponseModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception('Failed to load categories: ${response.statusCode} - ${response.body}');
    }
  }
}
