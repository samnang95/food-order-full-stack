import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../domain/order/entities/order_entity.dart';

class CancellationReasonItem {
  final String id;
  final String label;
  final IconData icon;

  const CancellationReasonItem({
    required this.id,
    required this.label,
    required this.icon,
  });
}

class OrderCancellationBottomSheet extends StatefulWidget {
  final OrderEntity order;
  final ValueChanged<String> onConfirm;

  const OrderCancellationBottomSheet({
    super.key,
    required this.order,
    required this.onConfirm,
  });

  static Future<void> show({
    required BuildContext context,
    required OrderEntity order,
    required ValueChanged<String> onConfirm,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => OrderCancellationBottomSheet(
        order: order,
        onConfirm: onConfirm,
      ),
    );
  }

  @override
  State<OrderCancellationBottomSheet> createState() =>
      _OrderCancellationBottomSheetState();
}

class _OrderCancellationBottomSheetState
    extends State<OrderCancellationBottomSheet> {
  static const List<CancellationReasonItem> _reasons = [
    CancellationReasonItem(
      id: 'too_long',
      label: 'Delivery time is taking too long',
      icon: Icons.schedule_rounded,
    ),
    CancellationReasonItem(
      id: 'changed_mind',
      label: 'I changed my mind / ordered by mistake',
      icon: Icons.replay_rounded,
    ),
    CancellationReasonItem(
      id: 'wrong_address',
      label: 'Need to change delivery address or notes',
      icon: Icons.location_on_outlined,
    ),
    CancellationReasonItem(
      id: 'wrong_items',
      label: 'Ordered wrong items or duplicate order',
      icon: Icons.shopping_bag_outlined,
    ),
    CancellationReasonItem(
      id: 'promo_code',
      label: 'Forgot to apply discount or promo code',
      icon: Icons.local_offer_outlined,
    ),
    CancellationReasonItem(
      id: 'other',
      label: 'Other reason',
      icon: Icons.edit_note_rounded,
    ),
  ];

  late String _selectedReasonId;
  final TextEditingController _customReasonController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _selectedReasonId = _reasons.first.id;
  }

  @override
  void dispose() {
    _customReasonController.dispose();
    super.dispose();
  }

  String get _finalReasonText {
    if (_selectedReasonId == 'other') {
      final custom = _customReasonController.text.trim();
      return custom.isNotEmpty ? custom : 'Other reason';
    }
    final item = _reasons.firstWhere(
      (r) => r.id == _selectedReasonId,
      orElse: () => _reasons.first,
    );
    return item.label;
  }

  void _handleConfirm() {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);
    Navigator.of(context).pop();
    widget.onConfirm(_finalReasonText);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;
    final isCash = widget.order.paymentMethod.toLowerCase() == 'cash';

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),

            // Top Drag Handle
            Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white24 : Colors.black26,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),

            // Sheet Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.cancel_outlined,
                      color: Color(0xFFEF4444),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Cancel Order & Refund',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: isDark ? Colors.white : AppColors.neutral,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Order ${widget.order.shortId} • \$${widget.order.totalAmount.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontSize: 13,
                            color: isDark ? Colors.white60 : AppColors.subtitleColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 22),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Divider(color: borderColor, height: 1),

            // Scrollable Content
            Flexible(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Automated Refund Calculation Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981)
                            .withValues(alpha: isDark ? 0.15 : 0.08),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: const Color(0xFF10B981).withValues(alpha: 0.3),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(
                                Icons.verified_rounded,
                                size: 18,
                                color: Color(0xFF10B981),
                              ),
                              SizedBox(width: 8),
                              Text(
                                '100% Full Refund Guaranteed',
                                style: TextStyle(
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF10B981),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            isCash
                                ? 'The restaurant has not started preparation yet. Since this was Cash on Delivery, no payment was collected.'
                                : 'The restaurant has not started cooking. You are entitled to an automated 100% refund.',
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.white70 : AppColors.subtitleColor,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Divider(
                            color: const Color(0xFF10B981).withValues(alpha: 0.2),
                            height: 1,
                          ),
                          const SizedBox(height: 10),

                          // Refund Details Breakdown
                          _buildRefundRow(
                            label: 'Refund Method',
                            value: widget.order.paymentMethod.toUpperCase(),
                            isDark: isDark,
                          ),
                          const SizedBox(height: 6),
                          _buildRefundRow(
                            label: 'Refund Amount',
                            value: isCash
                                ? '\$0.00 (No charge)'
                                : '\$${widget.order.totalAmount.toStringAsFixed(2)}',
                            isDark: isDark,
                            isHighlight: true,
                          ),
                          const SizedBox(height: 6),
                          _buildRefundRow(
                            label: 'Processing Time',
                            value: isCash
                                ? 'Instant cancellation'
                                : 'Instant to Wallet / 1-3 business days',
                            isDark: isDark,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Reason Selector Title
                    Text(
                      'Please select a reason for cancellation',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.white : AppColors.neutral,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Reason Cards
                    ...List.generate(_reasons.length, (index) {
                      final reason = _reasons[index];
                      final isSelected = _selectedReasonId == reason.id;

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: InkWell(
                          onTap: () => setState(() => _selectedReasonId = reason.id),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? const Color(0xFFEF4444)
                                      .withValues(alpha: isDark ? 0.15 : 0.08)
                                  : (isDark
                                      ? const Color(0xFF161C2C)
                                      : const Color(0xFFF9FAFB)),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected
                                    ? const Color(0xFFEF4444)
                                    : borderColor,
                                width: isSelected ? 1.8 : 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  reason.icon,
                                  size: 18,
                                  color: isSelected
                                      ? const Color(0xFFEF4444)
                                      : (isDark ? Colors.white60 : Colors.black54),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    reason.label,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: isSelected
                                          ? FontWeight.w700
                                          : FontWeight.w500,
                                      color: isSelected
                                          ? const Color(0xFFEF4444)
                                          : (isDark ? Colors.white : AppColors.neutral),
                                    ),
                                  ),
                                ),
                                Container(
                                  width: 18,
                                  height: 18,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: isSelected
                                        ? const Color(0xFFEF4444)
                                        : Colors.transparent,
                                    border: Border.all(
                                      color: isSelected
                                          ? const Color(0xFFEF4444)
                                          : (isDark ? Colors.white30 : Colors.black26),
                                      width: 2,
                                    ),
                                  ),
                                  child: isSelected
                                      ? const Icon(
                                          Icons.check,
                                          size: 12,
                                          color: Colors.white,
                                        )
                                      : null,
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }),

                    // Optional Custom Note if 'other' is selected
                    if (_selectedReasonId == 'other') ...[
                      const SizedBox(height: 8),
                      TextField(
                        controller: _customReasonController,
                        maxLines: 2,
                        decoration: InputDecoration(
                          hintText: 'Please describe the cancellation reason...',
                          hintStyle: TextStyle(
                            fontSize: 12.5,
                            color: isDark ? Colors.white38 : AppColors.subtitleColor,
                          ),
                          filled: true,
                          fillColor: isDark
                              ? const Color(0xFF161C2C)
                              : const Color(0xFFF9FAFB),
                          contentPadding: const EdgeInsets.all(12),
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
                            borderSide: const BorderSide(
                              color: Color(0xFFEF4444),
                              width: 1.5,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            Divider(color: borderColor, height: 1),

            // Action Buttons
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 16),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _handleConfirm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEF4444),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 0,
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : Text(
                              isCash
                                  ? 'Confirm Cancellation'
                                  : 'Confirm Cancellation & Refund (\$${widget.order.totalAmount.toStringAsFixed(2)})',
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        foregroundColor:
                            isDark ? Colors.white70 : AppColors.subtitleColor,
                      ),
                      child: const Text(
                        'Keep My Order',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRefundRow({
    required String label,
    required String value,
    required bool isDark,
    bool isHighlight = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isDark ? Colors.white60 : AppColors.subtitleColor,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: TextStyle(
              fontSize: isHighlight ? 13 : 12,
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.w600,
              color: isHighlight
                  ? const Color(0xFF10B981)
                  : (isDark ? Colors.white : AppColors.neutral),
            ),
          ),
        ),
      ],
    );
  }
}
