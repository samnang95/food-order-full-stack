import { io } from 'socket.io-client';
import { AppConfig } from '../config/app_config';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(url = AppConfig.socketUrl) {
    if (this.socket) return this.socket;

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('⚡ [SocketService] Connected to real-time server:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('⚠️ [SocketService] Disconnected from real-time server');
    });

    return this.socket;
  }

  onOrderStatusChanged(callback) {
    if (!this.socket) this.connect();
    this.socket.on('order_status_changed', callback);
  }

  onPushNotification(callback) {
    if (!this.socket) this.connect();
    this.socket.on('push_notification', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const socketService = new SocketService();
