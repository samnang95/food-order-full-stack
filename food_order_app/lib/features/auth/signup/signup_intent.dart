sealed class SignUpIntent {
  const SignUpIntent();
}

class SignUpUsernameChanged extends SignUpIntent {
  final String username;
  const SignUpUsernameChanged(this.username);
}

class SignUpEmailChanged extends SignUpIntent {
  final String email;
  const SignUpEmailChanged(this.email);
}

class SignUpPasswordChanged extends SignUpIntent {
  final String password;
  const SignUpPasswordChanged(this.password);
}

class SignUpConfirmPasswordChanged extends SignUpIntent {
  final String confirmPassword;
  const SignUpConfirmPasswordChanged(this.confirmPassword);
}

class SignUpTogglePasswordVisibility extends SignUpIntent {
  const SignUpTogglePasswordVisibility();
}

class SignUpToggleConfirmPasswordVisibility extends SignUpIntent {
  const SignUpToggleConfirmPasswordVisibility();
}

class SignUpToggleAgreeToTerms extends SignUpIntent {
  final bool agree;
  const SignUpToggleAgreeToTerms(this.agree);
}

class SignUpClearError extends SignUpIntent {
  const SignUpClearError();
}

class SignUpSubmit extends SignUpIntent {
  const SignUpSubmit();
}

class SignUpGoogleSubmit extends SignUpIntent {
  const SignUpGoogleSubmit();
}

class SignUpAppleSubmit extends SignUpIntent {
  const SignUpAppleSubmit();
}

