import 'package:equatable/equatable.dart';

sealed class LoginIntent extends Equatable {
  const LoginIntent();

  @override
  List<Object> get props => [];
}

class LoginUsernameChanged extends LoginIntent {
  final String username;
  const LoginUsernameChanged(this.username);

  @override
  List<Object> get props => [username];
}

class LoginPasswordChanged extends LoginIntent {
  final String password;
  const LoginPasswordChanged(this.password);

  @override
  List<Object> get props => [password];
}

class LoginTogglePasswordVisibility extends LoginIntent {
  const LoginTogglePasswordVisibility();
}

class LoginSubmit extends LoginIntent {
  const LoginSubmit();
}
