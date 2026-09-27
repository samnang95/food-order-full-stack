/**
 * Domain entity representing the outcome of a Quick Reorder operation.
 */
export class ReorderResultEntity {
  constructor({
    orderId = '',
    totalRequested = 0,
    itemsAdded = [],
    skippedCount = 0,
    unavailableItemNames = [],
    timestamp = new Date(),
  } = {}) {
    this.orderId = orderId;
    this.totalRequested = totalRequested;
    this.itemsAdded = itemsAdded;
    this.skippedCount = skippedCount;
    this.unavailableItemNames = unavailableItemNames;
    this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
  }

  get isFullSuccess() {
    return this.skippedCount === 0 && this.itemsAdded.length > 0;
  }

  get isPartialSuccess() {
    return this.itemsAdded.length > 0 && this.skippedCount > 0;
  }

  get addedCount() {
    return this.itemsAdded.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }
}
