/**
 * Domain entity representing an item inside a collaborative Group Order cart.
 */
export class GroupItemEntity {
  constructor({
    id = '',
    foodId = '',
    foodName = 'Dish',
    foodImageUrl = '',
    price = 0,
    quantity = 1,
    notes = '',
    memberId = '',
    memberName = 'Participant',
    memberColor = '#f97316',
  } = {}) {
    this.id = id || `gi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.foodId = foodId;
    this.foodName = foodName;
    this.foodImageUrl = foodImageUrl;
    this.price = Number(price) || 0;
    this.quantity = Number(quantity) || 1;
    this.notes = notes;
    this.memberId = memberId;
    this.memberName = memberName;
    this.memberColor = memberColor;
  }

  get totalPrice() {
    return this.price * this.quantity;
  }
}
