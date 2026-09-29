import { LocalDB } from '../../../core';

const TICKETS_KEY = 'bitecraft_support_tickets';

export class SupportLocalDataSource {
  async getTickets() {
    const data = LocalDB.getJSON(TICKETS_KEY, []);
    return Array.isArray(data) ? data : [];
  }

  async saveTicket(ticket) {
    if (!ticket) return null;
    const existing = await this.getTickets();
    const updated = [ticket, ...existing.filter((t) => t.ticketNumber !== ticket.ticketNumber && t.id !== ticket.id)];
    LocalDB.setJSON(TICKETS_KEY, updated);
    return ticket;
  }

  async saveTickets(tickets = []) {
    LocalDB.setJSON(TICKETS_KEY, tickets);
    return tickets;
  }
}

export const supportLocalDataSource = new SupportLocalDataSource();
