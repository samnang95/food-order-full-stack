/**
 * IndexedDB Service for structured offline caching and large dataset persistence
 */
const DB_NAME = 'BiteCraftWebDB';
const DB_VERSION = 1;

const STORES = {
  FOODS: 'foods',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  SETTINGS: 'settings',
};

class IndexedDBService {
  constructor() {
    this._db = null;
    this._initPromise = null;
  }

  async _getDB() {
    if (this._db) return this._db;
    if (this._initPromise) return this._initPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('[IndexedDB] IndexedDB is not supported in this environment.');
      return null;
    }

    this._initPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORES.FOODS)) {
          db.createObjectStore(STORES.FOODS, { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
          db.createObjectStore(STORES.CATEGORIES, { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains(STORES.ORDERS)) {
          db.createObjectStore(STORES.ORDERS, { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this._db = event.target.result;
        resolve(this._db);
      };

      request.onerror = (event) => {
        console.error('[IndexedDB] Open database failed:', event.target.error);
        reject(event.target.error);
      };
    });

    return this._initPromise;
  }

  async getAll(storeName) {
    try {
      const db = await this._getDB();
      if (!db) return [];

      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error(`[IndexedDB] getAll from "${storeName}" failed:`, err);
      return [];
    }
  }

  async get(storeName, key) {
    try {
      const db = await this._getDB();
      if (!db) return null;

      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error(`[IndexedDB] get "${key}" from "${storeName}" failed:`, err);
      return null;
    }
  }

  async put(storeName, item) {
    try {
      const db = await this._getDB();
      if (!db) return false;

      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(item);

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error(`[IndexedDB] put into "${storeName}" failed:`, err);
      return false;
    }
  }

  async putAll(storeName, items) {
    try {
      const db = await this._getDB();
      if (!db || !Array.isArray(items) || items.length === 0) return false;

      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        for (const item of items) {
          store.put(item);
        }

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error(`[IndexedDB] putAll into "${storeName}" failed:`, err);
      return false;
    }
  }

  async delete(storeName, key) {
    try {
      const db = await this._getDB();
      if (!db) return false;

      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(key);

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error(`[IndexedDB] delete "${key}" from "${storeName}" failed:`, err);
      return false;
    }
  }

  async clear(storeName) {
    try {
      const db = await this._getDB();
      if (!db) return false;

      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.clear();

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error(`[IndexedDB] clear "${storeName}" failed:`, err);
      return false;
    }
  }
}

export const indexedDBService = new IndexedDBService();
export { STORES as DB_STORES };
