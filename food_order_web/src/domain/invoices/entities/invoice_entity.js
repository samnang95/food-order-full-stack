export class InvoiceEntity {
  constructor({
    invoiceNumber,
    orderId,
    orderNumber,
    issueDate,
    company,
    customer,
    items = [],
    subtotal = 0,
    deliveryFee = 0,
    discountAmount = 0,
    voucherCode = null,
    tipAmount = 0,
    vatRate = 0.10,
    vatAmount = 0,
    totalAmount = 0,
    totalAmountKhr = 0,
    paymentMethod = 'cash',
    paymentStatus = 'pending',
    paymentRef = null,
    status = 'completed',
  }) {
    this.invoiceNumber = invoiceNumber;
    this.orderId = orderId;
    this.orderNumber = orderNumber;
    this.issueDate = issueDate || new Date().toISOString();
    this.company = company || {
      name: 'BiteCraft Artisan Kitchen & Delivery Co., Ltd.',
      khmerName: 'បៃត៍ក្រាហ្វ អាកទិសាន ឃីតឆិន & ដេលីវើរី ឯ.ក',
      tin: 'K001-902488192',
      address: 'Building 45, Street 302, Sangkat Boeng Keng Kang 1, Khan Boeng Keng Kang, Phnom Penh',
      khmerAddress: 'អគារលេខ ៤៥ ផ្លូវ ៣០២ សង្កាត់បឹងកេងកង១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ',
      phone: '+855 (0) 23 888 777 / 012 888 999',
      email: 'support@bitecraft.kitchen',
      website: 'https://bitecraft.kitchen',
    };
    this.customer = customer || {
      name: 'Valued Customer',
      phone: '012 888 999',
      address: 'Phnom Penh, Cambodia',
    };
    this.items = items;
    this.subtotal = Number(subtotal) || 0;
    this.deliveryFee = Number(deliveryFee) || 0;
    this.discountAmount = Number(discountAmount) || 0;
    this.voucherCode = voucherCode;
    this.tipAmount = Number(tipAmount) || 0;
    this.vatRate = Number(vatRate) || 0.10;
    this.vatAmount = Number(vatAmount) || 0;
    this.totalAmount = Number(totalAmount) || 0;
    this.totalAmountKhr = Number(totalAmountKhr) || Math.round(this.totalAmount * 4100);
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus;
    this.paymentRef = paymentRef;
    this.status = status;
  }
}
