import { InvoiceRepository } from '../../../domain/invoices/repositories/invoice_repository';
import { InvoiceModel } from '../models/invoice_model';

export class InvoiceRepositoryImpl extends InvoiceRepository {
  async generateInvoice(order) {
    if (!order) {
      throw new Error('Order data is required to construct invoice.');
    }
    return InvoiceModel.fromOrder(order);
  }
}
