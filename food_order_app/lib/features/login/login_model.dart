import 'package:equatable/equatable.dart';

class LoginModel extends Equatable {
  final String username;
  final String password;
  final bool isPasswordVisible;
  final bool isLoading;
  final bool rememberMe;
  final bool isSuccess;

  const LoginModel({
    this.username = '',
    this.password = '',
    this.isPasswordVisible = false,
    this.isLoading = false,
    this.rememberMe = true,
    this.isSuccess = false,
  });

  LoginModel copyWith({
    String? username,
    String? password,
    bool? isPasswordVisible,
    bool? isLoading,
    bool? rememberMe,
    bool? isSuccess,
  }) {
    return LoginModel(
      username: username ?? this.username,
      password: password ?? this.password,
      isPasswordVisible: isPasswordVisible ?? this.isPasswordVisible,
      isLoading: isLoading ?? this.isLoading,
      rememberMe: rememberMe ?? this.rememberMe,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }

  @override
  List<Object> get props => [username, password, isPasswordVisible, isLoading, rememberMe, isSuccess];
}
