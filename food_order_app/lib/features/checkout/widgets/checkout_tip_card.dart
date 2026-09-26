import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/locale/translation_helper.dart';
import '../checkout_intent.dart';
import '../checkout_store.dart';

class CheckoutTipCard extends StatefulWidget {
  const CheckoutTipCard({super.key});

  @override
  State<CheckoutTipCard> createState() => _CheckoutTipCardState();
}

class _CheckoutTipCardState extends State<CheckoutTipCard> {
  final CheckoutStore controller = Get.find<CheckoutStore>();
  bool _isCustomSelected = false;
  late final TextEditingController _customTipController;

  static const List<double> _presetTips = [0.0, 1.0, 2.0, 3.0];

  @override
  void initState() {
    super.initState();
    final currentTip = controller.state.value.driverTip;
    _customTipController = TextEditingController(
      text: currentTip > 0 && !_presetTips.contains(currentTip)
          ? currentTip.toStringAsFixed(2)
          : '',
    );
    if (currentTip > 0 && !_presetTips.contains(currentTip)) {
      _isCustomSelected = true;
    }
  }

  @override
  void dispose() {
    _customTipController.dispose();
    super.dispose();
  }

  void _selectPresetTip(double amount) {
    setState(() {
      _isCustomSelected = false;
    });
    _customTipController.clear();
    controller.onIntent(SelectTipIntent(amount));
  }

  void _applyCustomTip(String val) {
    final parsed = double.tryParse(val) ?? 0.0;
    final clamped = parsed.clamp(0.0, 50.0);
    controller.onIntent(SelectTipIntent(clamped));
  }

  void _addCustomIncrement(double inc) {
    final current = double.tryParse(_customTipController.text) ?? 0.0;
    final next = (current + inc).clamp(0.0, 50.0);
    final formatted = next.toStringAsFixed(2);
    _customTipController.text = formatted;
    _applyCustomTip(formatted);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;
    final subCardBg = isDark ? const Color(0xFF141A29) : const Color(0xFFF8FAFC);

    return Obx(() {
      final state = controller.state.value;
      final currentTip = state.driverTip;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: borderColor),
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
            // Header Row
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.volunteer_activism_rounded,
                    color: Color(0xFFF59E0B),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'tipYourRider'.trOr(context, 'Tip Your Rider'),
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : AppColors.neutral,
                        ),
                      ),
                      Text(
                        'tipRiderSubtitle'.trOr(
                          context,
                          '100% of your tip goes directly to your driver',
                        ),
                        style: TextStyle(
                          fontSize: 11.5,
                          color: isDark ? Colors.white54 : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // Tip Option Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: [
                  ..._presetTips.map((amount) {
                    final isSelected = !_isCustomSelected && currentTip == amount;
                    final String label = amount == 0.0
                        ? 'noTip'.trOr(context, 'No Tip')
                        : '\$${amount.toStringAsFixed(0)}';

                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: InkWell(
                        onTap: () => _selectPresetTip(amount),
                        borderRadius: BorderRadius.circular(16),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFFF59E0B).withValues(alpha: 0.15)
                                : subCardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected
                                  ? const Color(0xFFF59E0B)
                                  : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0)),
                              width: isSelected ? 1.6 : 1.0,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (amount == 2.0) ...[
                                const Icon(Icons.favorite_rounded, size: 13, color: Color(0xFFF59E0B)),
                                const SizedBox(width: 4),
                              ] else if (amount == 3.0) ...[
                                const Text('🔥 ', style: TextStyle(fontSize: 11)),
                              ],
                              Text(
                                label,
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                  color: isSelected
                                      ? const Color(0xFFF59E0B)
                                      : (isDark ? Colors.white70 : const Color(0xFF475569)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),

                  // Custom Tip Chip
                  InkWell(
                    onTap: () {
                      setState(() {
                        _isCustomSelected = true;
                      });
                      if (_customTipController.text.isNotEmpty) {
                        _applyCustomTip(_customTipController.text);
                      }
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: _isCustomSelected
                            ? const Color(0xFFF59E0B).withValues(alpha: 0.15)
                            : subCardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _isCustomSelected
                              ? const Color(0xFFF59E0B)
                              : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0)),
                          width: _isCustomSelected ? 1.6 : 1.0,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.edit_rounded,
                            size: 13,
                            color: _isCustomSelected
                                ? const Color(0xFFF59E0B)
                                : (isDark ? Colors.white70 : const Color(0xFF475569)),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'custom'.trOr(context, 'Custom'),
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: _isCustomSelected ? FontWeight.w800 : FontWeight.w600,
                              color: _isCustomSelected
                                  ? const Color(0xFFF59E0B)
                                  : (isDark ? Colors.white70 : const Color(0xFF475569)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Custom Tip Input Field
            if (_isCustomSelected) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: subCardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _customTipController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            inputFormatters: [
                              FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
                            ],
                            onChanged: _applyCustomTip,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : AppColors.neutral,
                            ),
                            decoration: InputDecoration(
                              prefixText: '\$ ',
                              prefixStyle: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFF59E0B),
                              ),
                              hintText: '0.00',
                              hintStyle: TextStyle(
                                color: isDark ? Colors.white30 : Colors.black26,
                              ),
                              isDense: true,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              filled: true,
                              fillColor: isDark ? const Color(0xFF1E2638) : Colors.white,
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
                                borderSide: const BorderSide(color: Color(0xFFF59E0B)),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.close_rounded, size: 18),
                          onPressed: () => _selectPresetTip(0.0),
                          tooltip: 'Clear custom tip',
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Quick Increment Chips
                    Row(
                      children: [
                        Text(
                          'quickAdd'.trOr(context, 'Add:'),
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? Colors.white54 : const Color(0xFF64748B),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 6),
                        ...[0.50, 1.00, 2.00, 5.00].map((val) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: InkWell(
                              onTap: () => _addCustomIncrement(val),
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF1E2638) : Colors.white,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: borderColor),
                                ),
                                child: Text(
                                  '+\$${val.toStringAsFixed(val.truncateToDouble() == val ? 0 : 2)}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFFF59E0B),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ],
                ),
              ),
            ],

            // Thank-you message when tip is added
            if (currentTip > 0) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.favorite_rounded, size: 16, color: Color(0xFFF59E0B)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'thankYouForTipping'.trOr(
                          context,
                          'Thank you! Your \$${currentTip.toStringAsFixed(2)} tip will make your rider\'s day brighter.',
                        ),
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFFD97706),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      );
    });
  }
}
