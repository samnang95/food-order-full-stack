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
  static fromJson(raw = {}) {
    return new CategoryEntity({
      id: raw._id || raw.id || '',
      name: raw.name || 'Category',
      icon: raw.icon || '🍽️',
      description: raw.description || '',
      order: Number(raw.order) || 0,
    });
  }

  static toJson(entity) {
    return {
      name: entity.name,
      icon: entity.icon,
      description: entity.description,
      order: entity.order,
    };
  }
}
