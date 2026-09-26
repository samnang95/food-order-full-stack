import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/locale/translation_helper.dart';
import '../checkout_intent.dart';
import '../checkout_store.dart';

class CheckoutDeliveryTimeCard extends StatefulWidget {
  const CheckoutDeliveryTimeCard({super.key});

  @override
  State<CheckoutDeliveryTimeCard> createState() => _CheckoutDeliveryTimeCardState();
}

class _CheckoutDeliveryTimeCardState extends State<CheckoutDeliveryTimeCard> {
  final CheckoutStore controller = Get.find<CheckoutStore>();
  String _selectedDate = 'Today';

  static const List<String> _timeSlots = [
    '11:30 AM - 12:00 PM',
    '12:00 PM - 12:30 PM',
    '12:30 PM - 1:00 PM',
    '1:00 PM - 1:30 PM',
    '5:30 PM - 6:00 PM',
    '6:00 PM - 6:30 PM',
    '6:30 PM - 7:00 PM',
    '7:00 PM - 7:30 PM',
    '7:30 PM - 8:00 PM',
  ];

  List<String> _getDateOptions() {
    final now = DateTime.now();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    final d1 = now;
    final d2 = now.add(const Duration(days: 1));
    final d3 = now.add(const Duration(days: 2));

    return [
      'Today, ${months[d1.month - 1]} ${d1.day}',
      'Tomorrow, ${months[d2.month - 1]} ${d2.day}',
      '${weekdays[d3.weekday - 1]}, ${months[d3.month - 1]} ${d3.day}',
    ];
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;
    final subCardBg = isDark ? const Color(0xFF141A29) : const Color(0xFFF8FAFC);
    final dateOptions = _getDateOptions();

    return Obx(() {
      final state = controller.state.value;
      final isScheduled = state.isScheduled;
      final activeSlot = state.scheduledTimeSlot ?? _timeSlots[2];

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
                    color: const Color(0xFF3B82F6).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.access_time_filled_rounded,
                    color: Color(0xFF3B82F6),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'deliveryTiming'.trOr(context, 'Delivery Timing'),
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : AppColors.neutral,
                        ),
                      ),
                      Text(
                        isScheduled
                            ? 'Scheduled for ${state.scheduledDate ?? "Today"}'
                            : 'instantDeliverySub'.trOr(context, 'Instant order • 20 - 35 mins'),
                        style: TextStyle(
                          fontSize: 11.5,
                          color: isDark ? Colors.white54 : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isScheduled
                        ? AppColors.primary.withValues(alpha: 0.12)
                        : const Color(0xFF10B981).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isScheduled ? Icons.calendar_month_rounded : Icons.bolt_rounded,
                        size: 13,
                        color: isScheduled ? AppColors.primary : const Color(0xFF10B981),
                      ),
                      const SizedBox(width: 3),
                      Text(
                        isScheduled ? 'Scheduled' : 'Instant',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: isScheduled ? AppColors.primary : const Color(0xFF10B981),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // Mode Selector: Deliver Now vs Schedule for Later
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: subCardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => controller.onIntent(const SelectDeliveryModeIntent(isScheduled: false)),
                      borderRadius: BorderRadius.circular(11),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(vertical: 9),
                        decoration: BoxDecoration(
                          color: !isScheduled
                              ? (isDark ? const Color(0xFF1E2638) : Colors.white)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(11),
                          boxShadow: !isScheduled
                              ? [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.06),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.bolt_rounded,
                              size: 16,
                              color: !isScheduled ? const Color(0xFF10B981) : (isDark ? Colors.white60 : const Color(0xFF64748B)),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'deliverNow'.trOr(context, 'Deliver Now'),
                              style: TextStyle(
                                fontSize: 12.5,
                                fontWeight: !isScheduled ? FontWeight.w700 : FontWeight.w500,
                                color: !isScheduled
                                    ? (isDark ? Colors.white : AppColors.neutral)
                                    : (isDark ? Colors.white60 : const Color(0xFF64748B)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: InkWell(
                      onTap: () => controller.onIntent(const SelectDeliveryModeIntent(isScheduled: true)),
                      borderRadius: BorderRadius.circular(11),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(vertical: 9),
                        decoration: BoxDecoration(
                          color: isScheduled
                              ? (isDark ? const Color(0xFF1E2638) : Colors.white)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(11),
                          boxShadow: isScheduled
                              ? [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.06),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.calendar_today_rounded,
                              size: 14,
                              color: isScheduled ? AppColors.primary : (isDark ? Colors.white60 : const Color(0xFF64748B)),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              'scheduleLater'.trOr(context, 'Schedule Later'),
                              style: TextStyle(
                                fontSize: 12.5,
                                fontWeight: isScheduled ? FontWeight.w700 : FontWeight.w500,
                                color: isScheduled
                                    ? (isDark ? Colors.white : AppColors.neutral)
                                    : (isDark ? Colors.white60 : const Color(0xFF64748B)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Deliver Now Instant Info
            if (!isScheduled) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFF10B981).withValues(alpha: 0.25),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.flash_on_rounded, size: 16, color: Color(0xFF10B981)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'instantDeliveryNote'.trOr(
                          context,
                          'Rider will be dispatched immediately. Estimated arrival: 20 - 35 mins.',
                        ),
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF047857),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Schedule Options Section
            if (isScheduled) ...[
              const SizedBox(height: 14),

              // Date Selection Chips
              Text(
                'selectDate'.trOr(context, 'Select Date'),
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white70 : const Color(0xFF475569),
                ),
              ),
              const SizedBox(height: 8),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                child: Row(
                  children: dateOptions.map((opt) {
                    final isOptSelected = _selectedDate == opt ||
                        (opt.startsWith('Today') && _selectedDate == 'Today') ||
                        (state.scheduledDate != null && opt.startsWith(state.scheduledDate!));

                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: InkWell(
                        onTap: () {
                          setState(() {
                            _selectedDate = opt.split(',')[0];
                          });
                          controller.onIntent(SelectScheduleTimeSlotIntent(
                            date: opt.split(',')[0],
                            timeSlot: activeSlot,
                          ));
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            color: isOptSelected
                                ? AppColors.primary.withValues(alpha: 0.12)
                                : subCardBg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isOptSelected
                                  ? AppColors.primary
                                  : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0)),
                              width: isOptSelected ? 1.5 : 1.0,
                            ),
                          ),
                          child: Text(
                            opt,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isOptSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isOptSelected
                                  ? AppColors.primary
                                  : (isDark ? Colors.white70 : const Color(0xFF475569)),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 14),

              // Time Slot Selection Chips
              Text(
                'selectTimeSlot'.trOr(context, 'Select Time Slot'),
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white70 : const Color(0xFF475569),
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _timeSlots.map((slot) {
                  final isSlotSelected = activeSlot == slot;

                  return InkWell(
                    onTap: () {
                      controller.onIntent(SelectScheduleTimeSlotIntent(
                        date: state.scheduledDate ?? _selectedDate,
                        timeSlot: slot,
                      ));
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
                      decoration: BoxDecoration(
                        color: isSlotSelected
                            ? AppColors.primary.withValues(alpha: 0.14)
                            : subCardBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSlotSelected
                              ? AppColors.primary
                              : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0)),
                          width: isSlotSelected ? 1.5 : 1.0,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (isSlotSelected) ...[
                            const Icon(Icons.check_circle_rounded, size: 13, color: AppColors.primary),
                            const SizedBox(width: 4),
                          ],
                          Text(
                            slot,
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: isSlotSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSlotSelected
                                  ? AppColors.primary
                                  : (isDark ? Colors.white70 : const Color(0xFF475569)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 12),

              // Kitchen Fresh Prep Guarantee Notice
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFF3B82F6).withValues(alpha: 0.25),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.schedule_send_rounded, size: 16, color: Color(0xFF3B82F6)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'freshCookingGuarantee'.trOr(
                          context,
                          'Fresh cooking: Restaurant will prepare your order right before your scheduled slot.',
                        ),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF2563EB),
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
