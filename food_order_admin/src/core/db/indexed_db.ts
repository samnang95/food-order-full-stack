/**
 * IndexedDB Service for structured offline caching and large dataset persistence
 */
const DB_NAME = 'FoodHubAdminDB';
const DB_VERSION = 1;

export const DB_STORES = Object.freeze({
  FOODS: 'foods',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  SETTINGS: 'settings',
} as const);

export type DBStoreName = typeof DB_STORES[keyof typeof DB_STORES];

export class IndexedDBService {
  private _db: IDBDatabase | null = null;
  private _initPromise: Promise<IDBDatabase | null> | null = null;

  private async _getDB(): Promise<IDBDatabase | null> {
    if (this._db) return this._db;
    if (this._initPromise) return this._initPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('[IndexedDB] IndexedDB is not supported in this environment.');
      return null;
    }

    this._initPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(DB_STORES.FOODS)) {
          db.createObjectStore(DB_STORES.FOODS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(DB_STORES.CATEGORIES)) {
          db.createObjectStore(DB_STORES.CATEGORIES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(DB_STORES.ORDERS)) {
          db.createObjectStore(DB_STORES.ORDERS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(DB_STORES.CUSTOMERS)) {
          db.createObjectStore(DB_STORES.CUSTOMERS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(DB_STORES.SETTINGS)) {
          db.createObjectStore(DB_STORES.SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this._db = (event.target as IDBOpenDBRequest).result;
        resolve(this._db);
      };

      request.onerror = (event) => {
        console.error('[IndexedDB] Open database failed:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this._initPromise;
  }

  async getAll<T>(storeName: DBStoreName): Promise<T[]> {
    try {
      const db = await this._getDB();
      if (!db) return [];

      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();

        req.onsuccess = () => resolve((req.result || []) as T[]);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error(`[IndexedDB] getAll from "${storeName}" failed:`, err);
      return [];
    }
  }

  async get<T>(storeName: DBStoreName, key: string): Promise<T | null> {
    try {
      const db = await this._getDB();
      if (!db) return null;

      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);

        req.onsuccess = () => resolve((req.result || null) as T | null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error(`[IndexedDB] get "${key}" from "${storeName}" failed:`, err);
      return null;
    }
  }

  async put<T>(storeName: DBStoreName, item: T): Promise<boolean> {
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

  async putAll<T>(storeName: DBStoreName, items: T[]): Promise<boolean> {
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

  async delete(storeName: DBStoreName, key: string): Promise<boolean> {
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

  async clear(storeName: DBStoreName): Promise<boolean> {
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
