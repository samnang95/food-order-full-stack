import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../constants/app_colors.dart';
import '../controllers/voucher_bottom_sheet_controller.dart';
import '../../domain/voucher/entities/voucher_entity.dart';

class VoucherBottomSheet extends StatelessWidget {
  final double subtotal;

  const VoucherBottomSheet({
    super.key,
    required this.subtotal,
  });

  static Future<void> show(BuildContext context, {required double subtotal}) async {
    final controller = Get.isRegistered<VoucherBottomSheetController>()
        ? Get.find<VoucherBottomSheetController>()
        : Get.put(VoucherBottomSheetController(), permanent: true);
    controller.updateSubtotal(subtotal);
    controller.clearInput();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF141A29) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => VoucherBottomSheet(subtotal: subtotal),
    );
  }

  Future<void> _handleApply(
    BuildContext context,
    VoucherBottomSheetController controller,
    String code,
  ) async {
    FocusScope.of(context).unfocus();
    final success = await controller.applyCode(code);
    if (success && context.mounted) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = Get.isRegistered<VoucherBottomSheetController>()
        ? Get.find<VoucherBottomSheetController>()
        : Get.put(VoucherBottomSheetController(initialSubtotal: subtotal));
    controller.updateSubtotal(subtotal);

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final screenHeight = MediaQuery.of(context).size.height;

    return Container(
      constraints: BoxConstraints(
        maxHeight: screenHeight * 0.85,
      ),
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 16, 12),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.confirmation_number_rounded,
                    color: AppColors.primary,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Promotions & Vouchers',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : AppColors.neutral,
                        ),
                      ),
                      Obx(() => Text(
                        'Order subtotal: \$${controller.subtotal.value.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 12.5,
                          color: isDark ? Colors.white54 : const Color(0xFF64748B),
                        ),
                      )),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: Icon(
                    Icons.close_rounded,
                    color: isDark ? Colors.white70 : const Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Content
          Flexible(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Manual Promo Code Input Card
                  _buildManualInputCard(context, controller, isDark),

                  const SizedBox(height: 20),

                  // 2. Available Vouchers List
                  Text(
                    'Available Offers',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : AppColors.neutral,
                    ),
                  ),
                  const SizedBox(height: 12),

                  Obx(() {
                    final vouchers = controller.availableVouchers;
                    if (vouchers.isEmpty) {
                      return Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Center(
                          child: Text(
                            'No vouchers available right now.',
                            style: TextStyle(
                              color: isDark ? Colors.white54 : AppColors.subtitleColor,
                            ),
                          ),
                        ),
                      );
                    }

                    return ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: vouchers.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 12),
                      itemBuilder: (ctx, index) {
                        return _buildVoucherTicket(
                          context,
                          controller,
                          vouchers[index],
                          isDark,
                        );
                      },
                    );
                  }),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildManualInputCard(
    BuildContext context,
    VoucherBottomSheetController controller,
    bool isDark,
  ) {
    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.voucherError.value;

      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E2638) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: error != null
                ? const Color(0xFFEF4444).withValues(alpha: 0.6)
                : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0)),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller.codeController,
                    textCapitalization: TextCapitalization.characters,
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9]')),
                      LengthLimitingTextInputFormatter(16),
                    ],
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.8,
                      color: isDark ? Colors.white : AppColors.neutral,
                    ),
                    decoration: InputDecoration(
                      isDense: true,
                      hintText: 'Enter promo code (e.g. WELCOME10)',
                      hintStyle: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.normal,
                        letterSpacing: 0,
                        color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                      ),
                      prefixIcon: const Icon(
                        Icons.local_offer_outlined,
                        size: 20,
                        color: AppColors.primary,
                      ),
                      prefixIconConstraints: const BoxConstraints(
                        minWidth: 34,
                        minHeight: 24,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                    onSubmitted: (val) {
                      if (val.trim().isNotEmpty && !isLoading) {
                        _handleApply(context, controller, val);
                      }
                    },
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: isLoading
                      ? null
                      : () {
                          final code = controller.codeController.text.trim();
                          if (code.isNotEmpty) {
                            _handleApply(context, controller, code);
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: isLoading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Apply',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                ),
              ],
            ),
            if (error != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(
                    Icons.error_outline_rounded,
                    size: 15,
                    color: Color(0xFFEF4444),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      error,
                      style: const TextStyle(
                        color: Color(0xFFEF4444),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      );
    });
  }

  Widget _buildVoucherTicket(
    BuildContext context,
    VoucherBottomSheetController controller,
    VoucherEntity voucher,
    bool isDark,
  ) {
    return Obx(() {
      final applied = controller.appliedVoucher.value;
      final isApplied = applied?.code == voucher.code;
      final currentSubtotal = controller.subtotal.value;
      final isEligible = voucher.isEligible(currentSubtotal);
      final needed = voucher.amountNeeded(currentSubtotal);

      final cardBg = isApplied
          ? const Color(0xFF10B981).withValues(alpha: 0.08)
          : (isDark ? const Color(0xFF1E2638) : Colors.white);

      final borderColor = isApplied
          ? const Color(0xFF10B981).withValues(alpha: 0.5)
          : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0));

      return Container(
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor, width: isApplied ? 1.5 : 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Left discount badge
              Container(
                width: 88,
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                decoration: BoxDecoration(
                  color: isApplied
                      ? const Color(0xFF10B981).withValues(alpha: 0.15)
                      : (isEligible
                          ? AppColors.primary.withValues(alpha: 0.12)
                          : (isDark ? const Color(0xFF283044) : const Color(0xFFF1F5F9))),
                  borderRadius: const BorderRadius.horizontal(left: Radius.circular(15)),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      voucher.type == 'percentage'
                          ? Icons.percent_rounded
                          : Icons.attach_money_rounded,
                      color: isApplied
                          ? const Color(0xFF10B981)
                          : (isEligible ? AppColors.primary : Colors.grey),
                      size: 22,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      voucher.title,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 12,
                        color: isApplied
                            ? const Color(0xFF10B981)
                            : (isEligible ? AppColors.primary : Colors.grey),
                      ),
                    ),
                  ],
                ),
              ),

              // Right voucher details & action
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF2A3449) : const Color(0xFFE2E8F0),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              voucher.code,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.6,
                                color: isDark ? Colors.white : AppColors.neutral,
                              ),
                            ),
                          ),
                          const Spacer(),
                          if (isApplied)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.check_circle_rounded,
                                      size: 13, color: Color(0xFF10B981)),
                                  SizedBox(width: 4),
                                  Text(
                                    'Applied',
                                    style: TextStyle(
                                      color: Color(0xFF10B981),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          else if (!isEligible)
                            Text(
                              'Add \$${needed.toStringAsFixed(2)}',
                              style: const TextStyle(
                                color: Color(0xFFF59E0B),
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        voucher.desc,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.white70 : const Color(0xFF475569),
                          height: 1.25,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Min order: \$${voucher.minSpend.toStringAsFixed(2)}',
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                            ),
                          ),
                          if (isApplied)
                            GestureDetector(
                              onTap: () => controller.removeVoucher(),
                              child: const Text(
                                'Remove',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFEF4444),
                                ),
                              ),
                            )
                          else
                            GestureDetector(
                              onTap: isEligible
                                  ? () => _handleApply(context, controller, voucher.code)
                                  : null,
                              child: Text(
                                'Apply',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.bold,
                                  color: isEligible
                                      ? AppColors.primary
                                      : (isDark ? Colors.white24 : const Color(0xFFCBD5E1)),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    });
  }
}
