import '../../domain/order/entities/order_entity.dart';

sealed class OrdersIntent {
  const OrdersIntent();
}

class FetchOrdersIntent extends OrdersIntent {
  const FetchOrdersIntent();
}

class ChangeOrdersFilterIntent extends OrdersIntent {
  final int filterIndex; // 0: All, 1: Active, 2: Completed, 3: Cancelled
  const ChangeOrdersFilterIntent(this.filterIndex);
}

class OrdersScrollChangedIntent extends OrdersIntent {
  final bool isScrolled;
  const OrdersScrollChangedIntent(this.isScrolled);
}

class ReorderOrderIntent extends OrdersIntent {
  final OrderEntity order;
  const ReorderOrderIntent(this.order);
}
