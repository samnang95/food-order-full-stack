import 'package:flutter/material.dart';

class OrderItemEntity {
  final String id;
  final String foodId;
  final String foodName;
  final String foodImageUrl;
  final double price;
  final int quantity;

  const OrderItemEntity({
    required this.id,
    required this.foodId,
    required this.foodName,
    required this.foodImageUrl,
    required this.price,
    required this.quantity,
  });

  double get totalPrice => price * quantity;

  Map<String, dynamic> toJson() => {
        'id': id,
        'foodId': foodId,
        'foodName': foodName,
        'foodImageUrl': foodImageUrl,
        'price': price,
        'quantity': quantity,
      };

  factory OrderItemEntity.fromJson(Map<String, dynamic> json) {
    return OrderItemEntity(
      id: json['id'] as String? ?? json['_id'] as String? ?? '',
      foodId: json['foodId'] as String? ?? '',
      foodName: json['foodName'] as String? ?? 'Food Item',
      foodImageUrl: json['foodImageUrl'] as String? ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
    );
  }
}

class OrderEntity {
  final String id;
  final String userId;
  final List<OrderItemEntity> items;
  final double totalAmount;
  final String deliveryAddress;
  final String status;
  final String paymentMethod;
  final String paymentStatus;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final double? deliveryLat;
  final double? deliveryLng;
  final double? restaurantLat;
  final double? restaurantLng;

  const OrderEntity({
    required this.id,
    required this.userId,
    required this.items,
    required this.totalAmount,
    required this.deliveryAddress,
    required this.status,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.createdAt,
    this.updatedAt,
    this.deliveryLat,
    this.deliveryLng,
    this.restaurantLat,
    this.restaurantLng,
  });

  factory OrderEntity.placeholder(String orderId) {
    return OrderEntity(
      id: orderId,
      userId: '',
      items: const [],
      totalAmount: 0.0,
      deliveryAddress: '',
      status: 'pending',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      createdAt: DateTime.now(),
    );
  }

  String get shortId {
    if (id.length >= 4) {
      final sub = id.substring(id.length - 4).toUpperCase();
      return '#BC-$sub';
    }
    return '#BC-$id';
  }

  bool get isActive =>
      status == 'pending' || status == 'preparing' || status == 'out_for_delivery';

  bool get isDelivered => status == 'delivered';

  bool get isCancelled => status == 'cancelled';

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'preparing':
        return 'Kitchen Preparing';
      case 'out_for_delivery':
        return 'On the way';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.toUpperCase();
    }
  }

  Color get statusColor {
    switch (status) {
      case 'pending':
        return const Color(0xFFF59E0B); // Amber
      case 'preparing':
        return const Color(0xFF3B82F6); // Blue
      case 'out_for_delivery':
        return const Color(0xFFF97316); // Brand Orange
      case 'delivered':
        return const Color(0xFF10B981); // Emerald Green
      case 'cancelled':
        return const Color(0xFFEF4444); // Red
      default:
        return const Color(0xFF6B7280);
    }
  }

  int get totalItemCount => items.fold(0, (sum, item) => sum + item.quantity);

  String get itemsSummary {
    if (items.isEmpty) return 'No items';
    return items.map((i) => '${i.quantity}x ${i.foodName}').join(', ');
  }

  String get formattedDate {
    final now = DateTime.now();
    final diff = now.difference(createdAt);

    final hour = createdAt.hour.toString().padLeft(2, '0');
    final minute = createdAt.minute.toString().padLeft(2, '0');

    if (diff.inDays == 0 && now.day == createdAt.day) {
      return 'Today, $hour:$minute';
    } else if (diff.inDays <= 1) {
      return 'Yesterday, $hour:$minute';
    } else {
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      final month = months[createdAt.month - 1];
      return '${createdAt.day} $month ${createdAt.year}';
    }
  }
}
