import { ApiClient } from '../../../core/services/api_client';

export class SupportRemoteDataSource {
  async getFaqs(category) {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    const res = await ApiClient.get(`/support/faqs${query}`);
    return Array.isArray(res?.faqs) ? res.faqs : [];
  }

  async getTickets(filter = {}) {
    const params = new URLSearchParams();
    if (filter.orderId) params.set('orderId', filter.orderId);
    if (filter.status) params.set('status', filter.status);

    const queryString = params.toString();
    const endpoint = `/support/tickets${queryString ? `?${queryString}` : ''}`;
    const res = await ApiClient.get(endpoint);
    return Array.isArray(res?.tickets) ? res.tickets : [];
  }

  async getTicketByNumber(ticketNumber) {
    const res = await ApiClient.get(`/support/tickets/${ticketNumber}`);
    return res?.ticket || null;
  }

  async createTicket(ticketData) {
    const res = await ApiClient.post('/support/tickets', ticketData);
    return res?.ticket || null;
  }

  async updateTicketStatus(id, { status, resolutionNote }) {
    const res = await ApiClient.patch(`/support/tickets/${id}/status`, { status, resolutionNote });
    return res?.ticket || null;
  }
}

export const supportRemoteDataSource = new SupportRemoteDataSource();
