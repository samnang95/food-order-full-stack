import { useReducer, useCallback } from 'react';
import { initialInvoiceState } from './invoices_state';
import { InvoiceIntentType, InvoiceIntent } from './invoices_intent';
import { container } from '../../core/di/container';

/**
 * Pure Reducer: receives current invoice state and intent, returns new state
 */
export function invoiceReducer(state, action) {
  switch (action.type) {
    case InvoiceIntentType.GENERATE_START:
      return {
        ...state,
        isLoading: true,
        errorMessage: null,
      };

    case InvoiceIntentType.GENERATE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        invoice: action.payload,
        isOpen: true,
        errorMessage: null,
        copiedRef: false,
      };

    case InvoiceIntentType.GENERATE_ERROR:
      return {
        ...state,
        isLoading: false,
        errorMessage: action.payload,
      };

    case InvoiceIntentType.CLOSE_INVOICE:
      return {
        ...state,
        isOpen: false,
        copiedRef: false,
      };

    case InvoiceIntentType.SET_COPIED_REF:
      return {
        ...state,
        copiedRef: Boolean(action.payload),
      };

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow for Invoices
 */
export function useInvoiceStore() {
  const [state, dispatch] = useReducer(invoiceReducer, initialInvoiceState);

  const generateInvoice = useCallback(async (order) => {
    dispatch({ type: InvoiceIntentType.GENERATE_START });
    try {
      const invoice = await container.generateInvoiceUseCase.execute(order);
      dispatch({ type: InvoiceIntentType.GENERATE_SUCCESS, payload: invoice });
      return invoice;
    } catch (err) {
      const msg = err.message || 'Failed to generate tax invoice';
      dispatch({ type: InvoiceIntentType.GENERATE_ERROR, payload: msg });
      throw err;
    }
  }, []);

  const copyInvoiceNumber = useCallback((number) => {
    if (!number) return;
    navigator.clipboard?.writeText?.(number);
    dispatch(InvoiceIntent.setCopiedRef(true));
    setTimeout(() => {
      dispatch(InvoiceIntent.setCopiedRef(false));
    }, 2000);
  }, []);

  const triggerPrint = useCallback(() => {
    window.print();
  }, []);

  const onIntent = useCallback(
    (intent) => {
      switch (intent.type) {
        case InvoiceIntentType.GENERATE_INVOICE:
          return generateInvoice(intent.payload);

        case InvoiceIntentType.TRIGGER_PRINT:
          return triggerPrint();

        default:
          dispatch(intent);
          break;
      }
    },
    [generateInvoice, triggerPrint]
  );

  return {
    state,
    onIntent,
    invoice: state.invoice,
    isOpen: state.isOpen,
    isLoading: state.isLoading,
    errorMessage: state.errorMessage,
    copiedRef: state.copiedRef,
    openInvoice: generateInvoice,
    closeInvoice: () => dispatch(InvoiceIntent.closeInvoice()),
    copyInvoiceNumber,
    triggerPrint,
  };
}
