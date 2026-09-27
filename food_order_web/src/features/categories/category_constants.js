export const CATEGORY_HERO_FALLBACKS = {
  burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&auto=format&fit=crop&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&auto=format&fit=crop&q=80',
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&auto=format&fit=crop&q=80',
  'asian cuisine': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1600&auto=format&fit=crop&q=80',
  asian: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1600&auto=format&fit=crop&q=80',
  'healthy bowls': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&auto=format&fit=crop&q=80',
  healthy: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&auto=format&fit=crop&q=80',
  desserts: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1600&auto=format&fit=crop&q=80',
  dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1600&auto=format&fit=crop&q=80',
  beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1600&auto=format&fit=crop&q=80',
  beverage: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1600&auto=format&fit=crop&q=80',
  drinks: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1600&auto=format&fit=crop&q=80',
  seafood: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=1600&auto=format&fit=crop&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format&fit=crop&q=80',
};

export function getCategoryHeroImage(category) {
  if (category?.imageUrl && typeof category.imageUrl === 'string' && category.imageUrl.startsWith('http')) {
    return category.imageUrl;
  }
  const key = (category?.name || '').toLowerCase().trim();
  for (const [catName, url] of Object.entries(CATEGORY_HERO_FALLBACKS)) {
    if (key.includes(catName)) {
      return url;
    }
  }
  return CATEGORY_HERO_FALLBACKS.default;
}

export function getCategoryIcon(name = '', fallbackIcon = '🍽️') {
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
