import { InvoiceEntity } from '../../../domain/invoices/entities/invoice_entity';

export class InvoiceModel extends InvoiceEntity {
  /**
   * Constructs an InvoiceModel from a raw order entity / API JSON object.
   * @param {Object} order
   * @returns {InvoiceModel}
   */
  static fromOrder(order) {
    if (!order) return null;

    const rawId = order._id || order.id || `ord_${Date.now()}`;
    const shortRef = order.orderNumber || String(rawId).slice(-6).toUpperCase();
    const orderYear = new Date(order.createdAt || Date.now()).getFullYear();
    const invoiceNumber = `BC-INV-${orderYear}-${shortRef}`;

    const items = (Array.isArray(order.items) ? order.items : []).map((it, idx) => {
      const foodName =
        it.foodName ||
        it.food?.name ||
        it.name ||
        `Delicious Dish #${idx + 1}`;
      const quantity = Number(it.quantity) || 1;
      const unitPrice = Number(it.price || it.food?.price || 0);
      const lineTotal = Math.round(quantity * unitPrice * 100) / 100;
      const notes = it.notes || '';

      return {
        id: it._id || it.id || `item_${idx}`,
        name: foodName,
        quantity,
        unitPrice,
        lineTotal,
        notes,
      };
    });

    const subtotal =
      items.reduce((acc, it) => acc + it.lineTotal, 0) ||
      Number(order.subtotal || order.totalPrice || 0);

    const deliveryFee = Number(order.deliveryFee ?? (subtotal >= 25 ? 0 : 1.5));
    const discountAmount = Number(order.discountAmount || 0);
    const voucherCode = order.voucherCode || null;
    const tipAmount = Number(order.tipAmount || 0);

    const grandTotal =
      Number(order.totalAmount || order.totalPrice) ||
      Math.max(0, Math.round((subtotal + deliveryFee - discountAmount + tipAmount) * 100) / 100);

    // Cambodia 10% VAT calculation (included in bill)
    const vatRate = 0.10;
    const vatAmount = Math.round(((subtotal / (1 + vatRate)) * vatRate) * 100) / 100;
    const totalAmountKhr = Math.round(grandTotal * 4100);

    const customer = {
      name:
        order.user?.name ||
        order.user?.username ||
        order.customerName ||
        'Valued Foodie',
      phone:
        order.user?.phone ||
        order.customerPhone ||
        '012 888 999',
      address:
        order.deliveryAddress ||
        'Phnom Penh, Cambodia',
    };

    const isKhqr =
      order.paymentMethod === 'bakong_khqr' ||
      order.paymentMethod === 'khqr' ||
      order.paymentMethod === 'KHQR';

    const paymentMethodLabel = isKhqr ? 'Bakong KHQR' : 'Cash on Delivery';
    const paymentStatus = (order.paymentStatus || (isKhqr ? 'completed' : 'pending')).toUpperCase();
    const paymentRef =
      order.paymentRef ||
      order.transactionId ||
      (isKhqr ? `KHQR-TXN-${shortRef}` : `COD-REF-${shortRef}`);

    return new InvoiceModel({
      invoiceNumber,
      orderId: rawId,
      orderNumber: shortRef,
      issueDate: order.createdAt || new Date().toISOString(),
      customer,
      items,
      subtotal,
      deliveryFee,
      discountAmount,
      voucherCode,
      tipAmount,
      vatRate,
      vatAmount,
      totalAmount: grandTotal,
      totalAmountKhr,
      paymentMethod: paymentMethodLabel,
      paymentStatus,
      paymentRef,
      status: order.status || 'completed',
    });
  }
}
