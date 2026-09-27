/**
 * UseCase to generate a formal tax invoice and receipt for an order.
 */
export class GenerateInvoiceUseCase {
  constructor(invoiceRepository) {
    this.invoiceRepository = invoiceRepository;
  }

  async execute(order) {
    if (!order) {
      throw new Error('Order is required to generate an invoice.');
    }
    return this.invoiceRepository.generateInvoice(order);
  }
}
