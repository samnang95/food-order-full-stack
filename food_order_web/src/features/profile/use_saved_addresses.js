import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LocalDB, DBKeys } from '../../core';
import { accountRemoteDataSource } from '../../data/account';

const DEFAULT_SAVED_ADDRESSES = [
  {
    id: 'addr_home',
    label: 'Home',
    address: 'Building 45, Street 302, Boeng Keng Kang 1, Phnom Penh',
    note: 'Call when arriving, 3rd floor',
    lat: 11.551,
    lng: 104.925,
    isDefault: true,
  },
  {
    id: 'addr_work',
    label: 'Work',
    address: 'Vattanac Capital Tower, Level 12, Preah Monivong Blvd, Daun Penh, Phnom Penh',
    note: 'Leave at lobby reception',
    lat: 11.572,
    lng: 104.925,
    isDefault: false,
  },
];

export function useSavedAddresses() {
  const [addresses, setAddresses] = useState(() => {
    return LocalDB.getJSON(DBKeys.SAVED_ADDRESSES, DEFAULT_SAVED_ADDRESSES);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasInitialSynced = useRef(false);

  const save = useCallback((newAddrs) => {
    setAddresses(newAddrs);
    LocalDB.setJSON(DBKeys.SAVED_ADDRESSES, newAddrs);
  }, []);

  // Fetch from cloud and merge with local storage on initial mount
  const refreshAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const remoteList = await accountRemoteDataSource.getAddresses();
      if (Array.isArray(remoteList) && remoteList.length > 0) {
        save(remoteList);
      } else {
        // If remote has no addresses, sync local ones to cloud
        const current = LocalDB.getJSON(DBKeys.SAVED_ADDRESSES, DEFAULT_SAVED_ADDRESSES);
        if (Array.isArray(current) && current.length > 0) {
          const synced = await accountRemoteDataSource.syncAddresses(current);
          if (Array.isArray(synced) && synced.length > 0) {
            save(synced);
          }
        }
      }
    } catch (err) {
      console.debug('[SavedAddresses] Cloud fetch fallback to local:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [save]);

  useEffect(() => {
    if (!hasInitialSynced.current) {
      hasInitialSynced.current = true;
      refreshAddresses();
    }
  }, [refreshAddresses]);

  // Cross-tab synchronization
  useEffect(() => {
    const unsub = LocalDB.addListener(DBKeys.SAVED_ADDRESSES, (newAddrs) => {
      if (Array.isArray(newAddrs)) {
        setAddresses(newAddrs);
      }
    });
    return () => unsub?.();
  }, []);

  const addAddress = useCallback(
    async ({ label, address, note = '', lat = 11.551, lng = 104.925, isDefault = false }) => {
      const newId = `addr_${Date.now()}`;
      let updated = [...addresses];

      if (isDefault) {
        updated = updated.map((a) => ({ ...a, isDefault: false }));
      }

      const newAddr = {
        id: newId,
        customId: newId,
        label: label || 'Other',
        address,
        note,
        lat: Number(lat) || 11.551,
        lng: Number(lng) || 104.925,
        isDefault: isDefault || addresses.length === 0,
      };

      updated.unshift(newAddr);
      save(updated);

      // Async cloud sync
      setIsSyncing(true);
      try {
        const savedRemote = await accountRemoteDataSource.saveAddress(newAddr);
        if (savedRemote && savedRemote.id) {
          const reconciled = updated.map((a) => (a.id === newId ? savedRemote : a));
          save(reconciled);
        }
      } catch (err) {
        console.warn('[SavedAddresses] Cloud save failed, saved locally:', err.message);
      } finally {
        setIsSyncing(false);
      }

      return newAddr;
    },
    [addresses, save]
  );

  const updateAddress = useCallback(
    async (id, fields) => {
      let updated = addresses.map((a) => {
        if (a.id === id || a._id === id) {
          return { ...a, ...fields };
        }
        if (fields.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      });

      save(updated);

      // Async cloud sync
      try {
        await accountRemoteDataSource.updateAddress(id, fields);
      } catch (err) {
        console.warn('[SavedAddresses] Cloud update failed:', err.message);
      }
    },
    [addresses, save]
  );

  const removeAddress = useCallback(
    async (id) => {
      const remaining = addresses.filter((a) => a.id !== id && a._id !== id);
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0].isDefault = true;
      }
      save(remaining);

      // Async cloud sync
      try {
        await accountRemoteDataSource.deleteAddress(id);
      } catch (err) {
        console.warn('[SavedAddresses] Cloud delete failed:', err.message);
      }
    },
    [addresses, save]
  );

  const setDefaultAddress = useCallback(
    async (id) => {
      const updated = addresses.map((a) => ({
        ...a,
        isDefault: a.id === id || a._id === id,
      }));
      save(updated);

      // Async cloud sync
      try {
        await accountRemoteDataSource.updateAddress(id, { isDefault: true });
      } catch (err) {
        console.warn('[SavedAddresses] Cloud setDefault failed:', err.message);
      }
    },
    [addresses, save]
  );

  const defaultAddress = useMemo(() => {
    return addresses.find((a) => a.isDefault) || addresses[0] || null;
  }, [addresses]);

  return {
    addresses,
    defaultAddress,
    isLoading,
    isSyncing,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    refreshAddresses,
  };
}
