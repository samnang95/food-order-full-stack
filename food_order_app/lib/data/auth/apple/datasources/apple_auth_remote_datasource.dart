import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../../../core/db/local_db.dart';
import '../../../../core/services/api_client.dart';
import '../models/apple_auth_response_model.dart';

abstract class AppleAuthRemoteDataSource {
  Future<AppleAuthResponseModel> loginWithApple({
    required String identityToken,
    String? email,
    String? name,
  });
}

class AppleAuthRemoteDataSourceImpl implements AppleAuthRemoteDataSource {
  @override
  Future<AppleAuthResponseModel> loginWithApple({
    required String identityToken,
    String? email,
    String? name,
  }) async {
    debugPrint('🌐 [AppleAuthDataSource] POST /auth/apple');
    final body = {
      'token': identityToken,
      if (email != null && email.isNotEmpty) 'email': email,
      if (name != null && name.isNotEmpty) 'name': name,
    };
    final response = await ApiClient.post('/auth/apple', body);
    debugPrint('🌐 [AppleAuthDataSource] Response: ${response.statusCode} → ${response.body}');

    if (response.statusCode == 200 || response.statusCode == 201) {
      final Map<String, dynamic> data = jsonDecode(response.body);
      final responseModel = AppleAuthResponseModel.fromJson(data);

      if (responseModel.token.isNotEmpty) {
        await ApiClient.saveTokens(
          token: responseModel.token,
          refreshToken: responseModel.refreshToken,
        );
        if (responseModel.username.isNotEmpty) {
          await LocalDB.setString('user_username', responseModel.username);
        }
        await LocalDB.setString('user_role', responseModel.role ?? 'user');
        debugPrint('🔑 [AppleAuthDataSource] Apple login tokens saved ✓');
      }
      return responseModel;
    } else {
      throw Exception('Apple login failed: ${response.statusCode} - ${response.body}');
    }
  }
}
