import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../../core/services/api_client.dart';
import '../models/food_response_model.dart';

abstract class FoodRemoteDataSource {
  Future<List<FoodResponseModel>> getFoods({String? category, String? search});
}

class FoodRemoteDataSourceImpl implements FoodRemoteDataSource {
  @override
  Future<List<FoodResponseModel>> getFoods({String? category, String? search}) async {
    // Build query params
    final params = <String, String>{};
    if (category != null && category.isNotEmpty) {
      params['category'] = category;
    }
    if (search != null && search.isNotEmpty) {
      params['search'] = search;
    }

    final queryString = params.isNotEmpty
        ? '?${params.entries.map((e) => '${e.key}=${Uri.encodeComponent(e.value)}').join('&')}'
        : '';

    debugPrint('🌐 [FoodDataSource] GET /foods$queryString');
    final response = await ApiClient.get('/foods$queryString');
    debugPrint('🌐 [FoodDataSource] Response: ${response.statusCode}');

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data
          .map((json) => FoodResponseModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception('Failed to load foods: ${response.statusCode} - ${response.body}');
    }
  }
}
