import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../domain/order/entities/order_entity.dart';

class _StepInfo {
  final String title;
  final String shortTitle;
  final String subtitle;
  final String calloutTitle;
  final String activeCallout;
  final IconData icon;
  final String markerLabel;

  const _StepInfo({
    required this.title,
    required this.shortTitle,
    required this.subtitle,
    required this.calloutTitle,
    required this.activeCallout,
    required this.icon,
    required this.markerLabel,
  });
}

class OrderTrackingStepper extends StatefulWidget {
  final OrderEntity order;
  final bool isCompact;

  const OrderTrackingStepper({
    super.key,
    required this.order,
    this.isCompact = false,
  });

  @override
  State<OrderTrackingStepper> createState() => _OrderTrackingStepperState();
}

class _OrderTrackingStepperState extends State<OrderTrackingStepper>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;

  static const List<_StepInfo> _steps = [
    _StepInfo(
      title: 'Order Placed',
      shortTitle: 'Placed',
      subtitle: 'Restaurant accepted',
      calloutTitle: 'Order Received & Confirmed',
      activeCallout: 'Order confirmed! Kitchen is prepping ingredients.',
      icon: Icons.receipt_long_rounded,
      markerLabel: 'Accepted',
    ),
    _StepInfo(
      title: 'Kitchen Preparing',
      shortTitle: 'Cooking',
      subtitle: 'Chef is cooking your meal',
      calloutTitle: 'Kitchen is Preparing',
      activeCallout: 'Chef is preparing your meal with fresh ingredients.',
      icon: Icons.soup_kitchen_rounded,
      markerLabel: 'Preparing',
    ),
    _StepInfo(
      title: 'On the Way',
      shortTitle: 'On Way',
      subtitle: 'Rider is heading to you',
      calloutTitle: 'Rider is on the Way',
      activeCallout: 'Rider is on the way! Fast delivery in progress.',
      icon: Icons.delivery_dining_rounded,
      markerLabel: 'Rider En Route',
    ),
    _StepInfo(
      title: 'Delivered',
      shortTitle: 'Delivered',
      subtitle: 'Enjoy your meal!',
      calloutTitle: 'Order Delivered',
      activeCallout: 'Order delivered successfully. Enjoy your delicious food!',
      icon: Icons.check_circle_rounded,
      markerLabel: 'Delivered',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );
    if (!Get.testMode) {
      _pulseController.repeat(reverse: true);
    } else {
      _pulseController.value = 1.0;
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  int get _currentStepIndex {
    switch (widget.order.status) {
      case 'pending':
        return 0;
      case 'preparing':
        return 1;
      case 'out_for_delivery':
        return 2;
      case 'delivered':
        return 3;
      default:
        return -1; // cancelled or unknown
    }
  }

  double get _targetProgress {
    switch (_currentStepIndex) {
      case 0:
        return 0.05;
      case 1:
        return 0.333;
      case 2:
        return 0.667;
      case 3:
        return 1.0;
      default:
        return 0.0;
    }
  }

  String get _etaBadgeText {
    if (widget.order.isCancelled) return 'Cancelled';
    if (widget.order.status == 'delivered') return 'Delivered';
    switch (widget.order.status) {
      case 'pending':
        return '25-35 mins';
      case 'preparing':
        return '20-30 mins';
      case 'out_for_delivery':
        return '10-15 mins';
      default:
        return '20-30 mins';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;

    if (widget.order.isCancelled) {
      return Container(
        padding: EdgeInsets.all(widget.isCompact ? 14 : 16),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF2C1A1A) : const Color(0xFFFEF2F2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: const Color(0xFFEF4444).withValues(alpha: 0.4),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.cancel_rounded,
                color: Color(0xFFEF4444),
                size: 26,
              ),
            ),
            const SizedBox(width: 14),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Order Cancelled',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFEF4444),
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'This order was cancelled and is no longer active.',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    final currentIndex = _currentStepIndex;
    final activeStep = currentIndex >= 0 && currentIndex < _steps.length
        ? _steps[currentIndex]
        : _steps[0];

    return Container(
      padding: EdgeInsets.all(widget.isCompact ? 14 : 18),
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
          // Header: Title + Live ETA Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    'Live Delivery Status',
                    style: TextStyle(
                      fontSize: widget.isCompact ? 14 : 15,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppColors.neutral,
                    ),
                  ),
                  if (widget.order.isActive) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.fiber_manual_record_rounded, size: 8, color: Color(0xFF10B981)),
                          SizedBox(width: 3),
                          Text(
                            'LIVE',
                            style: TextStyle(
                              color: Color(0xFF10B981),
                              fontSize: 9.5,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
              _buildEtaBadge(isDark),
            ],
          ),
          SizedBox(height: widget.isCompact ? 14 : 18),

          // Horizontal Progress Track with Scooter / Driver Marker
          _buildHorizontalProgressTrack(isDark, currentIndex),
          SizedBox(height: widget.isCompact ? 12 : 16),

          // Active Stage Callout Banner
          _buildActiveCalloutBanner(isDark, activeStep, currentIndex),

          // Full Mode: Vertical Timeline Breakdown
          if (!widget.isCompact) ...[
            const SizedBox(height: 16),
            Divider(color: borderColor, height: 1),
            const SizedBox(height: 16),
            _buildVerticalTimeline(isDark, currentIndex),
          ],
        ],
      ),
    );
  }

  Widget _buildEtaBadge(bool isDark) {
    final isDelivered = widget.order.status == 'delivered';
    final badgeColor = isDelivered ? const Color(0xFF10B981) : AppColors.primary;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
      decoration: BoxDecoration(
        color: badgeColor.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isDelivered ? Icons.check_circle_outline_rounded : Icons.timer_outlined,
            size: 13,
            color: badgeColor,
          ),
          const SizedBox(width: 4),
          Text(
            _etaBadgeText,
            style: TextStyle(
              color: badgeColor,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHorizontalProgressTrack(bool isDark, int currentIndex) {
    final nodeSize = widget.isCompact ? 28.0 : 32.0;

    return LayoutBuilder(
      builder: (context, constraints) {
        final totalWidth = constraints.maxWidth;
        final trackWidth = totalWidth - nodeSize;

        return TweenAnimationBuilder<double>(
          tween: Tween<double>(begin: 0.0, end: _targetProgress),
          duration: const Duration(milliseconds: 700),
          curve: Curves.easeOutCubic,
          builder: (context, animatedProgress, child) {
            final activeLineWidth = (trackWidth * animatedProgress).clamp(0.0, trackWidth);

            return Column(
              children: [
                // Floating Active Driver / Step Marker Pin
                if (currentIndex >= 0 && currentIndex < _steps.length) ...[
                  SizedBox(
                    height: 28,
                    child: Align(
                      alignment: Alignment(
                        (-1.0 + 2.0 * animatedProgress).clamp(-1.0, 1.0),
                        0.0,
                      ),
                      child: AnimatedBuilder(
                        animation: _pulseController,
                        builder: (context, child) {
                          final floatOffset = Get.testMode
                              ? 0.0
                              : -2.0 * (1 - _pulseController.value);
                          return Transform.translate(
                            offset: Offset(0, floatOffset),
                            child: _buildDriverMarkerBadge(currentIndex),
                          );
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 2),
                ],

                // Track Line & 4 Stage Circular Nodes
                SizedBox(
                  height: nodeSize,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Inactive Background Track Line
                      Positioned(
                        left: nodeSize / 2,
                        right: nodeSize / 2,
                        child: Container(
                          height: 4,
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE5E7EB),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),

                      // Animated Filled Gradient Progress Line
                      Positioned(
                        left: nodeSize / 2,
                        child: Container(
                          width: activeLineWidth,
                          height: 4,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF10B981), AppColors.primary],
                            ),
                            borderRadius: BorderRadius.circular(2),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.35),
                                blurRadius: 4,
                                offset: const Offset(0, 1),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // 4 Step Nodes
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: List.generate(_steps.length, (index) {
                          final isDone = index < currentIndex;
                          final isCurrent = index == currentIndex;
                          return _buildStepNode(
                            index: index,
                            isDone: isDone,
                            isCurrent: isCurrent,
                            nodeSize: nodeSize,
                            isDark: isDark,
                          );
                        }),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                // Stage Short Labels
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(_steps.length, (index) {
                    final step = _steps[index];
                    final isDone = index < currentIndex;
                    final isCurrent = index == currentIndex;

                    Color labelColor;
                    if (isCurrent) {
                      labelColor = AppColors.primary;
                    } else if (isDone) {
                      labelColor = const Color(0xFF10B981);
                    } else {
                      labelColor = isDark ? Colors.white54 : AppColors.subtitleColor;
                    }

                    return SizedBox(
                      width: totalWidth / 4.4,
                      child: Text(
                        step.shortTitle,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: widget.isCompact ? 10.5 : 11.5,
                          fontWeight: isCurrent
                              ? FontWeight.w800
                              : (isDone ? FontWeight.w700 : FontWeight.w500),
                          color: labelColor,
                        ),
                      ),
                    );
                  }),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildDriverMarkerBadge(int currentIndex) {
    final step = _steps[currentIndex];
    final isDelivered = currentIndex == 3;
    final isEnRoute = currentIndex == 2;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDelivered
              ? [const Color(0xFF10B981), const Color(0xFF059669)]
              : [const Color(0xFFFF7A00), AppColors.primary],
        ),
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: (isDelivered ? const Color(0xFF10B981) : AppColors.primary)
                .withValues(alpha: 0.35),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isEnRoute ? Icons.two_wheeler_rounded : step.icon,
            size: 12,
            color: Colors.white,
          ),
          const SizedBox(width: 4),
          Text(
            step.markerLabel,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 9.5,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepNode({
    required int index,
    required bool isDone,
    required bool isCurrent,
    required double nodeSize,
    required bool isDark,
  }) {
    final step = _steps[index];

    Color nodeBg;
    Color iconColor;
    Border? border;
    List<BoxShadow>? shadows;

    if (isDone) {
      nodeBg = const Color(0xFF10B981);
      iconColor = Colors.white;
      border = Border.all(color: const Color(0xFF10B981), width: 2);
      shadows = [
        BoxShadow(
          color: const Color(0xFF10B981).withValues(alpha: 0.3),
          blurRadius: 6,
          offset: const Offset(0, 2),
        ),
      ];
    } else if (isCurrent) {
      nodeBg = AppColors.primary;
      iconColor = Colors.white;
      border = Border.all(
        color: isDark ? const Color(0xFF1E2638) : Colors.white,
        width: 2.5,
      );
      shadows = [
        BoxShadow(
          color: AppColors.primary.withValues(alpha: 0.45),
          blurRadius: 8,
          spreadRadius: 1,
          offset: const Offset(0, 2),
        ),
      ];
    } else {
      nodeBg = isDark ? const Color(0xFF161C2C) : const Color(0xFFF3F4F6);
      iconColor = isDark ? Colors.white38 : Colors.black38;
      border = Border.all(
        color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0),
        width: 1.5,
      );
    }

    return Container(
      width: nodeSize,
      height: nodeSize,
      decoration: BoxDecoration(
        color: nodeBg,
        shape: BoxShape.circle,
        border: border,
        boxShadow: shadows,
      ),
      child: Center(
        child: Icon(
          isDone ? Icons.check_rounded : step.icon,
          color: iconColor,
          size: nodeSize * 0.52,
        ),
      ),
    );
  }

  Widget _buildActiveCalloutBanner(
    bool isDark,
    _StepInfo activeStep,
    int currentIndex,
  ) {
    final isDelivered = currentIndex == 3;
    final bannerColor = isDelivered ? const Color(0xFF10B981) : AppColors.primary;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: widget.isCompact ? 12 : 14,
        vertical: widget.isCompact ? 9 : 11,
      ),
      decoration: BoxDecoration(
        color: bannerColor.withValues(alpha: isDark ? 0.15 : 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: bannerColor.withValues(alpha: isDark ? 0.3 : 0.18),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: bannerColor.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(
              currentIndex == 2 ? Icons.two_wheeler_rounded : activeStep.icon,
              size: widget.isCompact ? 16 : 18,
              color: bannerColor,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  activeStep.calloutTitle,
                  style: TextStyle(
                    fontSize: widget.isCompact ? 12.5 : 13.5,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : AppColors.neutral,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  activeStep.activeCallout,
                  style: TextStyle(
                    fontSize: widget.isCompact ? 11 : 11.5,
                    color: isDark ? Colors.white70 : AppColors.subtitleColor,
                  ),
                ),
              ],
            ),
          ),
          if (widget.order.isActive)
            Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: Color(0xFF10B981),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Color(0xFF10B981),
                    blurRadius: 4,
                    spreadRadius: 1,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildVerticalTimeline(bool isDark, int currentIndex) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _steps.length,
      itemBuilder: (context, index) {
        final step = _steps[index];
        final isDone = index < currentIndex;
        final isCurrent = index == currentIndex;
        final isLast = index == _steps.length - 1;

        Color stepColor;
        if (isDone) {
          stepColor = const Color(0xFF10B981); // Emerald
        } else if (isCurrent) {
          stepColor = AppColors.primary; // Brand orange
        } else {
          stepColor = isDark ? Colors.white24 : Colors.black26;
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: isDone || isCurrent
                        ? stepColor
                        : (isDark ? const Color(0xFF161C2C) : const Color(0xFFF3F4F6)),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: stepColor,
                      width: 2,
                    ),
                    boxShadow: isCurrent
                        ? [
                            BoxShadow(
                              color: stepColor.withValues(alpha: 0.4),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Icon(
                    isDone
                        ? Icons.check_rounded
                        : step.icon,
                    color: isDone || isCurrent
                        ? Colors.white
                        : (isDark ? Colors.white38 : Colors.black38),
                    size: 16,
                  ),
                ),
                if (!isLast)
                  Container(
                    width: 2,
                    height: 32,
                    color: isDone
                        ? const Color(0xFF10B981)
                        : (isDark ? Colors.white12 : Colors.black12),
                  ),
              ],
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 4, bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      step.title,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: isCurrent
                            ? FontWeight.w800
                            : (isDone ? FontWeight.w700 : FontWeight.w500),
                        color: isCurrent
                            ? AppColors.primary
                            : (isDark
                                ? (isDone ? Colors.white : Colors.white54)
                                : (isDone ? AppColors.neutral : Colors.black45)),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      step.subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white54 : AppColors.subtitleColor,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
