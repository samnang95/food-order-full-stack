sealed class LoginIntent {
  const LoginIntent();
}

class LoginUsernameChanged extends LoginIntent {
  final String username;
  const LoginUsernameChanged(this.username);
}

class LoginPasswordChanged extends LoginIntent {
  final String password;
  const LoginPasswordChanged(this.password);
}

class LoginTogglePasswordVisibility extends LoginIntent {
  const LoginTogglePasswordVisibility();
}

class LoginToggleRememberMe extends LoginIntent {
  final bool rememberMe;
  const LoginToggleRememberMe(this.rememberMe);
}

class LoginClearError extends LoginIntent {
  const LoginClearError();
}

class LoginSubmit extends LoginIntent {
  const LoginSubmit();
}

class LoginGoogleSubmit extends LoginIntent {
  const LoginGoogleSubmit();
}

class LoginAppleSubmit extends LoginIntent {
  const LoginAppleSubmit();
}

