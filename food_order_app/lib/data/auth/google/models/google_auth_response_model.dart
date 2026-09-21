import '../../../../domain/auth/google/entities/google_user_entity.dart';

class GoogleAuthResponseModel {
  final String id;
  final String username;
  final String email;
  final String token;
  final String? refreshToken;
  final String? role;

  const GoogleAuthResponseModel({
    required this.id,
    required this.username,
    required this.email,
    required this.token,
    this.refreshToken,
    this.role,
  });

  factory GoogleAuthResponseModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? {};
    return GoogleAuthResponseModel(
      id: (user['id'] ?? json['id'] ?? '').toString(),
      username: user['username'] ?? json['username'] ?? '',
      email: user['email'] ?? json['email'] ?? '',
      token: json['token'] ?? json['accessToken'] ?? '',
      refreshToken: json['refreshToken'],
      role: user['role'] ?? json['role'],
    );
  }

  GoogleUserEntity toEntity() {
    return GoogleUserEntity(
      id: id,
      username: username,
      email: email,
      token: token,
      refreshToken: refreshToken,
    );
  }
}
