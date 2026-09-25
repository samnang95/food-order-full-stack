import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:get/get.dart';
import 'package:latlong2/latlong.dart';
import '../../../../core/constants/app_colors.dart';

class LocationPreset {
  final String label;
  final String icon;
  final String address;
  final double lat;
  final double lng;

  const LocationPreset({
    required this.label,
    required this.icon,
    required this.address,
    required this.lat,
    required this.lng,
  });
}

const List<LocationPreset> kPhnomPenhPresets = [
  LocationPreset(
    label: 'Russian Market',
    icon: '🛍️',
    address: 'Street 271, Boeng Tumpun, Phnom Penh',
    lat: 11.5385,
    lng: 104.9080,
  ),
  LocationPreset(
    label: 'BKK1 Area',
    icon: '🏢',
    address: 'Street 306, Boeung Keng Kang 1, Phnom Penh',
    lat: 11.5529,
    lng: 104.9282,
  ),
  LocationPreset(
    label: 'Central Market',
    icon: '🏛️',
    address: 'Street 130, Phsar Thmei, Phnom Penh',
    lat: 11.5694,
    lng: 104.9215,
  ),
  LocationPreset(
    label: 'Riverside Quay',
    icon: '🌊',
    address: 'Sisowath Quay, Riverside, Phnom Penh',
    lat: 11.5690,
    lng: 104.9355,
  ),
  LocationPreset(
    label: 'Toul Kork',
    icon: '🏘️',
    address: 'Street 315, Toul Kork, Phnom Penh',
    lat: 11.5794,
    lng: 104.8970,
  ),
  LocationPreset(
    label: 'Koh Pich',
    icon: '🏙️',
    address: 'Elite Town, Diamond Island (Koh Pich), Phnom Penh',
    lat: 11.5478,
    lng: 104.9388,
  ),
];

class LocationPickerSheet extends StatefulWidget {
  final String initialAddress;
  final double initialLat;
  final double initialLng;
  final void Function(String address, double lat, double lng) onConfirm;

  const LocationPickerSheet({
    super.key,
    required this.initialAddress,
    required this.initialLat,
    required this.initialLng,
    required this.onConfirm,
  });

  static Future<void> show({
    required BuildContext context,
    required String initialAddress,
    required double initialLat,
    required double initialLng,
    required void Function(String address, double lat, double lng) onConfirm,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => LocationPickerSheet(
        initialAddress: initialAddress,
        initialLat: initialLat,
        initialLng: initialLng,
        onConfirm: onConfirm,
      ),
    );
  }

  @override
  State<LocationPickerSheet> createState() => _LocationPickerSheetState();
}

class _LocationPickerSheetState extends State<LocationPickerSheet> {
  late final MapController _mapController;
  late final TextEditingController _addressController;
  late double _selectedLat;
  late double _selectedLng;
  double _currentZoom = 15.0;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _selectedLat = widget.initialLat;
    _selectedLng = widget.initialLng;
    _addressController = TextEditingController(text: widget.initialAddress);
  }

  @override
  void dispose() {
    _addressController.dispose();
    _mapController.dispose();
    super.dispose();
  }

  void _onPresetSelected(LocationPreset preset) {
    setState(() {
      _selectedLat = preset.lat;
      _selectedLng = preset.lng;
      _addressController.text = preset.address;
    });
    _mapController.move(LatLng(preset.lat, preset.lng), 15.5);
  }

  void _onMapTapped(TapPosition _, LatLng point) {
    setState(() {
      _selectedLat = point.latitude;
      _selectedLng = point.longitude;
    });
  }

  void _zoomIn() {
    _currentZoom = (_currentZoom + 1).clamp(3.0, 18.0);
    _mapController.move(LatLng(_selectedLat, _selectedLng), _currentZoom);
  }

  void _zoomOut() {
    _currentZoom = (_currentZoom - 1).clamp(3.0, 18.0);
    _mapController.move(LatLng(_selectedLat, _selectedLng), _currentZoom);
  }

  void _recenter() {
    _mapController.move(LatLng(_selectedLat, _selectedLng), 15.5);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF141A29) : Colors.white;
    final cardBg = isDark ? const Color(0xFF1E2638) : const Color(0xFFF8FAFC);
    final borderColor = isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0);

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.6 : 0.2),
            blurRadius: 24,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 8),
              width: 44,
              height: 4.5,
              decoration: BoxDecoration(
                color: isDark ? Colors.white24 : Colors.black12,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
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
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Set Delivery Location',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : const Color(0xFF1E293B),
                        ),
                      ),
                      Text(
                        'Tap map or select a popular area in Phnom Penh',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.white54 : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Get.back(),
                  icon: const Icon(Icons.close_rounded),
                  color: isDark ? Colors.white70 : Colors.black54,
                ),
              ],
            ),
          ),

          // Quick Presets
          SizedBox(
            height: 42,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: kPhnomPenhPresets.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final preset = kPhnomPenhPresets[index];
                final isSelected = (_selectedLat - preset.lat).abs() < 0.005 &&
                    (_selectedLng - preset.lng).abs() < 0.005;

                return GestureDetector(
                  onTap: () => _onPresetSelected(preset),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary
                          : (isDark ? const Color(0xFF1E2638) : const Color(0xFFF1F5F9)),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primary
                            : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0)),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(preset.icon, style: const TextStyle(fontSize: 13)),
                        const SizedBox(width: 6),
                        Text(
                          preset.label,
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected
                                ? Colors.white
                                : (isDark ? Colors.white70 : const Color(0xFF334155)),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 12),

          // Interactive Map Area
          Expanded(
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: FlutterMap(
                    mapController: _mapController,
                    options: MapOptions(
                      initialCenter: LatLng(_selectedLat, _selectedLng),
                      initialZoom: _currentZoom,
                      onTap: _onMapTapped,
                      interactionOptions: const InteractionOptions(
                        flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
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
                            point: LatLng(_selectedLat, _selectedLng),
                            width: 60,
                            height: 60,
                            alignment: Alignment.topCenter,
                            child: _buildPinMarker(),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Floating Map Controls (Zoom +, Zoom -, Recenter)
                Positioned(
                  right: 16,
                  bottom: 16,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildMapButton(
                        icon: Icons.my_location_rounded,
                        onTap: _recenter,
                        isDark: isDark,
                        tooltip: 'Recenter Pin',
                      ),
                      const SizedBox(height: 8),
                      _buildMapButton(
                        icon: Icons.add_rounded,
                        onTap: _zoomIn,
                        isDark: isDark,
                        tooltip: 'Zoom In',
                      ),
                      const SizedBox(height: 8),
                      _buildMapButton(
                        icon: Icons.remove_rounded,
                        onTap: _zoomOut,
                        isDark: isDark,
                        tooltip: 'Zoom Out',
                      ),
                    ],
                  ),
                ),

                // Map Hint Pill
                Positioned(
                  top: 12,
                  left: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: (isDark ? Colors.black : Colors.white).withValues(alpha: 0.85),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.touch_app_rounded, size: 14, color: AppColors.primary),
                        const SizedBox(width: 5),
                        Text(
                          'Tap anywhere to move pin',
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white70 : const Color(0xFF475569),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Bottom Address Card & Confirm Action
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            decoration: BoxDecoration(
              color: cardBg,
              border: Border(top: BorderSide(color: borderColor)),
            ),
            child: SafeArea(
              top: false,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.edit_location_alt_rounded, size: 16, color: AppColors.primary),
                      const SizedBox(width: 6),
                      Text(
                        'Delivery Address Details',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : const Color(0xFF1E293B),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '${_selectedLat.toStringAsFixed(4)}, ${_selectedLng.toStringAsFixed(4)}',
                        style: TextStyle(
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: isDark ? Colors.white38 : Colors.black45,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _addressController,
                    maxLines: 2,
                    minLines: 1,
                    style: TextStyle(
                      fontSize: 13.5,
                      color: isDark ? Colors.white : const Color(0xFF1E293B),
                    ),
                    decoration: InputDecoration(
                      hintText: 'Enter street, house number, area...',
                      hintStyle: TextStyle(
                        fontSize: 12.5,
                        color: isDark ? Colors.white38 : Colors.black38,
                      ),
                      filled: true,
                      fillColor: isDark ? const Color(0xFF141A29) : Colors.white,
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
                        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        final addressText = _addressController.text.trim();
                        final finalAddress = addressText.isNotEmpty
                            ? addressText
                            : widget.initialAddress;
                        widget.onConfirm(finalAddress, _selectedLat, _selectedLng);
                        Get.back();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 0,
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.check_circle_rounded, size: 18),
                          SizedBox(width: 8),
                          Text(
                            'Confirm Delivery Location',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPinMarker() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(7),
          decoration: BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2.5),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.4),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(
            Icons.delivery_dining_rounded,
            color: Colors.white,
            size: 20,
          ),
        ),
        Container(
          width: 3,
          height: 8,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        Container(
          width: 8,
          height: 3,
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(4),
          ),
        ),
      ],
    );
  }

  Widget _buildMapButton({
    required IconData icon,
    required VoidCallback onTap,
    required bool isDark,
    required String tooltip,
  }) {
    return Material(
      color: isDark ? const Color(0xFF1E2638) : Colors.white,
      borderRadius: BorderRadius.circular(10),
      elevation: 3,
      shadowColor: Colors.black.withValues(alpha: 0.25),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          width: 38,
          height: 38,
          alignment: Alignment.center,
          child: Icon(
            icon,
            size: 20,
            color: isDark ? Colors.white70 : const Color(0xFF334155),
          ),
        ),
      ),
    );
  }
}
