const memoryStore = new Map<string, string>();

const isStorageAvailable = (() => {
  try {
    if (typeof window === 'undefined') return false;
    const testKey = '__foodhub_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    console.warn('[LocalDB] LocalStorage is unavailable. Falling back to in-memory store.');
    return false;
  }
})();

export class LocalDB {
  static get isAvailable(): boolean {
    return isStorageAvailable;
  }

  // --- String Methods ---

  static setString(key: string, value: string): boolean {
    try {
      if (isStorageAvailable) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStore.set(key, value);
      }
      return true;
    } catch (err) {
      console.error(`[LocalDB] setString failed for key: "${key}"`, err);
      memoryStore.set(key, value);
      return false;
    }
  }

  static getString(key: string, defaultValue: string | null = null): string | null {
    try {
      if (isStorageAvailable) {
        const val = window.localStorage.getItem(key);
        return val !== null ? val : defaultValue;
      }
      return memoryStore.has(key) ? memoryStore.get(key)! : defaultValue;
    } catch (err) {
      console.error(`[LocalDB] getString failed for key: "${key}"`, err);
      return defaultValue;
    }
  }

  // --- Boolean Methods ---

  static setBool(key: string, value: boolean): boolean {
    return this.setString(key, value ? 'true' : 'false');
  }

  static getBool(key: string, defaultValue = false): boolean {
    const val = this.getString(key);
    if (val === null) return defaultValue;
    return val === 'true';
  }

  // --- Number Methods ---

  static setNumber(key: string, value: number): boolean {
    return this.setString(key, String(value));
  }

  static getNumber(key: string, defaultValue = 0): number {
    const val = this.getString(key);
    if (val === null) return defaultValue;
    const num = Number(val);
    return isNaN(num) ? defaultValue : num;
  }

  // --- JSON Methods ---

  static setJson<T>(key: string, value: T): boolean {
    try {
      const jsonStr = JSON.stringify(value);
      return this.setString(key, jsonStr);
    } catch (err) {
      console.error(`[LocalDB] setJson failed for key: "${key}"`, err);
      return false;
    }
  }

  static getJson<T>(key: string, defaultValue: T | null = null): T | null {
    const val = this.getString(key);
    if (!val) return defaultValue;
    try {
      return JSON.parse(val) as T;
    } catch (err) {
      console.error(`[LocalDB] getJson failed for key: "${key}"`, err);
      return defaultValue;
    }
  }

  // --- Removal & Clearing ---

  static remove(key: string): boolean {
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

  static clear(): boolean {
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
}
