import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/db/local_db.dart';
import '../../core/services/api_client.dart';
import '../../core/services/cart_service.dart';
import '../../core/services/favorites_service.dart';
import '../../domain/order/repositories/order_repository.dart';
import '../../routes/app_routes.dart';
import 'profile_intent.dart';
import 'profile_state.dart';

class ProfileStore extends GetxController {
  final OrderRepository orderRepository;

  ProfileStore({required this.orderRepository});

  static const String keySavedAddresses = 'saved_addresses_list';
  static const String keyUserAddress = 'user_delivery_address';
  static const String keyUsername = 'user_username';
  static const String keyEmail = 'user_email';
  static const String keyRole = 'user_role';
  static const String keyAvatar = 'user_avatar';

  final Rx<ProfileState> state = const ProfileState().obs;

  @override
  void onInit() {
    super.onInit();
    _loadInitialData();
  }

  void onIntent(ProfileIntent intent) {
    switch (intent) {
      case LoadProfileIntent():
        _loadInitialData();
      case UpdateProfileIntent(:final username, :final email):
        _updateProfile(username, email);
      case UpdateAvatarIntent(:final imagePath):
        _updateAvatar(imagePath);
      case AddSavedAddressIntent(:final address):
        _addSavedAddress(address);
      case DeleteSavedAddressIntent(:final index):
        _deleteSavedAddress(index);
      case SignOutIntent():
        _signOut();
    }
  }

  void _loadInitialData() {
    // 1. Read from local storage immediately for fast UI rendering
    final cachedUsername = LocalDB.getString(keyUsername) ?? 'Food Lover';
    final cachedEmail = LocalDB.getString(keyEmail) ?? '';
    final cachedRole = LocalDB.getString(keyRole) ?? 'user';
    final cachedAvatar = LocalDB.getString(keyAvatar) ?? '';
    var addresses = LocalDB.getStringList(keySavedAddresses) ?? [];

    // Prepopulate with last checkout address if list is empty
    if (addresses.isEmpty) {
      final lastAddress = LocalDB.getString(keyUserAddress);
      if (lastAddress != null && lastAddress.trim().isNotEmpty) {
        addresses = [lastAddress.trim()];
        LocalDB.setStringList(keySavedAddresses, addresses);
      }
    }

    int favCount = 0;
    if (Get.isRegistered<FavoritesService>()) {
      favCount = Get.find<FavoritesService>().favoriteIds.length;
    }

    state.value = state.value.copyWith(
      username: cachedUsername,
      email: cachedEmail,
      role: cachedRole,
      avatar: cachedAvatar,
      savedAddresses: addresses,
      favoritesCount: favCount,
    );

    // 2. Refresh from backend
    _fetchProfileFromApi();
    _fetchOrdersAndPoints();
  }

  Future<void> _fetchProfileFromApi() async {
    try {
      final response = await ApiClient.get('/users/profile');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final username = data['username'] as String? ?? state.value.username;
        final email = data['email'] as String? ?? state.value.email;
        final role = data['role'] as String? ?? state.value.role;
        final avatar = data['avatar'] as String? ?? state.value.avatar;

        await LocalDB.setString(keyUsername, username);
        if (email.isNotEmpty) {
          await LocalDB.setString(keyEmail, email);
        }
        await LocalDB.setString(keyRole, role);
        if (avatar.isNotEmpty) {
          await LocalDB.setString(keyAvatar, avatar);
        }

        state.value = state.value.copyWith(
          username: username,
          email: email,
          role: role,
          avatar: avatar,
        );
        debugPrint('👤 [ProfileStore] Loaded backend profile for $username');
      }
    } catch (e) {
      debugPrint('⚠️ [ProfileStore] Failed to fetch backend profile: $e');
    }
  }

  Future<void> _fetchOrdersAndPoints() async {
    try {
      final orders = await orderRepository.getMyOrders();
      final count = orders.length;
      final points = count * 40; // 40 points per order

      state.value = state.value.copyWith(
        ordersCount: count,
        points: points,
      );
    } catch (e) {
      debugPrint('⚠️ [ProfileStore] Failed to fetch orders count: $e');
    }
  }

  Future<void> _updateProfile(String newUsername, String newEmail) async {
    final cleanUsername = newUsername.trim();
    final cleanEmail = newEmail.trim();

    if (cleanUsername.isEmpty) {
      state.value = state.value.copyWith(errorMessage: 'Username cannot be empty');
      return;
    }

    state.value = state.value.copyWith(isUpdating: true, errorMessage: null);

    try {
      final payload = <String, dynamic>{'username': cleanUsername};
      if (cleanEmail.isNotEmpty) {
        payload['email'] = cleanEmail;
      }

      final response = await ApiClient.update('/users/profile', payload);

      if (response.statusCode == 200) {
        await LocalDB.setString(keyUsername, cleanUsername);
        if (cleanEmail.isNotEmpty) {
          await LocalDB.setString(keyEmail, cleanEmail);
        }

        state.value = state.value.copyWith(
          username: cleanUsername,
          email: cleanEmail.isNotEmpty ? cleanEmail : state.value.email,
          isUpdating: false,
          successMessage: 'Profile updated successfully',
        );
      } else {
        final errJson = jsonDecode(response.body);
        final msg = errJson is Map ? errJson['message'] ?? 'Update failed' : 'Update failed';
        state.value = state.value.copyWith(isUpdating: false, errorMessage: msg);
      }
    } catch (e) {
      state.value = state.value.copyWith(
        isUpdating: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> _addSavedAddress(String newAddress) async {
    final clean = newAddress.trim();
    if (clean.isEmpty) return;

    final current = List<String>.from(state.value.savedAddresses);
    if (!current.contains(clean)) {
      current.insert(0, clean);
      await LocalDB.setStringList(keySavedAddresses, current);
      await LocalDB.setString(keyUserAddress, clean);
      state.value = state.value.copyWith(savedAddresses: current);
    }
  }

  Future<void> _deleteSavedAddress(int index) async {
    final current = List<String>.from(state.value.savedAddresses);
    if (index >= 0 && index < current.length) {
      current.removeAt(index);
      await LocalDB.setStringList(keySavedAddresses, current);
      state.value = state.value.copyWith(savedAddresses: current);
    }
  }

  Future<void> _updateAvatar(String imagePath) async {
    state.value = state.value.copyWith(
      isUploadingAvatar: true,
      errorMessage: null,
      successMessage: null,
    );

    try {
      final uploadResponse = await ApiClient.uploadFile(
        '/upload',
        imagePath,
        fieldName: 'image',
      );

      if (uploadResponse.statusCode == 200 || uploadResponse.statusCode == 201) {
        final uploadData = jsonDecode(uploadResponse.body) as Map<String, dynamic>;
        final imageInfo = uploadData['image'] as Map<String, dynamic>?;
        final avatarUrl = imageInfo?['url'] as String? ?? '';

        if (avatarUrl.isEmpty) {
          state.value = state.value.copyWith(
            isUploadingAvatar: false,
            errorMessage: 'Failed to retrieve uploaded image URL',
          );
          if (Get.context != null) {
            Get.snackbar(
              'Upload Failed',
              'Could not retrieve uploaded image URL',
              backgroundColor: const Color(0xFFEF4444),
              colorText: const Color(0xFFFFFFFF),
              snackPosition: SnackPosition.TOP,
              margin: const EdgeInsets.all(16),
              borderRadius: 12,
            );
          }
          return;
        }

        final profileResponse = await ApiClient.update(
          '/users/profile',
          {'avatar': avatarUrl},
        );

        if (profileResponse.statusCode == 200) {
          await LocalDB.setString(keyAvatar, avatarUrl);
          state.value = state.value.copyWith(
            avatar: avatarUrl,
            isUploadingAvatar: false,
            successMessage: 'Profile picture updated successfully',
          );
          if (Get.context != null) {
            Get.snackbar(
              'Avatar Updated',
              'Your profile picture has been updated.',
              backgroundColor: const Color(0xFF10B981),
              colorText: const Color(0xFFFFFFFF),
              snackPosition: SnackPosition.TOP,
              margin: const EdgeInsets.all(16),
              borderRadius: 12,
            );
          }
        } else {
          final errJson = jsonDecode(profileResponse.body);
          final msg = errJson is Map ? errJson['message'] ?? 'Failed to update profile' : 'Failed to update profile';
          state.value = state.value.copyWith(
            isUploadingAvatar: false,
            errorMessage: msg,
          );
          if (Get.context != null) {
            Get.snackbar(
              'Update Failed',
              msg,
              backgroundColor: const Color(0xFFEF4444),
              colorText: const Color(0xFFFFFFFF),
              snackPosition: SnackPosition.TOP,
              margin: const EdgeInsets.all(16),
              borderRadius: 12,
            );
          }
        }
      } else {
        final errJson = jsonDecode(uploadResponse.body);
        final msg = errJson is Map ? errJson['message'] ?? 'Failed to upload image' : 'Failed to upload image';
        state.value = state.value.copyWith(
          isUploadingAvatar: false,
          errorMessage: msg,
        );
        if (Get.context != null) {
          Get.snackbar(
            'Upload Failed',
            msg,
            backgroundColor: const Color(0xFFEF4444),
            colorText: const Color(0xFFFFFFFF),
            snackPosition: SnackPosition.TOP,
            margin: const EdgeInsets.all(16),
            borderRadius: 12,
          );
        }
      }
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      state.value = state.value.copyWith(
        isUploadingAvatar: false,
        errorMessage: msg,
      );
      if (Get.context != null) {
        Get.snackbar(
          'Upload Failed',
          msg,
          backgroundColor: const Color(0xFFEF4444),
          colorText: const Color(0xFFFFFFFF),
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
          borderRadius: 12,
        );
      }
    }
  }

  Future<void> _signOut() async {
    await ApiClient.clearTokens();
    await LocalDB.remove(keyUsername);
    await LocalDB.remove(keyEmail);
    await LocalDB.remove(keyRole);
    await LocalDB.remove(keyAvatar);

    if (Get.isRegistered<CartService>()) {
      Get.find<CartService>().clearCart();
    }

    Get.offAllNamed(AppRoutes.login);
  }
}
