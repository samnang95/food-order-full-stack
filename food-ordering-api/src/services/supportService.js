const mongoose = require('mongoose');
const SupportTicket = require('../models/supportTicketModel');
const User = require('../models/userModel');

const FAQS_CATALOG = [
  {
    id: 'faq_delivery_zones',
    category: 'Orders & Delivery',
    question: 'Which areas in Phnom Penh does BiteCraft deliver to?',
    answer: 'We deliver throughout central Phnom Penh including Boeng Keng Kang (BKK1, BKK2, BKK3), Chamkarmon, Daun Penh, Riverside, Tuol Tom Poung (Russian Market), Toul Kork, and 7 Makara. Estimated delivery time is typically 25 to 35 minutes depending on traffic and weather conditions.',
    helpfulVotes: 48,
  },
  {
    id: 'faq_missing_items',
    category: 'Orders & Delivery',
    question: 'What should I do if an item is missing or my order arrived damaged?',
    answer: 'You can immediately submit an Order Issue Report right from your order detail page or our Help Center. Select your affected order, choose the issue type (such as Missing Item or Damaged Packaging), upload a quick photo, and choose whether you prefer an Instant BiteCraft Wallet Refund, Redelivery, or Voucher Compensation. Our support team reviews and resolves requests in under 10 minutes.',
    helpfulVotes: 72,
  },
  {
    id: 'faq_track_order',
    category: 'Orders & Delivery',
    question: 'How do I track my delivery rider in real time?',
    answer: 'Once your order is confirmed and prepared by our kitchen, visit the Orders page and click "Live Courier Map & Route" or navigate to /tracking/:orderId. You will see your driver live on the Phnom Penh GPS map, estimated minutes of arrival, rider vehicle details, and can chat directly with your driver using our real-time in-app chat.',
    helpfulVotes: 65,
  },
  {
    id: 'faq_payment_methods',
    category: 'Payments & Refunds',
    question: 'Which payment methods are supported on BiteCraft?',
    answer: 'We support Bakong KHQR (accepted across all 35+ Cambodian banks including ABA, ACLEDA, Canadia, Wing), Cash on Delivery (COD) in both USD and Cambodian Riel (៛), and major international credit/debit cards.',
    helpfulVotes: 89,
  },
  {
    id: 'faq_refund_timeline',
    category: 'Payments & Refunds',
    question: 'How long do refunds take to process?',
    answer: 'Wallet refunds are instantaneous upon customer support approval. For Bakong KHQR or credit card transactions, refunds are issued back to your originating bank account within 1 to 2 business days.',
    helpfulVotes: 41,
  },
  {
    id: 'faq_rewards_points',
    category: 'Vouchers & Rewards',
    question: 'How do I earn and redeem BitePoints?',
    answer: 'You earn 10 BitePoints for every $1 spent on BiteCraft, plus bonus points for daily check-in streaks and verified food reviews. You can exchange points for free delivery passes ($3 value for 150 pts), 15% discount vouchers, or gourmet chef burgers on our dedicated /rewards page.',
    helpfulVotes: 54,
  },
  {
    id: 'faq_dietary_allergens',
    category: 'Food Quality',
    question: 'How can I filter food for dietary restrictions or food allergies?',
    answer: 'Click the Chef Hat & Dietary icon in the navigation bar to customize your active dietary preferences (Halal, Vegetarian, Vegan, Gluten-Free, Keto, High Protein). Our kitchen automatically flags any dishes containing your designated allergens (peanuts, shellfish, dairy, gluten, eggs).',
    helpfulVotes: 36,
  },
  {
    id: 'faq_contact_hotline',
    category: 'Customer Support',
    question: 'How can I speak to a live support agent right now?',
    answer: 'Our customer care operations center is open 7 days a week from 8:00 AM to 11:30 PM. You can call our hotline at +855 23 999 888, reach us on Telegram @BiteCraftSupport, or submit a support ticket right here on this page.',
    helpfulVotes: 93,
  },
];

const resolveUserId = async (rawUserId) => {
  if (rawUserId && mongoose.Types.ObjectId.isValid(rawUserId)) {
    return rawUserId;
  }
  let user = await User.findOne({ username: 'Pozz nang' });
  if (!user) user = await User.findOne();
  return user ? user._id : null;
};

const createTicket = async (ticketData) => {
  const uid = await resolveUserId(ticketData.userId);
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const ticketNumber = `BC-TKT-${randomSuffix}`;

  const ticket = await SupportTicket.create({
    ticketNumber,
    userId: uid,
    customerName: ticketData.customerName || 'BiteCraft Foodie',
    customerPhone: ticketData.customerPhone || '',
    customerEmail: ticketData.customerEmail || '',
    orderId: ticketData.orderId || '',
    orderNumber: ticketData.orderNumber || (ticketData.orderId ? ticketData.orderId.toString().slice(-6).toUpperCase() : ''),
    category: ticketData.category || 'Order Issue',
    issueType: ticketData.issueType || 'Missing Item',
    subject: ticketData.subject || `${ticketData.issueType || 'Issue'} on Order #${ticketData.orderNumber || 'BC-ORDER'}`,
    description: ticketData.description,
    requestedResolution: ticketData.requestedResolution || 'Instant Wallet Refund',
    status: 'OPEN',
    priority: ticketData.priority || 'HIGH',
    photos: Array.isArray(ticketData.photos) ? ticketData.photos : [],
  });

  return ticket;
};

const getTickets = async (filter = {}) => {
  const query = {};
  if (filter.userId && mongoose.Types.ObjectId.isValid(filter.userId)) {
    query.userId = filter.userId;
  }
  if (filter.orderId) {
    query.orderId = filter.orderId;
  }
  if (filter.status) {
    query.status = filter.status.toUpperCase();
  }

  let tickets = await SupportTicket.find(query).sort({ createdAt: -1 });

  // If user has zero tickets, seed a demonstration resolved welcome ticket
  if (tickets.length === 0 && !filter.orderId) {
    const uid = await resolveUserId(filter.userId);
    const demoTicket = await SupportTicket.create({
      ticketNumber: 'BC-TKT-10824',
      userId: uid,
      customerName: 'Pozz nang',
      orderNumber: 'ORD-7291',
      category: 'Order Issue',
      issueType: 'Missing Item',
      subject: 'Missing artisan truffle mayo dip',
      description: 'The smash burger and fries were hot and delicious, but the side truffle mayo was missing from the bag.',
      requestedResolution: 'Instant Wallet Refund',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      resolutionNote: 'Support team approved $1.50 instant credit to your BiteCraft wallet + 50 complimentary BitePoints.',
      resolvedAt: new Date(Date.now() - 3600000 * 2),
    });
    tickets = [demoTicket];
  }

  return tickets;
};

const getTicketByNumber = async (ticketNumber) => {
  return await SupportTicket.findOne({ ticketNumber });
};

const updateTicketStatus = async (ticketId, { status, resolutionNote }) => {
  const updateData = {};
  if (status) updateData.status = status.toUpperCase();
  if (resolutionNote !== undefined) updateData.resolutionNote = resolutionNote;
  if (status === 'RESOLVED' || status === 'CLOSED') {
    updateData.resolvedAt = new Date();
  }

  return await SupportTicket.findByIdAndUpdate(ticketId, updateData, { new: true });
};

const getFaqs = async (category) => {
  if (category && category !== 'All') {
    return FAQS_CATALOG.filter((f) => f.category.toLowerCase() === category.toLowerCase());
  }
  return FAQS_CATALOG;
};

module.exports = {
  createTicket,
  getTickets,
  getTicketByNumber,
  updateTicketStatus,
  getFaqs,
};
