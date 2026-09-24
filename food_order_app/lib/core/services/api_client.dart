import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart' hide Response;
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import '../db/local_db.dart';
import '../../routes/app_routes.dart';

class ApiClient {
  static const String _tokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const Duration _timeout = Duration(seconds: 30);

  /// Guard to prevent multiple simultaneous refresh calls
  static Completer<bool>? _refreshCompleter;

  /// --- Token Management ---

  /// Get the current access token
  static String? getToken() {
    final token = LocalDB.getString(_tokenKey);
    return token;
  }

  /// Get the current refresh token
  static String? getRefreshToken() {
    return LocalDB.getString(_refreshTokenKey);
  }

  /// Save tokens to local storage
  static Future<void> saveTokens({required String token, String? refreshToken}) async {
    debugPrint('💾 [ApiClient] Saving tokens (access: ${token.length > 15 ? token.substring(0, 15) : token}..., refresh: ${refreshToken != null ? "✓" : "null"})');
    await LocalDB.setString(_tokenKey, token);
    if (refreshToken != null) {
      await LocalDB.setString(_refreshTokenKey, refreshToken);
    }
  }

  /// Clear tokens on logout
  static Future<void> clearTokens() async {
    debugPrint('🗑️ [ApiClient] Clearing tokens');
    await LocalDB.remove(_tokenKey);
    await LocalDB.remove(_refreshTokenKey);
  }

  /// Check if user is authenticated
  static bool get isAuthenticated {
    final token = getToken();
    return token != null && token.trim().isNotEmpty;
  }

  /// Attempt to refresh the token using the refresh token.
  /// Prevents multiple simultaneous refresh calls via Completer guard.
  static Future<bool> refreshAccessToken() async {
    // If a refresh is already in progress, wait for it
    if (_refreshCompleter != null) {
      debugPrint('⏳ [ApiClient] Refresh already in progress, awaiting existing request...');
      return _refreshCompleter!.future;
    }

    _refreshCompleter = Completer<bool>();

    try {
      final refreshStr = getRefreshToken();
      if (refreshStr == null) {
        debugPrint('⚠️ [ApiClient] No refresh token found in storage');
        _refreshCompleter!.complete(false);
        return false;
      }

      final url = Uri.parse('${ApiConstants.baseUrl}/auth/refresh');
      debugPrint('🔄 [ApiClient] Refreshing access token via $url');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refreshStr}),
      ).timeout(_timeout);

      debugPrint('🔄 [ApiClient] Refresh response: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final newToken = data['token'] ?? data['accessToken'];
        final newRefresh = data['refreshToken'] ?? refreshStr;

        if (newToken != null) {
          await saveTokens(token: newToken, refreshToken: newRefresh);
          debugPrint('✅ [ApiClient] Token refreshed & saved successfully');
          _refreshCompleter!.complete(true);
          return true;
        }
      }

      // Refresh failed
      debugPrint('❌ [ApiClient] Refresh rejected by server: ${response.body}');
      await clearTokens();
      _refreshCompleter!.complete(false);
      return false;
    } catch (e) {
      debugPrint('❌ [ApiClient] Token refresh exception: $e');
      await clearTokens();
      _refreshCompleter!.complete(false);
      return false;
    } finally {
      _refreshCompleter = null;
    }
  }

  /// Handle session expiry — navigate to login
  static void _handleSessionExpiry() {
    debugPrint('🔒 [ApiClient] Session expired. Redirecting to Login');
    clearTokens();
    if (Get.key.currentContext != null) {
      Get.offAllNamed(AppRoutes.login);
    }
  }

  /// --- Helper for Requests ---

  static Map<String, String> _getHeaders({bool includeAuth = true}) {
    final token = getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (includeAuth && token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// Wraps requests to handle 401 Unauthorized by attempting a token refresh.
  /// If refresh fails, redirects to login screen.
  /// Auth endpoints (/auth/*) are exempt from refresh and session expiry redirect.
  static Future<http.Response> _requestWithRetry(
    String method,
    String endpoint,
    Future<http.Response> Function() request,
  ) async {
    final isAuthEndpoint = endpoint.startsWith('/auth/');
    debugPrint('🚀 [ApiClient] $method $endpoint (hasToken: ${!isAuthEndpoint && getToken() != null})');
    var response = await request();
    debugPrint('📥 [ApiClient] $method $endpoint → Status ${response.statusCode}');

    if (response.statusCode == 401 && !isAuthEndpoint) {
      debugPrint('⚠️ [ApiClient] 401 Unauthorized on $endpoint! Attempting auto-refresh...');
      final isRefreshed = await refreshAccessToken();
      if (isRefreshed) {
        debugPrint('🔁 [ApiClient] Retrying $method $endpoint with refreshed token...');
        response = await request();
        debugPrint('📥 [ApiClient] Retry $method $endpoint → Status ${response.statusCode}');

        if (response.statusCode == 401) {
          debugPrint('❌ [ApiClient] Still 401 after refresh.');
          _handleSessionExpiry();
        }
      } else {
        _handleSessionExpiry();
      }
    }

    return response;
  }

  /// --- CRUD Operations ---

  /// GET request
  static Future<http.Response> get(String endpoint) async {
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    final isAuth = endpoint.startsWith('/auth/');
    return _requestWithRetry(
      'GET',
      endpoint,
      () => http.get(url, headers: _getHeaders(includeAuth: !isAuth)).timeout(_timeout),
    );
  }

  /// POST request
  static Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    final isAuth = endpoint.startsWith('/auth/');
    return _requestWithRetry(
      'POST',
      endpoint,
      () => http.post(
        url,
        headers: _getHeaders(includeAuth: !isAuth),
        body: jsonEncode(body),
      ).timeout(_timeout),
    );
  }

  /// PUT request
  static Future<http.Response> update(String endpoint, Map<String, dynamic> body) async {
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    return _requestWithRetry(
      'PUT',
      endpoint,
      () => http.put(url, headers: _getHeaders(), body: jsonEncode(body)).timeout(_timeout),
    );
  }

  /// DELETE request
  static Future<http.Response> delete(String endpoint) async {
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    return _requestWithRetry(
      'DELETE',
      endpoint,
      () => http.delete(url, headers: _getHeaders()).timeout(_timeout),
    );
  }

  /// Multipart file upload request
  static Future<http.Response> uploadFile(
    String endpoint,
    String filePath, {
    String fieldName = 'image',
  }) async {
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    final token = getToken();
    debugPrint('🚀 [ApiClient] POST (Multipart) $endpoint (file: $filePath)');

    final request = http.MultipartRequest('POST', url);
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    request.files.add(await http.MultipartFile.fromPath(fieldName, filePath));

    final streamedResponse = await request.send().timeout(_timeout);
    final response = await http.Response.fromStream(streamedResponse);
    debugPrint('📥 [ApiClient] Multipart $endpoint → Status ${response.statusCode}');
    return response;
  }
}
