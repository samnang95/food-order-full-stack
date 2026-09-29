const supportService = require('../services/supportService');

const createTicket = async (req, res) => {
  try {
    const ticketData = { ...req.body };
    if (req.user) {
      ticketData.userId = req.user.id || req.user._id;
      ticketData.customerName = req.user.username || ticketData.customerName;
      ticketData.customerEmail = req.user.email || ticketData.customerEmail;
    }

    const ticket = await supportService.createTicket(ticketData);
    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully',
      ticket,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getTickets = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.query.userId;
    const { orderId, status } = req.query;
    const tickets = await supportService.getTickets({ userId, orderId, status });
    res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTicketByNumber = async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const ticket = await supportService.getTicketByNumber(ticketNumber);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote } = req.body;
    const updated = await supportService.updateTicketStatus(id, { status, resolutionNote });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, message: 'Ticket status updated', ticket: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getFaqs = async (req, res) => {
  try {
    const { category } = req.query;
    const faqs = await supportService.getFaqs(category);
    res.json({
      success: true,
      count: faqs.length,
      faqs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketByNumber,
  updateTicketStatus,
  getFaqs,
};
