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

    // Client joins an order room to receive driver location updates
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
