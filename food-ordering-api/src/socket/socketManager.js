const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO server attached to the HTTP server
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 [Socket] Client connected: ${socket.id}`);

    // Client joins an order room to receive driver location updates and chat
    socket.on('join_order', ({ orderId }) => {
      if (orderId) {
        socket.join(`order_${orderId}`);
        console.log(`📍 [Socket] ${socket.id} joined room order_${orderId}`);
      }
    });

    // Client leaves the order room
    socket.on('leave_order', ({ orderId }) => {
      if (orderId) {
        socket.leave(`order_${orderId}`);
        console.log(`👋 [Socket] ${socket.id} left room order_${orderId}`);
      }
    });

    // Customer or Driver sends a chat message
    socket.on('chat:message', (payload) => {
      const { orderId, text, sender = 'customer', senderName = 'Customer', type = 'text', photoUrl = null } = payload || {};
      if (!orderId || (!text && !photoUrl)) return;

      const messageObj = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderId,
        sender,
        senderName: sender === 'customer' ? senderName : 'Sok Dara (Express Rider)',
        senderRole: sender === 'customer' ? 'Customer' : 'Driver',
        senderAvatar: sender === 'customer'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
        text: text || '',
        type,
        photoUrl,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      };

      // Broadcast message to everyone in the order room (including sender)
      io.to(`order_${orderId}`).emit('chat:message', messageObj);
      console.log(`💬 [Chat] ${senderName} (${sender}) -> order_${orderId}: "${text || '[photo]'}"`);

      // If customer sent the message, simulate realistic driver reply after realistic delay
      if (sender === 'customer') {
        setTimeout(() => {
          // 1. Emit typing indicator
          io.to(`order_${orderId}`).emit('chat:typing', {
            orderId,
            isTyping: true,
            driverName: 'Sok Dara',
          });

          setTimeout(() => {
            // Stop typing
            io.to(`order_${orderId}`).emit('chat:typing', {
              orderId,
              isTyping: false,
              driverName: 'Sok Dara',
            });

            // Formulate contextual driver response
            const lower = (text || '').toLowerCase();
            let driverReply = "Thank you! I'm on my way to your location with your food hot and fresh. 🛵💨";

            if (lower.includes('lobby') || lower.includes('waiting')) {
              driverReply = "Got it! I will meet you right in front of the building lobby. See you in a few minutes! 🏢";
            } else if (lower.includes('door') || lower.includes('gate') || lower.includes('leave')) {
              driverReply = "Noted! I'll place the package securely at your door/gate and take a photo confirmation. 🚪📦";
            } else if (lower.includes('call') || lower.includes('phone') || lower.includes('arrive')) {
              driverReply = "Understood! I'll ring your phone number as soon as I pull up to the address. 📞";
            } else if (lower.includes('bell') || lower.includes('knock')) {
              driverReply = "Got it! I'll ring the doorbell as requested. 🔔";
            } else if (lower.includes('chili') || lower.includes('sauce') || lower.includes('lime') || lower.includes('condiment')) {
              driverReply = "I checked with the kitchen and they packed extra chili and sauces for you! 🌶️🥢";
            } else if (lower.includes('where') || lower.includes('eta') || lower.includes('long')) {
              driverReply = "Currently passing through Norodom Boulevard, traffic is smooth. ETA approx 5-8 mins! ⚡";
            } else if (lower.includes('thank')) {
              driverReply = "You're very welcome! Happy to serve you anytime. Enjoy your delicious meal! 😊🙏";
            }

            const driverMsgObj = {
              id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              orderId,
              sender: 'driver',
              senderName: 'Sok Dara (Express Rider)',
              senderRole: 'Driver',
              senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
              text: driverReply,
              type: 'text',
              photoUrl: null,
              timestamp: new Date().toISOString(),
              status: 'delivered',
            };

            io.to(`order_${orderId}`).emit('chat:message', driverMsgObj);
          }, 1400);
        }, 1000);
      }
    });

    // Client/driver typing indicator
    socket.on('chat:typing', ({ orderId, isTyping, sender = 'customer' }) => {
      if (orderId) {
        socket.to(`order_${orderId}`).emit('chat:typing', {
          orderId,
          isTyping,
          sender,
        });
      }
    });

    // --- Group Order Real-Time Collaborative Rooms ---
    socket.on('group:join', ({ groupId, member }) => {
      if (groupId) {
        socket.join(`group_${groupId}`);
        console.log(`👥 [GroupOrder] ${member?.name || socket.id} joined group_${groupId}`);
        socket.to(`group_${groupId}`).emit('group:member_joined', { member });
      }
    });

    socket.on('group:leave', ({ groupId, memberId }) => {
      if (groupId) {
        socket.leave(`group_${groupId}`);
        console.log(`👋 [GroupOrder] ${memberId || socket.id} left group_${groupId}`);
        socket.to(`group_${groupId}`).emit('group:member_left', { memberId });
      }
    });

    socket.on('group:sync', ({ groupId, groupOrder }) => {
      if (groupId && groupOrder) {
        socket.to(`group_${groupId}`).emit('group:updated', groupOrder);
      }
    });

    socket.on('group:lock', ({ groupId, isLocked }) => {
      if (groupId) {
        io.to(`group_${groupId}`).emit('group:locked', { groupId, isLocked });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ [Socket] Client disconnected: ${socket.id}`);
    });
  });

  console.log('🔌 [Socket] Socket.IO server initialized');
  return io;
};

/**
 * Get the Socket.IO server instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };
