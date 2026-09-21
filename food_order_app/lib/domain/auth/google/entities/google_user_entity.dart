class GoogleUserEntity {
  final String id;
  final String username;
  final String email;
  final String token;
  final String? refreshToken;

  const GoogleUserEntity({
    required this.id,
    required this.username,
    required this.email,
    required this.token,
    this.refreshToken,
  });
}
