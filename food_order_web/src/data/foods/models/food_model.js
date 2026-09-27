import { FoodEntity, CategoryEntity } from '../../../domain/foods/entities/food_entity';

export class FoodModel {
  static fromJson(raw = {}) {
    const id = raw._id || raw.id || '';
    let categoryId = '';
    let categoryName = '';

    if (raw.category && typeof raw.category === 'object') {
      categoryId = raw.category._id || raw.category.id || '';
      categoryName = raw.category.name || '';
    } else if (typeof raw.category === 'string') {
      categoryId = raw.category;
    }

    if (raw.categoryName) categoryName = raw.categoryName;

    return new FoodEntity({
      id,
      name: raw.name || raw.title || 'Untitled Food',
      description: raw.description || '',
      price: Number(raw.price) || 0,
      categoryId,
      categoryName,
      imageUrl: raw.imageUrl || raw.image || '',
      isAvailable: raw.isAvailable !== false,
      rating: Number(raw.rating) || 4.8,
    });
  }

  static toJson(entity) {
    return {
      name: entity.name,
      description: entity.description,
      price: entity.price,
      category: entity.categoryId,
      imageUrl: entity.imageUrl,
      isAvailable: entity.isAvailable,
      rating: entity.rating,
    };
  }
}

export class CategoryModel {
  static getCategoryIcon(name = '', fallbackIcon = '🍽️') {
    if (fallbackIcon && fallbackIcon !== '🍽️') return fallbackIcon;
    const lower = (name || '').toLowerCase();
    if (lower.includes('burger')) return '🍔';
    if (lower.includes('pizza')) return '🍕';
    if (lower.includes('asian') || lower.includes('noodle') || lower.includes('ramen')) return '🍜';
    if (lower.includes('healthy') || lower.includes('bowl') || lower.includes('salad')) return '🥗';
    if (lower.includes('dessert') || lower.includes('cake') || lower.includes('sweet')) return '🍰';
    if (lower.includes('beverage') || lower.includes('drink') || lower.includes('coffee')) return '☕';
    if (lower.includes('seafood') || lower.includes('fish') || lower.includes('shrimp')) return '🦐';
    if (lower.includes('bakery') || lower.includes('bread') || lower.includes('pastry')) return '🥖';
    return fallbackIcon || '🍽️';
  }

  static fromJson(raw = {}) {
    const name = raw.name || 'Category';
    return new CategoryEntity({
      id: raw._id || raw.id || '',
      name,
      icon: CategoryModel.getCategoryIcon(name, raw.icon),
      imageUrl: raw.imageUrl || raw.image || '',
      description: raw.description || '',
      order: Number(raw.order) || 0,
    });
  }

  static toJson(entity) {
    return {
      name: entity.name,
      icon: entity.icon,
      imageUrl: entity.imageUrl,
      description: entity.description,
      order: entity.order,
    };
  }
}
