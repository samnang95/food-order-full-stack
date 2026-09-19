import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../../../core/services/api_client.dart';
import '../models/login_request_model.dart';
import '../models/login_response_model.dart';

abstract class LoginRemoteDataSource {
  Future<LoginResponseModel> login(LoginRequestModel request);
}

class LoginRemoteDataSourceImpl implements LoginRemoteDataSource {
  @override
  Future<LoginResponseModel> login(LoginRequestModel request) async {
    debugPrint('🌐 [LoginDataSource] POST /auth/login → ${request.toJson()}');
    final response = await ApiClient.post('/auth/login', request.toJson());
    debugPrint('🌐 [LoginDataSource] Response: ${response.statusCode} → ${response.body}');

    if (response.statusCode == 200 || response.statusCode == 201) {
      final Map<String, dynamic> data = jsonDecode(response.body);
      final responseModel = LoginResponseModel.fromJson(data);
      
      if (responseModel.token.isNotEmpty) {
        await ApiClient.saveTokens(
          token: responseModel.token,
          refreshToken: responseModel.refreshToken,
        );
        debugPrint('🔑 [LoginDataSource] Token saved ✓');
      }
      return responseModel;
    } else {
      throw Exception('Login failed: ${response.statusCode} - ${response.body}');
    }
  }
}
