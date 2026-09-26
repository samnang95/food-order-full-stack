import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CartContext } from './cart_context';

const CART_STORAGE_KEY = 'bitecraft_cart_items';
const DELIVERY_FEE_STANDARD = 1.5; // $1.50 (approx 6,000 KHR)
const FREE_DELIVERY_THRESHOLD = 25.0; // Free delivery over $25

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.debug('Failed to parse cart storage:', err);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.debug('Failed to save cart to storage:', err);
    }
  }, [items]);


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
    setVoucherDiscount(0);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (err) {
      console.debug('Failed to clear cart storage:', err);
    }
  }, []);


  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  const applyVoucher = useCallback((code) => {
    const clean = (code || '').trim().toUpperCase();
    if (clean === 'BITECRAFT20' || clean === 'WELCOME20') {
      setVoucherCode(clean);
      setVoucherDiscount(0.2); // 20% discount
      return { success: true, message: '🎉 20% discount applied!' };
    } else if (clean === 'FREEDELIVERY') {
      setVoucherCode(clean);
      setVoucherDiscount('FREE_DELIVERY');
      return { success: true, message: '🛵 Free delivery voucher applied!' };
    } else {
      return { success: false, message: 'Invalid or expired voucher code' };
    }
  }, []);

  const removeVoucher = useCallback(() => {
    setVoucherCode('');
    setVoucherDiscount(0);
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.food.price) || 0) * item.quantity, 0);
  }, [items]);

  const deliveryFee = useMemo(() => {
    if (items.length === 0) return 0;
    if (subtotal >= FREE_DELIVERY_THRESHOLD || voucherDiscount === 'FREE_DELIVERY') return 0;
    return DELIVERY_FEE_STANDARD;
  }, [items.length, subtotal, voucherDiscount]);

  const discountAmount = useMemo(() => {
    if (typeof voucherDiscount === 'number') {
      return subtotal * voucherDiscount;
    }
    return 0;
  }, [subtotal, voucherDiscount]);

  const totalAmount = useMemo(() => {
    const rawTotal = subtotal + deliveryFee - discountAmount;
    return Math.max(0, rawTotal);
  }, [subtotal, deliveryFee, discountAmount]);

  const totalCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const value = {
    items,
    totalCount,
    subtotal,
    deliveryFee,
    discountAmount,
    totalAmount,
    voucherCode,
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
