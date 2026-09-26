import { Currency } from '../constants/app_constants';

/**
 * Common formatting utility functions
 */

export function formatUSD(amount = 0) {
  const num = Number(amount) || 0;
  return `${Currency.USD_SYMBOL}${num.toFixed(2)}`;
}

export function formatKHR(amount = 0) {
  const num = Number(amount) || 0;
  const khr = Math.round(num * Currency.EXCHANGE_RATE_KHR);
  return `${khr.toLocaleString()} ${Currency.KHR_SYMBOL}`;
}

export const formatUsd = formatUSD;
export const formatKhr = formatKHR;


export function formatTime(dateInput) {
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

export function formatDate(dateInput) {
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function formatOrderId(id = '') {
  if (!id) return '#ORD-0000';
  return `#${id.slice(-6).toUpperCase()}`;
}
