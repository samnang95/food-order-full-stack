import '../../../../domain/auth/signup/entities/signup_user_entity.dart';

class SignUpResponseModel {
  final String id;
  final String username;
  final String email;
  final String token;
  final String? refreshToken;
  final String? role;

  const SignUpResponseModel({
    required this.id,
    required this.username,
    required this.email,
    required this.token,
    this.refreshToken,
    this.role,
  });

  /// Parses the API response:
  /// { "message": "User registered successfully", "token": "...", "refreshToken": "...", "user": { "id": 1, "username": "...", "email": "..." } }
  factory SignUpResponseModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? {};
    return SignUpResponseModel(
      id: (user['id'] ?? json['id'] ?? '').toString(),
      username: user['username'] ?? json['username'] ?? '',
      email: user['email'] ?? json['email'] ?? '',
      token: json['token'] ?? json['accessToken'] ?? '',
      refreshToken: json['refreshToken'],
      role: user['role'] ?? json['role'],
    );
  }

  SignUpUserEntity toEntity() {
    return SignUpUserEntity(
      id: id,
      username: username,
      email: email,
      token: token,
      refreshToken: refreshToken,
    );
  }
}
