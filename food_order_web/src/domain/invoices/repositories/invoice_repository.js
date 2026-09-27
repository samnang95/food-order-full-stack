/**
 * Abstract repository interface for Invoices.
 */
export class InvoiceRepository {
  /**
   * Generates a tax invoice entity from an order.
   * @param {Object} order
   * @returns {Promise<import('../entities/invoice_entity').InvoiceEntity>}
   */
  async generateInvoice() {
    throw new Error('InvoiceRepository.generateInvoice() not implemented');
  }
}
