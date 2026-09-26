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

class ToggleCutleryIntent extends CheckoutIntent {
  final bool requestCutlery;
  const ToggleCutleryIntent(this.requestCutlery);
}

class UpdateCutleryCountIntent extends CheckoutIntent {
  final int count;
  const UpdateCutleryCountIntent(this.count);
}

class ChangeKitchenNoteIntent extends CheckoutIntent {
  final String note;
  const ChangeKitchenNoteIntent(this.note);
}

class ToggleKitchenPreferenceIntent extends CheckoutIntent {
  final String preference;
  const ToggleKitchenPreferenceIntent(this.preference);
}

class ToggleCondimentIntent extends CheckoutIntent {
  final String condiment;
  const ToggleCondimentIntent(this.condiment);
}

class SelectTipIntent extends CheckoutIntent {
  final double amount;
  const SelectTipIntent(this.amount);
}

class ClearTipIntent extends CheckoutIntent {
  const ClearTipIntent();
}

class SelectDeliveryModeIntent extends CheckoutIntent {
  final bool isScheduled;
  const SelectDeliveryModeIntent({required this.isScheduled});
}

class SelectScheduleTimeSlotIntent extends CheckoutIntent {
  final String date;
  final String timeSlot;
  const SelectScheduleTimeSlotIntent({
    required this.date,
    required this.timeSlot,
  });
}

