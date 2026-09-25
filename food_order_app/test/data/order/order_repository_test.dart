import 'package:flutter_test/flutter_test.dart';
import 'package:food_order_app/data/order/datasources/order_remote_datasource.dart';
import 'package:food_order_app/data/order/models/order_model.dart';
import 'package:food_order_app/data/order/repositories/order_repository_impl.dart';

class FakeOrderRemoteDataSource implements OrderRemoteDataSource {
  OrderModel? modelToReturn;
  List<OrderModel> listToReturn = [];

  @override
  Future<OrderModel> placeOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String paymentMethod,
    double? deliveryLat,
    double? deliveryLng,
  }) async {
    return modelToReturn!;
  }

  @override
  Future<List<OrderModel>> getMyOrders() async {
    return listToReturn;
  }

  @override
  Future<OrderModel> getOrderById(String orderId) async {
    return modelToReturn!;
  }

  @override
  Future<OrderModel> cancelOrder(String orderId) async {
    return modelToReturn!;
  }
}

void main() {
  group('OrderModel JSON serialization', () {
    test('Correctly parses populated food item from MongoDB response', () {
      final json = {
        '_id': 'order_12345678',
        'user': {
          '_id': 'user_abc',
          'username': 'foodie',
          'email': 'foodie@test.com',
        },
        'items': [
          {
            '_id': 'item_1',
            'food': {
              '_id': 'food_999',
              'name': 'Double Cheese Burger',
              'imageUrl': 'http://image.png',
              'price': 14.50,
            },
            'quantity': 2,
            'price': 14.50,
          },
        ],
        'totalAmount': 29.00,
        'deliveryAddress': 'Street 271, Phnom Penh',
        'status': 'preparing',
        'paymentMethod': 'khqr',
        'paymentStatus': 'completed',
        'createdAt': '2026-09-23T12:00:00.000Z',
      };

      final model = OrderModel.fromJson(json);
      final entity = model.toEntity();

      expect(entity.id, 'order_12345678');
      expect(entity.shortId, '#BC-5678');
      expect(entity.userId, 'user_abc');
      expect(entity.items.length, 1);
      expect(entity.items.first.foodId, 'food_999');
      expect(entity.items.first.foodName, 'Double Cheese Burger');
      expect(entity.items.first.price, 14.50);
      expect(entity.items.first.quantity, 2);
      expect(entity.items.first.totalPrice, 29.00);
      expect(entity.status, 'preparing');
      expect(entity.statusLabel, 'Kitchen Preparing');
      expect(entity.isActive, true);
      expect(entity.paymentMethod, 'khqr');
      expect(entity.itemsSummary, '2x Double Cheese Burger');
      expect(entity.totalItemCount, 2);
    });

    test('Correctly parses unpopulated food ID string', () {
      final json = {
        '_id': 'order_simple',
        'user': 'user_id_only',
        'items': [
          {
            '_id': 'item_2',
            'food': 'food_id_raw',
            'quantity': 1,
            'price': 5.00,
          },
        ],
        'totalAmount': 5.00,
        'deliveryAddress': 'Street 10',
        'status': 'delivered',
        'paymentMethod': 'cash',
        'paymentStatus': 'pending',
        'createdAt': '2026-09-22T08:00:00.000Z',
      };

      final model = OrderModel.fromJson(json);
      final entity = model.toEntity();

      expect(entity.id, 'order_simple');
      expect(entity.userId, 'user_id_only');
      expect(entity.items.first.foodId, 'food_id_raw');
      expect(entity.status, 'delivered');
      expect(entity.statusLabel, 'Delivered');
      expect(entity.isActive, false);
      expect(entity.isDelivered, true);
    });
  });

  group('OrderRepositoryImpl', () {
    late FakeOrderRemoteDataSource fakeDataSource;
    late OrderRepositoryImpl repository;

    setUp(() {
      fakeDataSource = FakeOrderRemoteDataSource();
      repository = OrderRepositoryImpl(remoteDataSource: fakeDataSource);
    });

    test('placeOrder delegates to dataSource and returns OrderEntity', () async {
      fakeDataSource.modelToReturn = OrderModel(
        id: 'ord_1',
        userId: 'u_1',
        items: const [
          OrderItemModel(
            id: 'item_1',
            foodId: 'f_1',
            foodName: 'Pizza',
            foodImageUrl: '',
            price: 15.0,
            quantity: 1,
          ),
        ],
        totalAmount: 15.0,
        deliveryAddress: 'Home',
        status: 'pending',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        createdAt: DateTime.now(),
      );

      final order = await repository.placeOrder(
        items: [{'food': 'f_1', 'quantity': 1}],
        deliveryAddress: 'Home',
        paymentMethod: 'cash',
      );

      expect(order.id, 'ord_1');
      expect(order.items.first.foodName, 'Pizza');
      expect(order.totalAmount, 15.0);
    });

    test('getMyOrders delegates to dataSource and returns list of entities', () async {
      fakeDataSource.listToReturn = [
        OrderModel(
          id: 'ord_1',
          userId: 'u_1',
          items: const [],
          totalAmount: 10.0,
          deliveryAddress: 'Home',
          status: 'delivered',
          paymentMethod: 'cash',
          paymentStatus: 'completed',
          createdAt: DateTime.now(),
        ),
      ];

      final orders = await repository.getMyOrders();
      expect(orders.length, 1);
      expect(orders.first.id, 'ord_1');
    });

    test('cancelOrder delegates to dataSource and returns updated OrderEntity', () async {
      fakeDataSource.modelToReturn = OrderModel(
        id: 'ord_cancel',
        userId: 'u_1',
        items: const [],
        totalAmount: 10.0,
        deliveryAddress: 'Home',
        status: 'cancelled',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        createdAt: DateTime.now(),
      );

      final order = await repository.cancelOrder('ord_cancel');
      expect(order.id, 'ord_cancel');
      expect(order.status, 'cancelled');
      expect(order.isCancelled, true);
    });
  });
}
