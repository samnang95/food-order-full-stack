import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { PrintableInvoice } from './PrintableInvoice';
import { useTranslation } from '../../../core';

export function InvoiceModal({
  isOpen,
  invoice,
  onClose,
  onPrint,
  onCopyInvoiceNumber,
  isCopied,
}) {
  const { t } = useTranslation();

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Print stylesheet override so ONLY #printable-tax-invoice prints */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-tax-invoice, #printable-tax-invoice * {
            visibility: visible;
          }
          #printable-tax-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-3xl my-auto bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-base font-black">
              📄
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {t('invoices.title') || 'Official Tax Invoice'}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Copy Invoice # */}
            <button
              type="button"
              onClick={() => onCopyInvoiceNumber?.(invoice.invoiceNumber)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs"
            >
              <span>{isCopied ? '✓' : '📋'}</span>
              <span className="hidden sm:inline">
                {isCopied
                  ? t('common.copied') || 'Copied'
                  : t('invoices.copyNumber') || 'Copy No.'}
              </span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={onPrint}
              className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-black transition-all flex items-center space-x-1.5 shadow-md shadow-orange-500/20"
            >
              <span>🖨️</span>
              <span>{t('invoices.printOrDownload') || 'Print / Save PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition-colors ml-1"
              aria-label="Close invoice"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-200/50 dark:bg-slate-950/50">
          <PrintableInvoice invoice={invoice} />
        </div>

        {/* Bottom Helper Bar (Hidden on print) */}
        <div className="print:hidden px-5 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0 gap-2">
          <span>💡 Tip: Select &quot;Save as PDF&quot; in the destination dropdown to export a digital copy.</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 transition-colors"
          >
            {t('common.close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

InvoiceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  invoice: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onPrint: PropTypes.func.isRequired,
  onCopyInvoiceNumber: PropTypes.func.isRequired,
  isCopied: PropTypes.bool,
};
