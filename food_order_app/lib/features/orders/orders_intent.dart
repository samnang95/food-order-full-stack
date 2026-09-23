sealed class OrdersIntent {
  const OrdersIntent();
}

class FetchOrdersIntent extends OrdersIntent {
  const FetchOrdersIntent();
}

class ChangeOrdersFilterIntent extends OrdersIntent {
  final int filterIndex; // 0: All, 1: Active, 2: Completed
  const ChangeOrdersFilterIntent(this.filterIndex);
}
