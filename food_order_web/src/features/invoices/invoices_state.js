/**
 * Model / State (M) in MVI:
 * Immutable representation of the Invoice feature state.
 */
export const initialInvoiceState = {
  invoice: null,
  isOpen: false,
  isLoading: false,
  errorMessage: null,
  copiedRef: false,
};
