import { DriverTipModel } from '../models/driver_tip_model';
import { DriverFeedbackModel } from '../models/driver_feedback_model';

const TIPS_STORAGE_KEY = 'bitecraft_driver_tips';
const FEEDBACK_STORAGE_KEY = 'bitecraft_driver_feedback';

export class DriverTipLocalDataSource {
  constructor(storage = window.localStorage) {
    this.storage = storage;
  }

  getAllTips() {
    try {
      const raw = this.storage.getItem(TIPS_STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list.map((item) => DriverTipModel.fromJson(item)) : [];
    } catch (e) {
      console.warn('Error reading driver tips:', e);
      return [];
    }
  }

  saveTip(tipEntity) {
    try {
      const current = this.getAllTips();
      const next = [tipEntity, ...current.filter((t) => t.id !== tipEntity.id)];
      this.storage.setItem(
        TIPS_STORAGE_KEY,
        JSON.stringify(next.map((t) => DriverTipModel.toJson(t)))
      );
      return true;
    } catch (e) {
      console.warn('Error saving driver tip:', e);
      return false;
    }
  }

  getTipForOrder(orderId) {
    const list = this.getAllTips();
    return list.find((t) => t.orderId === orderId) || null;
  }

  getAllFeedback() {
    try {
      const raw = this.storage.getItem(FEEDBACK_STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list.map((item) => DriverFeedbackModel.fromJson(item)) : [];
    } catch (e) {
      console.warn('Error reading driver feedback:', e);
      return [];
    }
  }

  saveFeedback(feedbackEntity) {
    try {
      const current = this.getAllFeedback();
      const next = [feedbackEntity, ...current.filter((f) => f.orderId !== feedbackEntity.orderId)];
      this.storage.setItem(
        FEEDBACK_STORAGE_KEY,
        JSON.stringify(next.map((f) => DriverFeedbackModel.toJson(f)))
      );
      return true;
    } catch (e) {
      console.warn('Error saving driver feedback:', e);
      return false;
    }
  }
}
