class ProfileState {
  final bool isLoading;
  final bool isUpdating;
  final bool isUploadingAvatar;
  final String username;
  final String email;
  final String role;
  final String avatar;
  final int ordersCount;
  final int favoritesCount;
  final int points;
  final List<String> savedAddresses;
  final String? errorMessage;
  final String? successMessage;

  const ProfileState({
    this.isLoading = false,
    this.isUpdating = false,
    this.isUploadingAvatar = false,
    this.username = 'Food Lover',
    this.email = '',
    this.role = 'user',
    this.avatar = '',
    this.ordersCount = 0,
    this.favoritesCount = 0,
    this.points = 0,
    this.savedAddresses = const [],
    this.errorMessage,
    this.successMessage,
  });

  ProfileState copyWith({
    bool? isLoading,
    bool? isUpdating,
    bool? isUploadingAvatar,
    String? username,
    String? email,
    String? role,
    String? avatar,
    int? ordersCount,
    int? favoritesCount,
    int? points,
    List<String>? savedAddresses,
    String? errorMessage,
    String? successMessage,
  }) {
    return ProfileState(
      isLoading: isLoading ?? this.isLoading,
      isUpdating: isUpdating ?? this.isUpdating,
      isUploadingAvatar: isUploadingAvatar ?? this.isUploadingAvatar,
      username: username ?? this.username,
      email: email ?? this.email,
      role: role ?? this.role,
      avatar: avatar ?? this.avatar,
      ordersCount: ordersCount ?? this.ordersCount,
      favoritesCount: favoritesCount ?? this.favoritesCount,
      points: points ?? this.points,
      savedAddresses: savedAddresses ?? this.savedAddresses,
      errorMessage: errorMessage,
      successMessage: successMessage,
    );
  }
}
