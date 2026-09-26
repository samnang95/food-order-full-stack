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

class ApplyVoucherIntent extends CheckoutIntent {
  final String code;
  const ApplyVoucherIntent(this.code);
}

class RemoveVoucherIntent extends CheckoutIntent {
  const RemoveVoucherIntent();
}

class SelectSavedAddressIntent extends CheckoutIntent {
  final String addressId;
  const SelectSavedAddressIntent(this.addressId);
}

class SaveCurrentAddressIntent extends CheckoutIntent {
  final String label;
  final String? note;
  final bool setAsDefault;
  const SaveCurrentAddressIntent({
    required this.label,
    this.note,
    this.setAsDefault = false,
  });
}

class DeleteSavedAddressIntent extends CheckoutIntent {
  final String addressId;
  const DeleteSavedAddressIntent(this.addressId);
}

