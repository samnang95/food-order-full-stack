sealed class OrderDetailIntent {
  const OrderDetailIntent();
}

class RefreshOrderDetailIntent extends OrderDetailIntent {
  const RefreshOrderDetailIntent();
}

class CancelOrderIntent extends OrderDetailIntent {
  const CancelOrderIntent();
}

class ReorderItemsIntent extends OrderDetailIntent {
  const ReorderItemsIntent();
}

class SimulateDeliveryIntent extends OrderDetailIntent {
  const SimulateDeliveryIntent();
}
