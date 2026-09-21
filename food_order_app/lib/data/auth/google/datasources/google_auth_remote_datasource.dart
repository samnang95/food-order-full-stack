import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../../../core/db/local_db.dart';
import '../../../../core/services/api_client.dart';
import '../models/google_auth_response_model.dart';

abstract class GoogleAuthRemoteDataSource {
  Future<GoogleAuthResponseModel> loginWithGoogle(String idToken);
}

class GoogleAuthRemoteDataSourceImpl implements GoogleAuthRemoteDataSource {
  @override
  Future<GoogleAuthResponseModel> loginWithGoogle(String idToken) async {
    debugPrint('🌐 [GoogleAuthDataSource] POST /auth/google');
    final response = await ApiClient.post('/auth/google', {'token': idToken});
    debugPrint('🌐 [GoogleAuthDataSource] Response: ${response.statusCode} → ${response.body}');

    if (response.statusCode == 200 || response.statusCode == 201) {
      final Map<String, dynamic> data = jsonDecode(response.body);
      final responseModel = GoogleAuthResponseModel.fromJson(data);

      if (responseModel.token.isNotEmpty) {
        await ApiClient.saveTokens(
          token: responseModel.token,
          refreshToken: responseModel.refreshToken,
        );
        if (responseModel.username.isNotEmpty) {
          await LocalDB.setString('user_username', responseModel.username);
        }
        await LocalDB.setString('user_role', responseModel.role ?? 'user');
        debugPrint('🔑 [GoogleAuthDataSource] Google login tokens saved ✓');
      }
      return responseModel;
    } else {
      throw Exception('Google login failed: ${response.statusCode} - ${response.body}');
    }
  }
}
