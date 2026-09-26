import 'package:flutter/material.dart';

class SavedAddressEntity {
  final String id;
  final String label; // 'Home', 'Work', 'Other', etc.
  final String address;
  final double lat;
  final double lng;
  final String note;
  final bool isDefault;

  const SavedAddressEntity({
    required this.id,
    required this.label,
    required this.address,
    required this.lat,
    required this.lng,
    this.note = '',
    this.isDefault = false,
  });

  IconData get icon {
    switch (label.toLowerCase()) {
      case 'home':
        return Icons.home_rounded;
      case 'work':
      case 'office':
        return Icons.business_center_rounded;
      case 'partner':
      case 'family':
        return Icons.favorite_rounded;
      case 'gym':
        return Icons.fitness_center_rounded;
      default:
        return Icons.location_on_rounded;
    }
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'label': label,
        'address': address,
        'lat': lat,
        'lng': lng,
        'note': note,
        'isDefault': isDefault,
      };

  factory SavedAddressEntity.fromJson(Map<String, dynamic> json) {
    return SavedAddressEntity(
      id: json['id'] as String? ?? '',
      label: json['label'] as String? ?? 'Other',
      address: json['address'] as String? ?? '',
      lat: (json['lat'] as num?)?.toDouble() ?? 11.5385,
      lng: (json['lng'] as num?)?.toDouble() ?? 104.9080,
      note: json['note'] as String? ?? '',
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }

  SavedAddressEntity copyWith({
    String? id,
    String? label,
    String? address,
    double? lat,
    double? lng,
    String? note,
    bool? isDefault,
  }) {
    return SavedAddressEntity(
      id: id ?? this.id,
      label: label ?? this.label,
      address: address ?? this.address,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      note: note ?? this.note,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}
