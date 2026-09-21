class SignUpModel {
  final String username;
  final String email;
  final String password;
  final String confirmPassword;
  final bool isPasswordVisible;
  final bool isConfirmPasswordVisible;
  final bool agreeToTerms;
  final bool isLoading;
  final bool isSuccess;
  final String? errorMessage;

  const SignUpModel({
    this.username = '',
    this.email = '',
    this.password = '',
    this.confirmPassword = '',
    this.isPasswordVisible = false,
    this.isConfirmPasswordVisible = false,
    this.agreeToTerms = true,
    this.isLoading = false,
    this.isSuccess = false,
    this.errorMessage,
  });

  SignUpModel copyWith({
    String? username,
    String? email,
    String? password,
    String? confirmPassword,
    bool? isPasswordVisible,
    bool? isConfirmPasswordVisible,
    bool? agreeToTerms,
    bool? isLoading,
    bool? isSuccess,
    String? errorMessage,
  }) {
    return SignUpModel(
      username: username ?? this.username,
      email: email ?? this.email,
      password: password ?? this.password,
      confirmPassword: confirmPassword ?? this.confirmPassword,
      isPasswordVisible: isPasswordVisible ?? this.isPasswordVisible,
      isConfirmPasswordVisible: isConfirmPasswordVisible ?? this.isConfirmPasswordVisible,
      agreeToTerms: agreeToTerms ?? this.agreeToTerms,
      isLoading: isLoading ?? this.isLoading,
      isSuccess: isSuccess ?? this.isSuccess,
      errorMessage: errorMessage,
    );
  }
}
