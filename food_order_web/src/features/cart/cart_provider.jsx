import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CartContext } from './cart_context';
import { LocalDB, DBKeys } from '../../core';
import { container } from '../../core/di/container';

const DELIVERY_FEE_STANDARD = 1.5; // $1.50 (approx 6,000 KHR)
const FREE_DELIVERY_THRESHOLD = 25.0; // Free delivery over $25

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => LocalDB.getJSON(DBKeys.CART_ITEMS, []));

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [tipAmount, setTipAmount] = useState(0);

  // Sync to LocalDB
  useEffect(() => {
    LocalDB.setJSON(DBKeys.CART_ITEMS, items);
  }, [items]);

  // Load available vouchers
  useEffect(() => {
    let isMounted = true;
    container.getVouchersUseCase
      .execute()
      .then((vouchers) => {
        if (isMounted && Array.isArray(vouchers)) {
          setAvailableVouchers(vouchers);
        }
      })
      .catch((err) => {
        console.error('Failed to load vouchers:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const addItem = useCallback((food, quantity = 1, notes = '') => {
    if (!food || !food.id) return;
    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.food.id === food.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: copy[existingIdx].quantity + quantity,
          notes: notes || copy[existingIdx].notes,
        };
        return copy;
      }
      return [...prev, { food, quantity, notes }];
    });
  }, []);

  const removeItem = useCallback((foodId) => {
    setItems((prev) => prev.filter((i) => i.food.id !== foodId));
  }, []);

  const updateQuantity = useCallback((foodId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.food.id !== foodId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.food.id === foodId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setVoucherCode('');
    setAppliedVoucher(null);
    setTipAmount(0);
    LocalDB.remove(DBKeys.CART_ITEMS);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.food.price) || 0) * item.quantity, 0);
  }, [items]);

  const applyVoucher = useCallback(
    async (code) => {
      const res = await container.validateVoucherUseCase.execute(code, subtotal);
      if (res.valid) {
        setVoucherCode(res.code);
        setAppliedVoucher(res);
        return { success: true, message: res.message || `Voucher ${res.code} applied!` };
      } else {
        return { success: false, message: res.message || 'Invalid or expired voucher' };
      }
    },
    [subtotal]
  );

  const removeVoucher = useCallback(() => {
    setVoucherCode('');
    setAppliedVoucher(null);
  }, []);

  const deliveryFee = useMemo(() => {
    if (items.length === 0) return 0;
    if (subtotal >= FREE_DELIVERY_THRESHOLD || appliedVoucher?.code === 'FREESHIP') return 0;
    return DELIVERY_FEE_STANDARD;
  }, [items.length, subtotal, appliedVoucher]);

  const discountAmount = useMemo(() => {
    if (appliedVoucher?.discountAmount) {
      return Number(appliedVoucher.discountAmount) || 0;
    }
    return 0;
  }, [appliedVoucher]);

  const totalAmount = useMemo(() => {
    const rawTotal = subtotal + deliveryFee - discountAmount + tipAmount;
    return Math.max(0, Math.round(rawTotal * 100) / 100);
  }, [subtotal, deliveryFee, discountAmount, tipAmount]);

  const totalCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const value = {
    items,
    totalCount,
    subtotal,
    deliveryFee,
    discountAmount,
    tipAmount,
    setTipAmount,
    totalAmount,
    voucherCode,
    appliedVoucher,
    availableVouchers,
    isCartOpen,
    isCheckoutOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    openCheckout,
    closeCheckout,
    applyVoucher,
    removeVoucher,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
