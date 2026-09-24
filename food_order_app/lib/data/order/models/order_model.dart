import '../../../domain/order/entities/order_entity.dart';

class OrderItemModel {
  final String id;
  final String foodId;
  final String foodName;
  final String foodImageUrl;
  final double price;
  final int quantity;

  const OrderItemModel({
    required this.id,
    required this.foodId,
    required this.foodName,
    required this.foodImageUrl,
    required this.price,
    required this.quantity,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    String foodId = '';
    String foodName = 'Food Item';
    String foodImageUrl = '';
    double itemPrice = (json['price'] as num?)?.toDouble() ?? 0.0;

    final foodData = json['food'];
    if (foodData is Map<String, dynamic>) {
      foodId = foodData['_id'] as String? ?? foodData['id'] as String? ?? '';
      foodName = foodData['name'] as String? ?? 'Food Item';
      foodImageUrl = foodData['imageUrl'] as String? ?? '';
      if (itemPrice == 0.0 && foodData['price'] != null) {
        itemPrice = (foodData['price'] as num).toDouble();
      }
    } else if (foodData is String) {
      foodId = foodData;
    }

    return OrderItemModel(
      id: json['_id'] as String? ?? json['id'] as String? ?? '',
      foodId: foodId,
      foodName: foodName,
      foodImageUrl: foodImageUrl,
      price: itemPrice,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    '_id': id,
    'food': {
      '_id': foodId,
      'name': foodName,
      'imageUrl': foodImageUrl,
      'price': price,
    },
    'price': price,
    'quantity': quantity,
  };

  OrderItemEntity toEntity() {
    return OrderItemEntity(
      id: id,
      foodId: foodId,
      foodName: foodName,
      foodImageUrl: foodImageUrl,
      price: price,
      quantity: quantity,
    );
  }
}

class OrderModel {
  final String id;
  final String userId;
  final List<OrderItemModel> items;
  final double totalAmount;
  final String deliveryAddress;
  final String status;
  final String paymentMethod;
  final String paymentStatus;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const OrderModel({
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
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    String userId = '';
    final userData = json['user'];
    if (userData is Map<String, dynamic>) {
      userId = userData['_id'] as String? ?? userData['id'] as String? ?? '';
    } else if (userData is String) {
      userId = userData;
    }

    final rawItems = json['items'] as List<dynamic>? ?? [];
    final items = rawItems
        .whereType<Map<String, dynamic>>()
        .map((item) => OrderItemModel.fromJson(item))
        .toList();

    return OrderModel(
      id: json['_id'] as String? ?? json['id'] as String? ?? '',
      userId: userId,
      items: items,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      deliveryAddress: json['deliveryAddress'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      paymentMethod: json['paymentMethod'] as String? ?? 'cash',
      paymentStatus: json['paymentStatus'] as String? ?? 'pending',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    '_id': id,
    'user': userId,
    'items': items.map((i) => i.toJson()).toList(),
    'totalAmount': totalAmount,
    'deliveryAddress': deliveryAddress,
    'status': status,
    'paymentMethod': paymentMethod,
    'paymentStatus': paymentStatus,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt?.toIso8601String(),
  };

  OrderEntity toEntity() {
    return OrderEntity(
      id: id,
      userId: userId,
      items: items.map((i) => i.toEntity()).toList(),
      totalAmount: totalAmount,
      deliveryAddress: deliveryAddress,
      status: status,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
