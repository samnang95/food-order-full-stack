import '../../../../domain/auth/apple/entities/apple_user_entity.dart';

class AppleAuthResponseModel {
  final String id;
  final String username;
  final String email;
  final String token;
  final String? refreshToken;
  final String? role;

  const AppleAuthResponseModel({
    required this.id,
    required this.username,
    required this.email,
    required this.token,
    this.refreshToken,
    this.role,
  });

  factory AppleAuthResponseModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? {};
    return AppleAuthResponseModel(
      id: (user['id'] ?? json['id'] ?? '').toString(),
      username: user['username'] ?? json['username'] ?? '',
      email: user['email'] ?? json['email'] ?? '',
      token: json['token'] ?? json['accessToken'] ?? '',
      refreshToken: json['refreshToken'],
      role: user['role'] ?? json['role'],
    );
  }

  AppleUserEntity toEntity() {
    return AppleUserEntity(
      id: id,
      username: username,
      email: email,
      token: token,
      refreshToken: refreshToken,
    );
  }
}
