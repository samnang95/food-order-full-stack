sealed class CheckoutIntent {
  const CheckoutIntent();
}

class ChangeDeliveryAddress extends CheckoutIntent {
  final String address;
  const ChangeDeliveryAddress(this.address);
}

class ChangeDeliveryLocation extends CheckoutIntent {
  final String address;
  final double lat;
  final double lng;
  const ChangeDeliveryLocation({
    required this.address,
    required this.lat,
    required this.lng,
  });
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
