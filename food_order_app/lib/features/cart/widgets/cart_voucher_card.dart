import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/services/cart_service.dart';
import '../../../../core/services/voucher_service.dart';
import '../../../../core/widgets/voucher_bottom_sheet.dart';

class CartVoucherCard extends StatelessWidget {
  const CartVoucherCard({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0);

    final cartService = Get.isRegistered<CartService>()
        ? Get.find<CartService>()
        : Get.put(CartService(), permanent: true);

    final voucherService = Get.isRegistered<VoucherService>()
        ? Get.find<VoucherService>()
        : Get.put(VoucherService(), permanent: true);

    return Obx(() {
      final applied = voucherService.appliedVoucher.value;
      final discount = voucherService.discountAmount.value;
      final isApplied = applied != null && discount > 0;

      return Container(
        decoration: BoxDecoration(
          color: isApplied
              ? const Color(0xFF10B981).withValues(alpha: isDark ? 0.12 : 0.08)
              : cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isApplied
                ? const Color(0xFF10B981).withValues(alpha: 0.4)
                : borderColor,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {
              VoucherBottomSheet.show(context, subtotal: cartService.subtotal);
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isApplied
                          ? const Color(0xFF10B981).withValues(alpha: 0.18)
                          : AppColors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      isApplied ? Icons.discount_rounded : Icons.local_offer_outlined,
                      color: isApplied ? const Color(0xFF10B981) : AppColors.primary,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (isApplied) ...[
                          Row(
                            children: [
                              Text(
                                applied.code,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: Color(0xFF10B981),
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 6, vertical: 1.5),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981).withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  '-\$${discount.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF10B981),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            applied.desc,
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.white60 : const Color(0xFF64748B),
                            ),
                          ),
                        ] else ...[
                          Text(
                            'Apply Promo Code',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: isDark ? Colors.white : AppColors.neutral,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Select or enter promo code for discounts',
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.white54 : const Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  if (isApplied)
                    GestureDetector(
                      onTap: () => voucherService.removeVoucher(),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        child: const Text(
                          'Remove',
                          style: TextStyle(
                            color: Color(0xFFEF4444),
                            fontWeight: FontWeight.bold,
                            fontSize: 12.5,
                          ),
                        ),
                      ),
                    )
                  else
                    Icon(
                      Icons.chevron_right_rounded,
                      color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                      size: 22,
                    ),
                ],
              ),
            ),
          ),
        ),
      );
    });
  }
}
