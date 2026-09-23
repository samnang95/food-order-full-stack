sealed class CheckoutIntent {
  const CheckoutIntent();
}

class ChangeDeliveryAddress extends CheckoutIntent {
  final String address;
  const ChangeDeliveryAddress(this.address);
}

class ChangeDeliveryNote extends CheckoutIntent {
  final String note;
  const ChangeDeliveryNote(this.note);
}

class ChangePaymentMethod extends CheckoutIntent {
  final String method; // 'cash', 'khqr', 'card'
  const ChangePaymentMethod(this.method);
}

class SubmitOrder extends CheckoutIntent {
  const SubmitOrder();
}
