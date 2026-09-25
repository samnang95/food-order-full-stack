import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/locale/translation_helper.dart';

/// A beautiful map card showing the driver's real-time location,
/// restaurant, and delivery destination with an animated route.
class DeliveryMapCard extends StatefulWidget {
  final double? driverLat;
  final double? driverLng;
  final double? driverHeading;
  final double? restaurantLat;
  final double? restaurantLng;
  final double? deliveryLat;
  final double? deliveryLng;
  final int? estimatedEta;
  final double? progress;

  const DeliveryMapCard({
    super.key,
    this.driverLat,
    this.driverLng,
    this.driverHeading,
    this.restaurantLat,
    this.restaurantLng,
    this.deliveryLat,
    this.deliveryLng,
    this.estimatedEta,
    this.progress,
  });

  @override
  State<DeliveryMapCard> createState() => _DeliveryMapCardState();
}

class _DeliveryMapCardState extends State<DeliveryMapCard>
    with SingleTickerProviderStateMixin {
  late final MapController _mapController;
  late final AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _mapController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(DeliveryMapCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Center map on driver when position updates
    if (widget.driverLat != null &&
        widget.driverLng != null &&
        (widget.driverLat != oldWidget.driverLat ||
            widget.driverLng != oldWidget.driverLng)) {
      _fitMapBounds();
    }
  }

  void _fitMapBounds() {
    final points = <LatLng>[];
    if (widget.driverLat != null && widget.driverLng != null) {
      points.add(LatLng(widget.driverLat!, widget.driverLng!));
    }
    if (widget.restaurantLat != null && widget.restaurantLng != null) {
      points.add(LatLng(widget.restaurantLat!, widget.restaurantLng!));
    }
    if (widget.deliveryLat != null && widget.deliveryLng != null) {
      points.add(LatLng(widget.deliveryLat!, widget.deliveryLng!));
    }

    if (points.length >= 2) {
      try {
        final bounds = LatLngBounds.fromPoints(points);
        _mapController.fitCamera(
          CameraFit.bounds(
            bounds: bounds,
            padding: const EdgeInsets.all(50),
          ),
        );
      } catch (_) {}
    } else if (points.length == 1) {
      _mapController.move(points.first, 15);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;

    final hasDriverLocation = widget.driverLat != null && widget.driverLng != null;

    if (!hasDriverLocation) {
      return _buildWaitingCard(isDark, cardBg, borderColor);
    }

    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Map Header with ETA badge
          _buildMapHeader(isDark),

          // Map
          ClipRRect(
            borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(16),
              bottomRight: Radius.circular(16),
            ),
            child: SizedBox(
              height: 250,
              child: FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: LatLng(widget.driverLat!, widget.driverLng!),
                  initialZoom: 14,
                  interactionOptions: const InteractionOptions(
                    flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                  ),
                ),
                children: [
                  // Map Tiles (OpenStreetMap - FREE!)
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.example.food_order_app',
                  ),

                  // Route polyline
                  if (widget.restaurantLat != null && widget.deliveryLat != null)
                    PolylineLayer(
                      polylines: [
                        // Full route (light)
                        Polyline(
                          points: _buildRoutePoints(),
                          color: AppColors.primary.withValues(alpha: 0.3),
                          strokeWidth: 4,
                          pattern: const StrokePattern.dotted(),
                        ),
                        // Completed route (solid)
                        if (widget.driverLat != null)
                          Polyline(
                            points: _buildCompletedRoutePoints(),
                            color: AppColors.primary,
                            strokeWidth: 4,
                          ),
                      ],
                    ),

                  // Markers
                  MarkerLayer(
                    markers: _buildMarkers(),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapHeader(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E2638) : Colors.white,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: Row(
        children: [
          // Pulsing driver icon
          AnimatedBuilder(
            animation: _pulseController,
            builder: (context, child) {
              return Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(
                    alpha: 0.15 + (_pulseController.value * 0.1),
                  ),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.delivery_dining_rounded,
                  color: AppColors.primary,
                  size: 22,
                ),
              );
            },
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'onTheWay'.trOr(context, 'Driver is on the way'),
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: isDark ? Colors.white : const Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 2),
                if (widget.progress != null)
                  _buildProgressBar(),
              ],
            ),
          ),
          // ETA badge
          if (widget.estimatedEta != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, Color(0xFFFF6B35)],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.schedule_rounded, size: 14, color: Colors.white),
                  const SizedBox(width: 4),
                  Text(
                    '~${widget.estimatedEta} ${'mins'.trOr(context, 'min')}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildProgressBar() {
    return Container(
      margin: const EdgeInsets.only(top: 4),
      height: 4,
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(2),
      ),
      child: FractionallySizedBox(
        alignment: Alignment.centerLeft,
        widthFactor: widget.progress?.clamp(0.0, 1.0) ?? 0.0,
        child: Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, Color(0xFFFF6B35)],
            ),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      ),
    );
  }

  Widget _buildWaitingCard(bool isDark, Color cardBg, Color borderColor) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.location_searching_rounded,
              color: AppColors.primary,
              size: 24,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'locatingDriver'.trOr(context, 'Locating your driver...'),
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: isDark ? Colors.white : const Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'trackingWillAppear'.trOr(context, 'Live tracking will appear here shortly'),
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark ? Colors.white54 : const Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(
            width: 24,
            height: 24,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }

  List<LatLng> _buildRoutePoints() {
    final points = <LatLng>[];
    if (widget.restaurantLat != null && widget.restaurantLng != null) {
      points.add(LatLng(widget.restaurantLat!, widget.restaurantLng!));
    }
    if (widget.driverLat != null && widget.driverLng != null) {
      points.add(LatLng(widget.driverLat!, widget.driverLng!));
    }
    if (widget.deliveryLat != null && widget.deliveryLng != null) {
      points.add(LatLng(widget.deliveryLat!, widget.deliveryLng!));
    }
    return points;
  }

  List<LatLng> _buildCompletedRoutePoints() {
    final points = <LatLng>[];
    if (widget.restaurantLat != null && widget.restaurantLng != null) {
      points.add(LatLng(widget.restaurantLat!, widget.restaurantLng!));
    }
    if (widget.driverLat != null && widget.driverLng != null) {
      points.add(LatLng(widget.driverLat!, widget.driverLng!));
    }
    return points;
  }

  List<Marker> _buildMarkers() {
    final markers = <Marker>[];

    // Restaurant marker
    if (widget.restaurantLat != null && widget.restaurantLng != null) {
      markers.add(
        Marker(
          point: LatLng(widget.restaurantLat!, widget.restaurantLng!),
          width: 44,
          height: 44,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.2),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Center(
              child: Text('🍽️', style: TextStyle(fontSize: 22)),
            ),
          ),
        ),
      );
    }

    // Delivery destination marker
    if (widget.deliveryLat != null && widget.deliveryLng != null) {
      markers.add(
        Marker(
          point: LatLng(widget.deliveryLat!, widget.deliveryLng!),
          width: 44,
          height: 44,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.2),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Center(
              child: Text('🏠', style: TextStyle(fontSize: 22)),
            ),
          ),
        ),
      );
    }

    // Driver marker (with rotation for heading)
    if (widget.driverLat != null && widget.driverLng != null) {
      markers.add(
        Marker(
          point: LatLng(widget.driverLat!, widget.driverLng!),
          width: 52,
          height: 52,
          child: AnimatedBuilder(
            animation: _pulseController,
            builder: (context, child) {
              return Stack(
                alignment: Alignment.center,
                children: [
                  // Pulse ring
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(
                        alpha: 0.15 * (1 - _pulseController.value),
                      ),
                      shape: BoxShape.circle,
                    ),
                  ),
                  // Driver icon
                  Transform.rotate(
                    angle: ((widget.driverHeading ?? 0) * 3.14159265) / 180,
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primary, Color(0xFFFF6B35)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.4),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.delivery_dining_rounded,
                          color: Colors.white,
                          size: 22,
                        ),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      );
    }

    return markers;
  }
}
