import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/locale/translation_helper.dart';

class RiderCallSheet extends StatefulWidget {
  final String driverName;
  final String vehicleInfo;

  const RiderCallSheet({
    super.key,
    required this.driverName,
    required this.vehicleInfo,
  });

  static Future<void> show({
    required BuildContext context,
    required String driverName,
    required String vehicleInfo,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => RiderCallSheet(
        driverName: driverName,
        vehicleInfo: vehicleInfo,
      ),
    );
  }

  @override
  State<RiderCallSheet> createState() => _RiderCallSheetState();
}

class _RiderCallSheetState extends State<RiderCallSheet>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;
  Timer? _connectTimer;
  Timer? _callTimer;
  int _seconds = 0;
  bool _isConnected = false;
  bool _isMuted = false;
  bool _isSpeaker = false;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    // Simulate connecting after 2.5 seconds
    _connectTimer = Timer(const Duration(milliseconds: 2500), () {
      if (mounted) {
        setState(() {
          _isConnected = true;
        });
        _callTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
          if (mounted) {
            setState(() {
              _seconds++;
            });
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _connectTimer?.cancel();
    _callTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  String _formatDuration(int totalSeconds) {
    final mins = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final secs = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF131927) : const Color(0xFF1E293B);

    final statusText = _isConnected
        ? '${'callConnected'.trOr(context, 'Connected')} (${_formatDuration(_seconds)})'
        : 'callConnecting'.trOr(context, 'Calling Rider...');

    return Container(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 40),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.6),
            blurRadius: 30,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag handle
            Container(
              width: 44,
              height: 4.5,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            const SizedBox(height: 28),

            // Animated Pulsing Avatar
            AnimatedBuilder(
              animation: _pulseController,
              builder: (context, child) {
                return Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer Ripple
                    Container(
                      width: 120 + (_pulseController.value * 24),
                      height: 120 + (_pulseController.value * 24),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.primary.withValues(
                          alpha: 0.15 * (1 - _pulseController.value),
                        ),
                      ),
                    ),
                    // Inner Circle
                    Container(
                      width: 104,
                      height: 104,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.primary.withValues(alpha: 0.25),
                        border: Border.all(
                          color: AppColors.primary.withValues(alpha: 0.6),
                          width: 2,
                        ),
                      ),
                      child: const Center(
                        child: Text(
                          '🛵',
                          style: TextStyle(fontSize: 48),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),

            const SizedBox(height: 20),

            // Driver Name
            Text(
              widget.driverName,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.3,
              ),
            ),
            const SizedBox(height: 4),

            // Vehicle
            Text(
              widget.vehicleInfo,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 13.5,
              ),
            ),
            const SizedBox(height: 8),

            // Call Status
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
              decoration: BoxDecoration(
                color: _isConnected
                    ? const Color(0xFF10B981).withValues(alpha: 0.2)
                    : Colors.white10,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: _isConnected
                      ? const Color(0xFF10B981).withValues(alpha: 0.5)
                      : Colors.white24,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 7,
                    height: 7,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isConnected
                          ? const Color(0xFF10B981)
                          : const Color(0xFFF59E0B),
                    ),
                  ),
                  const SizedBox(width: 7),
                  Text(
                    statusText,
                    style: TextStyle(
                      color: _isConnected ? const Color(0xFF34D399) : Colors.white70,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 36),

            // In-Call Action Buttons (Mute, End, Speaker)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                // Mute Button
                _buildCallControl(
                  icon: _isMuted ? Icons.mic_off_rounded : Icons.mic_rounded,
                  label: 'mute'.trOr(context, 'Mute'),
                  isActive: _isMuted,
                  onTap: () => setState(() => _isMuted = !_isMuted),
                ),

                // End Call Button (Big Red)
                GestureDetector(
                  onTap: () => Get.back(),
                  child: Container(
                    width: 68,
                    height: 68,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFFEF4444),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFEF4444).withValues(alpha: 0.4),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.call_end_rounded,
                      color: Colors.white,
                      size: 32,
                    ),
                  ),
                ),

                // Speaker Button
                _buildCallControl(
                  icon: _isSpeaker ? Icons.volume_up_rounded : Icons.volume_down_rounded,
                  label: 'speaker'.trOr(context, 'Speaker'),
                  isActive: _isSpeaker,
                  onTap: () => setState(() => _isSpeaker = !_isSpeaker),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCallControl({
    required IconData icon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isActive ? Colors.white : Colors.white12,
            ),
            child: Icon(
              icon,
              color: isActive ? Colors.black87 : Colors.white,
              size: 22,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
