sealed class OrderDetailIntent {
  const OrderDetailIntent();
}

class RefreshOrderDetailIntent extends OrderDetailIntent {
  const RefreshOrderDetailIntent();
}

class CancelOrderIntent extends OrderDetailIntent {
  final String? reason;
  const CancelOrderIntent([this.reason]);
}

class ConfirmCancelOrderIntent extends OrderDetailIntent {
  final String reason;
  const ConfirmCancelOrderIntent({this.reason = 'Changed mind'});
}

class ReorderItemsIntent extends OrderDetailIntent {
  const ReorderItemsIntent();
}

class SimulateDeliveryIntent extends OrderDetailIntent {
  const SimulateDeliveryIntent();
}
