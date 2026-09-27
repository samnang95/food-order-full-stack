/**
 * Intent (I) in MVI:
 * Plain actions representing user intents and invoice events.
 */
export const InvoiceIntentType = {
  GENERATE_INVOICE: 'INVOICE/GENERATE_INVOICE',
  GENERATE_START: 'INVOICE/GENERATE_START',
  GENERATE_SUCCESS: 'INVOICE/GENERATE_SUCCESS',
  GENERATE_ERROR: 'INVOICE/GENERATE_ERROR',

  CLOSE_INVOICE: 'INVOICE/CLOSE_INVOICE',
  SET_COPIED_REF: 'INVOICE/SET_COPIED_REF',
  TRIGGER_PRINT: 'INVOICE/TRIGGER_PRINT',
};

export const InvoiceIntent = {
  generateInvoice: (order) => ({
    type: InvoiceIntentType.GENERATE_INVOICE,
    payload: order,
  }),

  closeInvoice: () => ({
    type: InvoiceIntentType.CLOSE_INVOICE,
  }),

  setCopiedRef: (isCopied) => ({
    type: InvoiceIntentType.SET_COPIED_REF,
    payload: isCopied,
  }),

  triggerPrint: () => ({
    type: InvoiceIntentType.TRIGGER_PRINT,
  }),
};
