class LoginModel {
  final String username;
  final String password;
  final bool isPasswordVisible;
  final bool isLoading;
  final bool rememberMe;
  final bool isSuccess;
  final String? errorMessage;

  const LoginModel({
    this.username = '',
    this.password = '',
    this.isPasswordVisible = false,
    this.isLoading = false,
    this.rememberMe = true,
    this.isSuccess = false,
    this.errorMessage,
  });

  LoginModel copyWith({
    String? username,
    String? password,
    bool? isPasswordVisible,
    bool? isLoading,
    bool? rememberMe,
    bool? isSuccess,
    String? errorMessage,
  }) {
    return LoginModel(
      username: username ?? this.username,
      password: password ?? this.password,
      isPasswordVisible: isPasswordVisible ?? this.isPasswordVisible,
      isLoading: isLoading ?? this.isLoading,
      rememberMe: rememberMe ?? this.rememberMe,
      isSuccess: isSuccess ?? this.isSuccess,
      errorMessage: errorMessage,
    );
  }
}
