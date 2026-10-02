export class FoodEntity {
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

  constructor(data: Partial<FoodEntity>) {
    this.id = data.id || '';
    this.name = data.name || 'Unnamed Dish';
    this.description = data.description || '';
    this.price = Number(data.price) || 0;
    this.category = data.category || 'General';
    this.image = data.image || '';
    this.isAvailable = data.isAvailable ?? true;
    this.rating = Number(data.rating) || 5.0;
    this.reviewCount = Number(data.reviewCount) || 0;
    this.prepTimeMinutes = Number(data.prepTimeMinutes) || 15;
    this.calories = data.calories;
    this.tags = data.tags || [];
  }
}

export class CategoryEntity {
  id: string;
  name: string;
  slug: string;
  icon: string;
  itemCount: number;
  isActive: boolean;

  constructor(data: Partial<CategoryEntity>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.slug = data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || '';
    this.icon = data.icon || 'Utensils';
    this.itemCount = Number(data.itemCount) || 0;
    this.isActive = data.isActive ?? true;
  }
}
