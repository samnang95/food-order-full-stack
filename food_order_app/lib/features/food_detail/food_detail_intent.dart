sealed class FoodDetailIntent {
  const FoodDetailIntent();
}

class FoodDetailIncrementQty extends FoodDetailIntent {
  const FoodDetailIncrementQty();
}

class FoodDetailDecrementQty extends FoodDetailIntent {
  const FoodDetailDecrementQty();
}

class FoodDetailToggleFavorite extends FoodDetailIntent {
  const FoodDetailToggleFavorite();
}

class FoodDetailSpecialInstructionsChanged extends FoodDetailIntent {
  final String instructions;
  const FoodDetailSpecialInstructionsChanged(this.instructions);
}

class FoodDetailAddToCart extends FoodDetailIntent {
  const FoodDetailAddToCart();
}
