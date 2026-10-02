import { FoodEntity, CategoryEntity } from '../../../domain/foods/entities/food_entity';

export interface FoodModelData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  prepTimeMinutes: number;
  calories?: number;
  tags: string[];
}

export interface CategoryModelData {
  id: string;
  name: string;
  slug: string;
  icon: string;
  itemCount: number;
  isActive: boolean;
}

export class FoodModel {
  static toEntity(raw: FoodModelData): FoodEntity {
    return new FoodEntity(raw);
  }

  static fromEntity(entity: FoodEntity): FoodModelData {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      category: entity.category,
      image: entity.image,
      isAvailable: entity.isAvailable,
      rating: entity.rating,
      reviewCount: entity.reviewCount,
      prepTimeMinutes: entity.prepTimeMinutes,
      calories: entity.calories,
      tags: [...entity.tags],
    };
  }
}

export class CategoryModel {
  static toEntity(raw: CategoryModelData): CategoryEntity {
    return new CategoryEntity(raw);
  }

  static fromEntity(entity: CategoryEntity): CategoryModelData {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      icon: entity.icon,
      itemCount: entity.itemCount,
      isActive: entity.isActive,
    };
  }
}
