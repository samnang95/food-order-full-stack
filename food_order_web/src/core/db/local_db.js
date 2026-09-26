import { DBKeys } from './db_keys';

const memoryStore = new Map();

const isStorageAvailable = (() => {
  try {
    const testKey = '__bitecraft_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    console.warn('[LocalDB] LocalStorage is unavailable or restricted. Using memory store fallback.');
    return false;
  }
})();

export class LocalDB {
  static get isAvailable() {
    return isStorageAvailable;
  }

  // --- String Methods ---

  static setString(key, value) {
    try {
      const strVal = String(value);
      if (isStorageAvailable) {
        window.localStorage.setItem(key, strVal);
      } else {
        memoryStore.set(key, strVal);
      }
      return true;
    } catch (err) {
      console.error(`[LocalDB] setString failed for key: "${key}"`, err);
      memoryStore.set(key, String(value));
      return false;
    }
  }

  static getString(key, defaultValue = null) {
    try {
      if (isStorageAvailable) {
        const val = window.localStorage.getItem(key);
        return val !== null ? val : defaultValue;
      }
      return memoryStore.has(key) ? memoryStore.get(key) : defaultValue;
    } catch (err) {
      console.error(`[LocalDB] getString failed for key: "${key}"`, err);
      return defaultValue;
    }
  }

  // --- Boolean Methods ---

  static setBool(key, value) {
    return this.setString(key, value ? 'true' : 'false');
  }

  static getBool(key, defaultValue = false) {
    const val = this.getString(key);
    if (val === null) return defaultValue;
    return val === 'true';
  }

  // --- Number Methods ---

  static setNumber(key, value) {
    return this.setString(key, String(value));
  }

  static getNumber(key, defaultValue = 0) {
    const val = this.getString(key);
    if (val === null) return defaultValue;
    const num = Number(val);
    return isNaN(num) ? defaultValue : num;
  }

  // --- JSON Object Methods ---

  static setJSON(key, value) {
    try {
      const jsonStr = JSON.stringify(value);
      return this.setString(key, jsonStr);
    } catch (err) {
      console.error(`[LocalDB] setJSON serialization failed for key: "${key}"`, err);
      return false;
    }
  }

  static getJSON(key, defaultValue = null) {
    const val = this.getString(key);
    if (!val) return defaultValue;
    try {
      return JSON.parse(val);
    } catch (err) {
      console.error(`[LocalDB] getJSON parsing failed for key: "${key}"`, err);
      return defaultValue;
    }
  }

  // --- String List Methods ---

  static setStringList(key, list) {
    if (!Array.isArray(list)) {
      console.error(`[LocalDB] setStringList requires an array, got:`, typeof list);
      return false;
    }
    return this.setJSON(key, list);
  }

  static getStringList(key, defaultValue = []) {
    const list = this.getJSON(key, defaultValue);
    return Array.isArray(list) ? list : defaultValue;
  }

  // --- Existence & Removal ---

  static has(key) {
    if (isStorageAvailable) {
      return window.localStorage.getItem(key) !== null;
    }
    return memoryStore.has(key);
  }

  static remove(key) {
    try {
      if (isStorageAvailable) {
        window.localStorage.removeItem(key);
      }
      memoryStore.delete(key);
      return true;
    } catch (err) {
      console.error(`[LocalDB] remove failed for key: "${key}"`, err);
      return false;
    }
  }

  static clear() {
    try {
      if (isStorageAvailable) {
        window.localStorage.clear();
      }
      memoryStore.clear();
      return true;
    } catch (err) {
      console.error('[LocalDB] clear failed', err);
      return false;
    }
  }

  static getAllKeys() {
    try {
      if (isStorageAvailable) {
        return Object.keys(window.localStorage);
      }
      return Array.from(memoryStore.keys());
    } catch {
      return [];
    }
  }

  // --- Cross-Tab Listener ---

  static addListener(key, callback) {
    const handler = (e) => {
      if (e.key === key) {
        callback(e.newValue, e.oldValue);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
}

export { DBKeys };
