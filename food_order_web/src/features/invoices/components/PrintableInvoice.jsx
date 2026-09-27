import PropTypes from 'prop-types';
import { formatUsd, formatKhr, AppAssets } from '../../../core';

export function PrintableInvoice({ invoice }) {
  if (!invoice) return null;

  const {
    invoiceNumber,
    orderNumber,
    issueDate,
    company,
    customer,
    items = [],
    subtotal = 0,
    deliveryFee = 0,
    discountAmount = 0,
    voucherCode,
    tipAmount = 0,
    vatAmount = 0,
    totalAmount = 0,
    totalAmountKhr = 0,
    paymentMethod = 'Cash on Delivery',
    paymentStatus = 'PENDING',
    paymentRef,
  } = invoice;

  const formattedDate = new Date(issueDate).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const isPaid = paymentStatus === 'COMPLETED';

  return (
    <div
      id="printable-tax-invoice"
      className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-xs border border-slate-200 max-w-2xl mx-auto font-sans leading-normal selection:bg-orange-100"
    >
      {/* 1. Official Header: Kingdom & Invoicing Header */}
      <div className="border-b-2 border-slate-900 pb-5 mb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Logo & Company Names */}
          <div className="flex items-center space-x-3.5">
            <img
              src={AppAssets.images.logo}
              alt="BiteCraft Logo"
              className="w-12 h-12 rounded-xl object-contain shadow-xs bg-slate-900 p-1"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                {company.name}
              </h2>
              <p className="text-xs font-semibold text-orange-600">
                {company.khmerName}
              </p>
            </div>
          </div>

          {/* Tax Invoice Title Block */}
          <div className="text-left sm:text-right">
            <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider">
              TAX INVOICE / វិក្កយបត្រពន្ធ
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1 font-semibold">
              ORIGINAL / ច្បាប់ដើម
            </p>
          </div>
        </div>

        {/* Company Registration & Tax ID (TIN) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 mt-4 pt-3 border-t border-slate-100">
          <div>
            <p><span className="font-bold text-slate-800">VAT TIN / លេខអត្តសញ្ញាណកម្ម អតប:</span> <span className="font-mono font-bold text-slate-900">{company.tin}</span></p>
            <p><span className="font-bold text-slate-800">Address / អាសយដ្ឋាន:</span> {company.address}</p>
          </div>
          <div className="sm:text-right space-y-0.5">
            <p><span className="font-bold text-slate-800">Tel:</span> {company.phone}</p>
            <p><span className="font-bold text-slate-800">Email:</span> {company.email}</p>
          </div>
        </div>
      </div>

      {/* 2. Invoice & Customer Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pb-5 mb-5 border-b border-dashed border-slate-200">
        {/* Customer Information */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Billed To / អតិថិជន
          </p>
          <p className="font-bold text-slate-900 text-sm">{customer.name}</p>
          <p className="text-slate-600"><span className="font-semibold">Phone:</span> {customer.phone}</p>
          <p className="text-slate-600 line-clamp-2"><span className="font-semibold">Delivery Address:</span> {customer.address}</p>
        </div>

        {/* Invoice Meta details */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Invoice Reference / ព័ត៌មានវិក្កយបត្រ
          </p>
          <p className="flex justify-between">
            <span className="text-slate-600">Invoice No:</span>
            <span className="font-mono font-black text-slate-900">{invoiceNumber}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-600">Order ID:</span>
            <span className="font-mono font-bold text-orange-600">#{orderNumber}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-600">Issue Date:</span>
            <span className="font-medium text-slate-800">{formattedDate}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-600">Terminal:</span>
            <span className="font-mono text-[10px] text-slate-500">POS-ONLINE-WEB-01</span>
          </p>
        </div>
      </div>

      {/* 3. Itemized Bill Table */}
      <div className="overflow-x-auto mb-5">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 text-[11px] font-black uppercase text-slate-800 tracking-wider">
              <th className="py-2.5 pr-2 w-8">#</th>
              <th className="py-2.5 px-2">Description / មុខទំនិញ</th>
              <th className="py-2.5 px-2 text-center w-14">Qty</th>
              <th className="py-2.5 px-2 text-right w-20">Price</th>
              <th className="py-2.5 pl-2 text-right w-24">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {items.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-slate-50/50">
                <td className="py-2.5 pr-2 font-mono text-slate-400 text-[11px]">{index + 1}</td>
                <td className="py-2.5 px-2">
                  <div className="font-bold text-slate-900">{item.name}</div>
                  {item.notes && (
                    <div className="text-[10px] text-slate-400 italic">Note: {item.notes}</div>
                  )}
                </td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-900">{item.quantity}</td>
                <td className="py-2.5 px-2 text-right font-mono">{formatUsd(item.unitPrice)}</td>
                <td className="py-2.5 pl-2 text-right font-mono font-bold text-slate-900">
                  {formatUsd(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Financial Calculations & Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 border-t-2 border-slate-900 items-start">
        {/* Left Col: Payment Verification & Official Stamp */}
        <div className="sm:col-span-6 space-y-3">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-xs">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <span>💳</span>
              <span>Payment Info / ព័ត៌មានទូទាត់</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              <span className="font-semibold">Method:</span> {paymentMethod}
            </p>
            {paymentRef && (
              <p className="text-slate-600 text-[11px] font-mono break-all">
                <span className="font-semibold">Ref:</span> {paymentRef}
              </p>
            )}
            <p className="text-slate-600 text-[11px]">
              <span className="font-semibold">Status:</span>{' '}
              <span
                className={`font-black uppercase px-2 py-0.5 rounded-md text-[10px] ${
                  isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {paymentStatus}
              </span>
            </p>
          </div>

          {/* Official Verification Paid Stamp */}
          <div className="relative inline-block border-2 border-dashed border-emerald-600 rounded-xl p-2.5 text-center text-emerald-700 bg-emerald-50/50">
            <div className="text-[10px] font-black uppercase tracking-wider">
              {isPaid ? '✓ OFFICIALLY SETTLED & VERIFIED' : '⏳ COD PAYMENT UPON DELIVERY'}
            </div>
            <div className="text-[11px] font-bold">
              {isPaid ? 'បង់ប្រាក់រួចរាល់ (KHQR)' : 'ទូទាត់ពេលដឹកជញ្ជូនដល់'}
            </div>
            <div className="text-[9px] font-mono text-emerald-600 opacity-80 mt-0.5">
              Ref: {paymentRef || orderNumber} • {formattedDate}
            </div>
          </div>
        </div>

        {/* Right Col: Calculation Totals */}
        <div className="sm:col-span-6 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal / សរុបរង:</span>
            <span className="font-mono font-medium">{formatUsd(subtotal)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee / សេវាដឹកជញ្ជូន:</span>
            <span className="font-mono font-medium">
              {deliveryFee === 0 ? 'FREE' : formatUsd(deliveryFee)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount {voucherCode ? `(${voucherCode})` : ''} / បញ្ចុះតម្លៃ:</span>
              <span className="font-mono">-{formatUsd(discountAmount)}</span>
            </div>
          )}

          {tipAmount > 0 && (
            <div className="flex justify-between text-amber-600 font-medium">
              <span>Courier Tip / ធីបអ្នកដឹក:</span>
              <span className="font-mono">+{formatUsd(tipAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
            <span>VAT (10% Incl.) / ពន្ធអាករ:</span>
            <span className="font-mono">{formatUsd(vatAmount)}</span>
          </div>

          {/* Grand Total in USD */}
          <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-900 text-slate-900">
            <span className="text-sm font-black uppercase">Grand Total (USD):</span>
            <span className="text-lg font-black font-mono text-orange-600">
              {formatUsd(totalAmount)}
            </span>
          </div>

          {/* Grand Total in Khmer Riels */}
          <div className="flex justify-between items-baseline text-slate-700 pb-1">
            <span className="text-xs font-bold">សរុបជាប្រាក់រៀល (KHR):</span>
            <span className="text-sm font-bold font-mono text-slate-900">
              {formatKhr(totalAmountKhr)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 text-right">
            Official Exchange Rate: $1.00 = 4,100 KHR
          </p>
        </div>
      </div>

      {/* 5. Footer Sign-off & Barcode */}
      <div className="mt-8 pt-5 border-t border-slate-200 text-center space-y-2">
        <p className="text-xs font-bold text-slate-800">
          Thank you for choosing BiteCraft Artisan Kitchen! / សូមអរគុណ!
        </p>
        <p className="text-[10px] text-slate-400">
          This document is generated digitally and constitutes a valid electronic commercial invoice. For inquiries, contact support@bitecraft.kitchen or (+855) 23 888 777.
        </p>

        {/* Digital Verification Barcode visual */}
        <div className="pt-2 flex flex-col items-center justify-center opacity-85">
          <div className="font-mono text-[9px] tracking-[0.25em] text-slate-500 uppercase">
            *{invoiceNumber}*
          </div>
          <div className="h-6 w-56 flex items-center justify-between mt-1 px-2 border-y border-slate-300">
            {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1].map((w, i) => (
              <span
                key={i}
                className="bg-slate-800 h-full inline-block"
                style={{ width: `${w * 1.5}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

PrintableInvoice.propTypes = {
  invoice: PropTypes.shape({
    invoiceNumber: PropTypes.string,
    orderNumber: PropTypes.string,
    issueDate: PropTypes.string,
    company: PropTypes.shape({
      name: PropTypes.string,
      khmerName: PropTypes.string,
      tin: PropTypes.string,
      address: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string,
    }),
    customer: PropTypes.shape({
      name: PropTypes.string,
      phone: PropTypes.string,
      address: PropTypes.string,
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        quantity: PropTypes.number,
        unitPrice: PropTypes.number,
        lineTotal: PropTypes.number,
        notes: PropTypes.string,
      })
    ),
    subtotal: PropTypes.number,
    deliveryFee: PropTypes.number,
    discountAmount: PropTypes.number,
    voucherCode: PropTypes.string,
    tipAmount: PropTypes.number,
    vatAmount: PropTypes.number,
    totalAmount: PropTypes.number,
    totalAmountKhr: PropTypes.number,
    paymentMethod: PropTypes.string,
    paymentStatus: PropTypes.string,
    paymentRef: PropTypes.string,
  }),
};
