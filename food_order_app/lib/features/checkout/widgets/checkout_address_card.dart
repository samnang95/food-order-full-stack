import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:get/get.dart';
import 'package:latlong2/latlong.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/locale/translation_helper.dart';
import '../checkout_intent.dart';
import '../checkout_store.dart';
import 'location_picker_sheet.dart';

class CheckoutAddressCard extends GetView<CheckoutStore> {
  const CheckoutAddressCard({super.key});

  void _openLocationPicker(BuildContext context, String currentAddress, double currentLat, double currentLng) {
    LocationPickerSheet.show(
      context: context,
      initialAddress: currentAddress,
      initialLat: currentLat,
      initialLng: currentLng,
      onConfirm: (newAddress, newLat, newLng) {
        controller.onIntent(ChangeDeliveryLocation(
          address: newAddress,
          lat: newLat,
          lng: newLng,
        ));
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;

    return Obx(() {
      final state = controller.state.value;
      final address = state.deliveryAddress;
      final lat = state.deliveryLat;
      final lng = state.deliveryLng;

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
            // Header: Title & Change Action
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'deliveryAddress'.trOr(context, 'Delivery Address'),
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : AppColors.neutral,
                        ),
                      ),
                      Text(
                        'liveTrackingSub'.trOr(context, 'Live tracking will deliver here'),
                        style: TextStyle(
                          fontSize: 11.5,
                          color: isDark ? Colors.white54 : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                TextButton.icon(
                  onPressed: () => _openLocationPicker(context, address, lat, lng),
                  icon: const Icon(Icons.edit_location_alt_outlined, size: 15),
                  label: Text(
                    'changePin'.trOr(context, 'Change Pin'),
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    visualDensity: VisualDensity.compact,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Mini Map Preview (Tappable to pick location)
            GestureDetector(
              onTap: () => _openLocationPicker(context, address, lat, lng),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  height: 130,
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0),
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Stack(
                    children: [
                      // Mini Map
                      AbsorbPointer(
                        absorbing: true,
                        child: FlutterMap(
                          options: MapOptions(
                            initialCenter: LatLng(lat, lng),
                            initialZoom: 15,
                            interactionOptions: const InteractionOptions(
                              flags: InteractiveFlag.none,
                            ),
                          ),
                          children: [
                            TileLayer(
                              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                              userAgentPackageName: 'com.example.food_order_app',
                            ),
                            MarkerLayer(
                              markers: [
                                Marker(
                                  point: LatLng(lat, lng),
                                  width: 48,
                                  height: 48,
                                  alignment: Alignment.topCenter,
                                  child: _buildMiniPinMarker(),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      // Overlay Gradient at bottom
                      Positioned(
                        left: 0,
                        right: 0,
                        bottom: 0,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.bottomCenter,
                              end: Alignment.topCenter,
                              colors: [
                                (isDark ? Colors.black : Colors.black87),
                                Colors.transparent,
                              ],
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.touch_app_rounded, size: 13, color: Colors.white),
                                  const SizedBox(width: 5),
                                  Text(
                                    'tapMapToChange'.trOr(context, 'Tap map to change location'),
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                              const Icon(Icons.open_in_full_rounded, size: 13, color: Colors.white70),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Address Text & Pin Coordinates Badge
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    address,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : const Color(0xFF1E293B),
                      height: 1.4,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF141A29) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: Text(
                    '${lat.toStringAsFixed(3)}, ${lng.toStringAsFixed(3)}',
                    style: TextStyle(
                      fontSize: 10,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.white60 : const Color(0xFF64748B),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // Note for Rider Input
            TextField(
              onChanged: (val) => controller.onIntent(ChangeDeliveryNote(val)),
              decoration: InputDecoration(
                hintText: 'noteForRider'.trOr(
                  context,
                  'Note for rider (e.g. Call upon arrival, 2nd floor)',
                ),
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
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: borderColor),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: borderColor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.primary),
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildMiniPinMarker() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.5),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: const Icon(
            Icons.location_pin,
            color: Colors.white,
            size: 16,
          ),
        ),
        Container(
          width: 2,
          height: 6,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(1),
          ),
        ),
      ],
    );
  }
}
