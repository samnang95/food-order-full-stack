sealed class CartIntent {
  const CartIntent();
}

class CartIncrementQty extends CartIntent {
  final String foodId;
  const CartIncrementQty(this.foodId);
}

class CartDecrementQty extends CartIntent {
  final String foodId;
  const CartDecrementQty(this.foodId);
}

class CartRemoveItem extends CartIntent {
  final String foodId;
  const CartRemoveItem(this.foodId);
}

class CartClear extends CartIntent {
  const CartClear();
}

class CartCheckout extends CartIntent {
  const CartCheckout();
}
