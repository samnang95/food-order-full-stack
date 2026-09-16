import 'package:flutter_bloc/flutter_bloc.dart';
import 'login_intent.dart';
import 'login_model.dart';

class LoginStore extends Bloc<LoginIntent, LoginModel> {
  LoginStore() : super(const LoginModel()) {
    on<LoginUsernameChanged>(_onUsernameChanged);
    on<LoginPasswordChanged>(_onPasswordChanged);
    on<LoginTogglePasswordVisibility>(_onTogglePasswordVisibility);
    on<LoginSubmit>(_onSubmit);
  }

  void _onUsernameChanged(LoginUsernameChanged intent, Emitter<LoginModel> emit) {
    emit(state.copyWith(username: intent.username));
  }

  void _onPasswordChanged(LoginPasswordChanged intent, Emitter<LoginModel> emit) {
    emit(state.copyWith(password: intent.password));
  }

  void _onTogglePasswordVisibility(LoginTogglePasswordVisibility intent, Emitter<LoginModel> emit) {
    emit(state.copyWith(isPasswordVisible: !state.isPasswordVisible));
  }

  Future<void> _onSubmit(LoginSubmit intent, Emitter<LoginModel> emit) async {
    emit(state.copyWith(isLoading: true));
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));
    emit(state.copyWith(isLoading: false, isSuccess: true));
  }
}
