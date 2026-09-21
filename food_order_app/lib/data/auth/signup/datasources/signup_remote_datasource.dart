import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../../../core/db/local_db.dart';
import '../../../../core/services/api_client.dart';
import '../models/signup_request_model.dart';
import '../models/signup_response_model.dart';

abstract class SignUpRemoteDataSource {
  Future<SignUpResponseModel> signUp(SignUpRequestModel request);
}

class SignUpRemoteDataSourceImpl implements SignUpRemoteDataSource {
  @override
  Future<SignUpResponseModel> signUp(SignUpRequestModel request) async {
    debugPrint('🌐 [SignUpDataSource] POST /auth/register → username: ${request.username}, email: ${request.email}');
    final response = await ApiClient.post('/auth/register', request.toJson());
    debugPrint('🌐 [SignUpDataSource] Response: ${response.statusCode} → ${response.body}');

    if (response.statusCode == 200 || response.statusCode == 201) {
      final Map<String, dynamic> data = jsonDecode(response.body);
      final responseModel = SignUpResponseModel.fromJson(data);

      if (responseModel.token.isNotEmpty) {
        await ApiClient.saveTokens(
          token: responseModel.token,
          refreshToken: responseModel.refreshToken,
        );
        if (responseModel.username.isNotEmpty) {
          await LocalDB.setString('user_username', responseModel.username);
        }
        await LocalDB.setString('user_role', responseModel.role ?? 'user');
        debugPrint('🔑 [SignUpDataSource] Token & role saved ✓');
      }
      return responseModel;
    } else {
      throw Exception('Registration failed: ${response.statusCode} - ${response.body}');
    }
  }
}
