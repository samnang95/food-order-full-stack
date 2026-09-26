import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/locale/translation_helper.dart';
import '../../../../core/widgets/voucher_bottom_sheet.dart';
import '../checkout_intent.dart';
import '../checkout_store.dart';

class CheckoutVoucherCard extends StatefulWidget {
  const CheckoutVoucherCard({super.key});

  @override
  State<CheckoutVoucherCard> createState() => _CheckoutVoucherCardState();
}

class _CheckoutVoucherCardState extends State<CheckoutVoucherCard> {
  final TextEditingController _controller = TextEditingController();

  final List<Map<String, String>> _quickVouchers = const [
    {'code': 'WELCOME10', 'label': '10% OFF'},
    {'code': 'FREESHIP', 'label': 'Free Delivery'},
    {'code': 'BITECRAFT2', 'label': '\$2.00 OFF'},
    {'code': 'KHNEWYEAR', 'label': '15% Special'},
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final store = Get.find<CheckoutStore>();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;

    return Obx(() {
      final state = store.state.value;
      final isApplied = state.appliedVoucherCode != null && state.appliedVoucherCode!.isNotEmpty;
      final isApplying = state.isApplyingVoucher;
      final discount = state.discountAmount;
      final error = state.voucherError;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isApplied
                ? const Color(0xFF10B981).withValues(alpha: 0.5)
                : borderColor,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: (isApplied ? const Color(0xFF10B981) : AppColors.primary)
                        .withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    isApplied ? Icons.discount_rounded : Icons.local_offer_outlined,
                    color: isApplied ? const Color(0xFF10B981) : AppColors.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'voucherTitle'.trOr(context, 'Promo Code & Vouchers'),
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : AppColors.neutral,
                        ),
                      ),
                      Text(
                        isApplied
                            ? 'voucherSavedMsg'.trOr(context, 'Discount successfully applied to your order')
                            : 'voucherSubtitle'.trOr(context, 'Apply a coupon to save on your meal'),
                        style: TextStyle(
                          fontSize: 11.5,
                          color: isApplied
                              ? const Color(0xFF10B981)
                              : (isDark ? Colors.white54 : const Color(0xFF64748B)),
                          fontWeight: isApplied ? FontWeight.w600 : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            if (isApplied) ...[
              // Applied Voucher Banner
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: const Color(0xFF10B981).withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.check_circle_rounded,
                      color: Color(0xFF10B981),
                      size: 22,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            state.appliedVoucherCode!,
                            style: const TextStyle(
                              fontSize: 14.5,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF10B981),
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            '-\$${discount.toStringAsFixed(2)} ${'voucherSavings'.trOr(context, 'discount applied')}',
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.white70 : const Color(0xFF047857),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        VoucherBottomSheet.show(context, subtotal: store.cartService.subtotal);
                      },
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        visualDensity: VisualDensity.compact,
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                      ),
                      child: const Text(
                        'Change',
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        _controller.clear();
                        store.onIntent(const RemoveVoucherIntent());
                      },
                      style: TextButton.styleFrom(
                        foregroundColor: const Color(0xFFEF4444),
                        visualDensity: VisualDensity.compact,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      ),
                      child: Text(
                        'remove'.trOr(context, 'Remove'),
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              // Input Field & Apply Button
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      textCapitalization: TextCapitalization.characters,
                      style: TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w600,
                        color: isDark ? Colors.white : const Color(0xFF1E293B),
                        letterSpacing: 0.5,
                      ),
                      decoration: InputDecoration(
                        hintText: 'voucherHint'.trOr(context, 'Enter promo code (e.g. WELCOME10)'),
                        hintStyle: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.normal,
                          color: isDark ? Colors.white38 : Colors.black38,
                          letterSpacing: 0,
                        ),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF141A29) : const Color(0xFFF8FAFC),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                        isDense: true,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: borderColor),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: borderColor),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    height: 42,
                    child: ElevatedButton(
                      onPressed: isApplying
                          ? null
                          : () => store.onIntent(ApplyVoucherIntent(_controller.text)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 18),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: isApplying
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : Text(
                              'apply'.trOr(context, 'Apply'),
                              style: const TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ],
              ),

              // Error banner if any
              if (error != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.info_outline_rounded, size: 14, color: Color(0xFFEF4444)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        error,
                        style: const TextStyle(
                          fontSize: 11.5,
                          color: Color(0xFFEF4444),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ],

              const SizedBox(height: 12),

              // Quick Vouchers Suggestion Chips
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: _quickVouchers.map((v) {
                  return InkWell(
                    borderRadius: BorderRadius.circular(8),
                    onTap: () {
                      _controller.text = v['code']!;
                      store.onIntent(ApplyVoucherIntent(v['code']!));
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF141A29) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.tag_rounded, size: 12, color: AppColors.primary),
                          const SizedBox(width: 4),
                          Text(
                            v['code']!,
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '(${v['label']})',
                            style: TextStyle(
                              fontSize: 10.5,
                              color: isDark ? Colors.white54 : const Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 12),

              Center(
                child: InkWell(
                  borderRadius: BorderRadius.circular(8),
                  onTap: () {
                    VoucherBottomSheet.show(context, subtotal: store.cartService.subtotal);
                  },
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.confirmation_number_outlined, size: 14, color: AppColors.primary),
                        SizedBox(width: 6),
                        Text(
                          'Browse all available vouchers',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(Icons.chevron_right_rounded, size: 16, color: AppColors.primary),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      );
    });
  }
}
