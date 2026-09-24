import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/db/local_db.dart';
import '../profile_intent.dart';
import '../profile_store.dart';

class SavedAddressesSheet extends StatefulWidget {
  final ProfileStore store;

  const SavedAddressesSheet({super.key, required this.store});

  static void show(BuildContext context, ProfileStore store) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SavedAddressesSheet(store: store),
    );
  }

  @override
  State<SavedAddressesSheet> createState() => _SavedAddressesSheetState();
}

class _SavedAddressesSheetState extends State<SavedAddressesSheet> {
  final _addressController = TextEditingController();
  bool _isAdding = false;

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final itemBg = isDark ? const Color(0xFF141A28) : const Color(0xFFF9FAFB);
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.75,
        ),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? Colors.white24 : Colors.black12,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'savedAddresses'.getString(context).isNotEmpty
                      ? 'savedAddresses'.getString(context)
                      : 'Saved Addresses',
                  style: TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : AppColors.neutral,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Add Address toggle or input
            if (!_isAdding)
              OutlinedButton.icon(
                onPressed: () => setState(() => _isAdding = true),
                icon: const Icon(Icons.add_location_alt_outlined, size: 18),
                label: Text(
                  'addAddress'.getString(context).isNotEmpty
                      ? 'addAddress'.getString(context)
                      : '+ Add New Address',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.primary, width: 1.2),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                ),
              )
            else
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _addressController,
                      autofocus: true,
                      style: TextStyle(color: isDark ? Colors.white : AppColors.neutral, fontSize: 13.5),
                      decoration: InputDecoration(
                        hintText: 'e.g. Street 271, Boeng Tumpun',
                        hintStyle: TextStyle(color: isDark ? Colors.white38 : Colors.black38),
                        filled: true,
                        fillColor: itemBg,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: borderColor),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _saveNewAddress,
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check_rounded, color: Colors.white, size: 16),
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      _addressController.clear();
                      setState(() => _isAdding = false);
                    },
                    icon: const Icon(Icons.close_rounded, size: 20),
                  ),
                ],
              ),
            const SizedBox(height: 16),

            // Address List
            Flexible(
              child: Obx(() {
                final addresses = widget.store.state.value.savedAddresses;
                if (addresses.isEmpty) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 36),
                    child: Center(
                      child: Text(
                        'noSavedAddresses'.getString(context).isNotEmpty
                            ? 'noSavedAddresses'.getString(context)
                            : 'No saved addresses yet',
                        style: TextStyle(
                          color: isDark ? Colors.white38 : AppColors.subtitleColor,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  );
                }

                return ListView.separated(
                  shrinkWrap: true,
                  physics: const BouncingScrollPhysics(),
                  itemCount: addresses.length,
                  separatorBuilder: (ctx, i) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final addr = addresses[index];
                    return Container(
                      decoration: BoxDecoration(
                        color: itemBg,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: borderColor),
                      ),
                      child: ListTile(
                        leading: const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 22),
                        title: Text(
                          addr,
                          style: TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white : AppColors.neutral,
                          ),
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete_outline_rounded, size: 20, color: Color(0xFFEF4444)),
                          onPressed: () {
                            widget.store.onIntent(DeleteSavedAddressIntent(index));
                          },
                        ),
                        onTap: () async {
                          await LocalDB.setString(ProfileStore.keyUserAddress, addr);
                          if (!context.mounted) return;
                          Navigator.of(context).pop();
                          Get.snackbar(
                            'Address Selected',
                            addr,
                            snackPosition: SnackPosition.TOP,
                            margin: const EdgeInsets.all(16),
                            borderRadius: 12,
                            duration: const Duration(seconds: 2),
                          );
                        },
                      ),
                    );
                  },
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  void _saveNewAddress() {
    final text = _addressController.text.trim();
    if (text.isNotEmpty) {
      widget.store.onIntent(AddSavedAddressIntent(text));
      _addressController.clear();
      setState(() => _isAdding = false);
    }
  }
}
