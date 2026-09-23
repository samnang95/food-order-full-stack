import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../checkout_intent.dart';
import '../checkout_store.dart';

class CheckoutAddressCard extends GetView<CheckoutStore> {
  const CheckoutAddressCard({super.key});

  void _showEditAddressDialog(BuildContext context, String currentAddress) {
    final textController = TextEditingController(text: currentAddress);

    Get.dialog(
      AlertDialog(
        title: const Text('Edit Delivery Address'),
        content: TextField(
          controller: textController,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: 'Enter complete street, house number, area...',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              final newAddr = textController.text.trim();
              if (newAddr.isNotEmpty) {
                controller.onIntent(ChangeDeliveryAddress(newAddr));
              }
              Get.back();
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;

    return Obx(() {
      final address = controller.state.value.deliveryAddress;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.location_on_rounded,
                    color: AppColors.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Delivery Address',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppColors.neutral,
                    ),
                  ),
                ),
                TextButton.icon(
                  onPressed: () => _showEditAddressDialog(context, address),
                  icon: const Icon(Icons.edit_outlined, size: 14),
                  label: const Text(
                    'Edit',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    visualDensity: VisualDensity.compact,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              address,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.white70 : const Color(0xFF374151),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              onChanged: (val) => controller.onIntent(ChangeDeliveryNote(val)),
              decoration: InputDecoration(
                hintText: 'Note for rider (e.g. Call upon arrival, 2nd floor)',
                hintStyle: TextStyle(
                  fontSize: 12.5,
                  color: isDark ? Colors.white38 : Colors.black38,
                ),
                prefixIcon: const Icon(Icons.note_alt_outlined, size: 18),
                filled: true,
                fillColor: isDark ? const Color(0xFF161C2C) : const Color(0xFFF9FAFB),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                isDense: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: borderColor),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: borderColor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.primary),
                ),
              ),
            ),
          ],
        ),
      );
    });
  }
}
