import { LocalDB } from '../../../core/db';
import { GroupOrderModel } from '../models/group_order_model';

const STORAGE_KEY_GROUP_ORDER = 'bitecraft_active_group_order';
const STORAGE_KEY_CURRENT_MEMBER = 'bitecraft_group_current_member';

export class GroupOrderLocalDataSource {
  getActiveGroupOrder() {
    try {
      const data = LocalDB.getItem(STORAGE_KEY_GROUP_ORDER);
      if (data) {
        return GroupOrderModel.fromJson(data);
      }
    } catch (e) {
      console.warn('Failed to read group order from LocalDB:', e);
    }
    return null;
  }

  saveGroupOrder(groupOrderEntity) {
    try {
      if (!groupOrderEntity) {
        LocalDB.removeItem(STORAGE_KEY_GROUP_ORDER);
        return null;
      }
      const json = GroupOrderModel.toJson(groupOrderEntity);
      LocalDB.setItem(STORAGE_KEY_GROUP_ORDER, json);
      return GroupOrderModel.fromJson(json);
    } catch (e) {
      console.warn('Failed to save group order to LocalDB:', e);
      return groupOrderEntity;
    }
  }

  clearGroupOrder() {
    try {
      LocalDB.removeItem(STORAGE_KEY_GROUP_ORDER);
      LocalDB.removeItem(STORAGE_KEY_CURRENT_MEMBER);
    } catch (e) {
      console.warn('Failed to clear group order from LocalDB:', e);
    }
  }

  getCurrentMember() {
    try {
      return LocalDB.getItem(STORAGE_KEY_CURRENT_MEMBER) || null;
    } catch {
      return null;
    }
  }

  saveCurrentMember(member) {
    try {
      if (!member) {
        LocalDB.removeItem(STORAGE_KEY_CURRENT_MEMBER);
      } else {
        LocalDB.setItem(STORAGE_KEY_CURRENT_MEMBER, member);
      }
    } catch (e) {
      console.warn('Failed to save current group member to LocalDB:', e);
    }
  }
}
