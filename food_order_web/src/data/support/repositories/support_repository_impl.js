import { supportRemoteDataSource } from '../datasources/support_remote_datasource';
import { supportLocalDataSource } from '../datasources/support_local_datasource';

export class SupportRepositoryImpl {
  constructor({
    localDataSource = supportLocalDataSource,
    remoteDataSource = supportRemoteDataSource,
  } = {}) {
    this.localDataSource = localDataSource;
    this.remoteDataSource = remoteDataSource;
  }

  async getFaqs(category) {
    try {
      const faqs = await this.remoteDataSource.getFaqs(category);
      if (Array.isArray(faqs) && faqs.length > 0) return faqs;
    } catch (err) {
      console.debug('[SupportRepo] Remote FAQs failed, using fallback:', err.message);
    }
    return [];
  }

  async getTickets(filter = {}) {
    try {
      const remoteTickets = await this.remoteDataSource.getTickets(filter);
      if (Array.isArray(remoteTickets) && remoteTickets.length > 0) {
        await this.localDataSource.saveTickets(remoteTickets);
        return remoteTickets;
      }
    } catch (err) {
      console.debug('[SupportRepo] Remote tickets failed, using local cache:', err.message);
    }
    return await this.localDataSource.getTickets();
  }

  async getTicketByNumber(ticketNumber) {
    try {
      const ticket = await this.remoteDataSource.getTicketByNumber(ticketNumber);
      if (ticket) return ticket;
    } catch (err) {
      console.debug('[SupportRepo] Remote ticket by number failed:', err.message);
    }
    const localList = await this.localDataSource.getTickets();
    return localList.find((t) => t.ticketNumber === ticketNumber) || null;
  }

  async createTicket(ticketData) {
    try {
      const created = await this.remoteDataSource.createTicket(ticketData);
      if (created) {
        await this.localDataSource.saveTicket(created);
        return created;
      }
    } catch (err) {
      console.warn('[SupportRepo] Remote ticket creation failed, saving locally:', err.message);
    }

    // Local fallback creation
    const localTicket = {
      id: `tkt_${Date.now()}`,
      ticketNumber: `BC-TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: ticketData.customerName || 'BiteCraft Foodie',
      orderNumber: ticketData.orderNumber || 'BC-ORDER',
      category: ticketData.category || 'Order Issue',
      issueType: ticketData.issueType || 'Missing Item',
      subject: ticketData.subject || 'Order Support Ticket',
      description: ticketData.description,
      requestedResolution: ticketData.requestedResolution || 'Instant Wallet Refund',
      status: 'OPEN',
      priority: ticketData.priority || 'HIGH',
      photos: ticketData.photos || [],
      resolutionNote: '',
      createdAt: new Date().toISOString(),
    };

    await this.localDataSource.saveTicket(localTicket);
    return localTicket;
  }
}

export const supportRepository = new SupportRepositoryImpl();
