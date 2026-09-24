sealed class ProfileIntent {
  const ProfileIntent();
}

final class LoadProfileIntent extends ProfileIntent {
  const LoadProfileIntent();
}

final class UpdateProfileIntent extends ProfileIntent {
  final String username;
  final String email;

  const UpdateProfileIntent({
    required this.username,
    required this.email,
  });
}

final class AddSavedAddressIntent extends ProfileIntent {
  final String address;

  const AddSavedAddressIntent(this.address);
}

final class DeleteSavedAddressIntent extends ProfileIntent {
  final int index;

  const DeleteSavedAddressIntent(this.index);
}

final class UpdateAvatarIntent extends ProfileIntent {
  final String imagePath;

  const UpdateAvatarIntent(this.imagePath);
}

final class SignOutIntent extends ProfileIntent {
  const SignOutIntent();
}
