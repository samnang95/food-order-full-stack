export class FoodEntity {
  constructor({
    id = '',
    name = '',
    description = '',
    price = 0,
    categoryId = '',
    categoryName = '',
    imageUrl = '',
    isAvailable = true,
    rating = 4.8,
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = Number(price) || 0;
    this.categoryId = categoryId;
    this.categoryName = categoryName;
    this.imageUrl = imageUrl;
    this.isAvailable = Boolean(isAvailable);
    this.rating = Number(rating) || 4.8;
  }

  get formattedPriceUSD() {
    return `$${this.price.toFixed(2)}`;
  }

  get formattedPriceKHR() {
    const khr = Math.round(this.price * 4100);
    return `${khr.toLocaleString()} ៛`;
  }
}

export class CategoryEntity {
  constructor({
    id = '',
    name = '',
    icon = '🍽️',
    description = '',
    order = 0,
  } = {}) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.description = description;
    this.order = Number(order) || 0;
  }
}
