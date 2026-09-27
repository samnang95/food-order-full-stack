import { useState, useEffect, useCallback, useMemo } from 'react';
import { LocalDB, DBKeys } from '../../core';

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

  // Cross-tab synchronization
  useEffect(() => {
    const unsub = LocalDB.addListener(DBKeys.SAVED_ADDRESSES, (newAddrs) => {
      if (Array.isArray(newAddrs)) {
        setAddresses(newAddrs);
      }
    });
    return () => unsub?.();
  }, []);

  const save = useCallback((newAddrs) => {
    setAddresses(newAddrs);
    LocalDB.setJSON(DBKeys.SAVED_ADDRESSES, newAddrs);
  }, []);

  const addAddress = useCallback(
    ({ label, address, note = '', lat = 11.551, lng = 104.925, isDefault = false }) => {
      const newId = `addr_${Date.now()}`;
      let updated = [...addresses];

      if (isDefault) {
        updated = updated.map((a) => ({ ...a, isDefault: false }));
      }

      const newAddr = {
        id: newId,
        label: label || 'Other',
        address,
        note,
        lat: Number(lat) || 11.551,
        lng: Number(lng) || 104.925,
        isDefault: isDefault || addresses.length === 0,
      };

      updated.unshift(newAddr);
      save(updated);
      return newAddr;
    },
    [addresses, save]
  );

  const updateAddress = useCallback(
    (id, fields) => {
      let updated = addresses.map((a) => {
        if (a.id === id) {
          return { ...a, ...fields };
        }
        if (fields.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      });

      save(updated);
    },
    [addresses, save]
  );

  const removeAddress = useCallback(
    (id) => {
      const remaining = addresses.filter((a) => a.id !== id);
      // If we removed the default address, make the first one default
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0].isDefault = true;
      }
      save(remaining);
    },
    [addresses, save]
  );

  const setDefaultAddress = useCallback(
    (id) => {
      const updated = addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      save(updated);
    },
    [addresses, save]
  );

  const defaultAddress = useMemo(() => {
    return addresses.find((a) => a.isDefault) || addresses[0] || null;
  }, [addresses]);

  return {
    addresses,
    defaultAddress,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
  };
}
