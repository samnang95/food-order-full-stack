export function createInitialCheckoutState(user = null) {
  return {
    customerName: user?.username || user?.name || 'Guest Foodie',
    customerPhone: user?.phone || '012 888 999',
    selectedDistrict: 'BKK 1',
    streetAddress: 'Building 45, Street 302, Sangkat Boeng Keng Kang 1',
    deliveryNote: '',
    coordinates: [11.551, 104.925],
    paymentMethod: 'cash',
    submitting: false,
    errorMsg: '',
    placedOrder: null,
    showKhqrModal: false,
  };
}

export function buildFullDeliveryAddress(streetAddress, selectedDistrict, deliveryNote) {
  return `${streetAddress}, ${selectedDistrict}, Phnom Penh${
    deliveryNote ? ` (${deliveryNote})` : ''
  }`;
}
