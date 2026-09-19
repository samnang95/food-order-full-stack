import '../../../../domain/auth/login/entities/login_user_entity.dart';

class LoginResponseModel {
  final String id;
  final String username;
  final String email;
  final String token;
  final String? refreshToken;
  final String? role;

  const LoginResponseModel({
    required this.id,
    required this.username,
    required this.email,
    required this.token,
    this.refreshToken,
    this.role,
  });

  /// Parses the API response:
  /// { "message": "...", "token": "...", "user": { "id": "...", "username": "...", "role": "..." } }
  factory LoginResponseModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? {};
    return LoginResponseModel(
      id: (user['id'] ?? json['id'] ?? '').toString(),
      username: user['username'] ?? json['username'] ?? '',
      email: user['email'] ?? json['email'] ?? '',
      token: json['token'] ?? json['accessToken'] ?? '',
      refreshToken: json['refreshToken'],
      role: user['role'] ?? json['role'],
    );
  }

  LoginUserEntity toEntity() {
    return LoginUserEntity(
      id: id,
      username: username,
      email: email,
      token: token,
      refreshToken: refreshToken,
    );
  }
}
