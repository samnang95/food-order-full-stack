import { io, Socket } from 'socket.io-client';
import { AppConfig } from '../config/app_config';

class AdminSocketService {
  private socket: Socket | null = null;
  public isConnected: boolean = false;

  connect(url: string = AppConfig.socketUrl): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.connect();
      return this.socket;
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('⚡ [AdminSocket] Connected to real-time server:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('⚠️ [AdminSocket] Disconnected from real-time server');
    });

    return this.socket;
  }

  onOrderCreated(callback: (order: any) => void): () => void {
    if (!this.socket) this.connect();
    const handler = (data: any) => callback(data);
    this.socket?.on('order:created', handler);
    this.socket?.on('order_created', handler);
    return () => {
      this.socket?.off('order:created', handler);
      this.socket?.off('order_created', handler);
    };
  }

  onOrderStatusChanged(callback: (data: any) => void): () => void {
    if (!this.socket) this.connect();
    const handler = (data: any) => callback(data);
    this.socket?.on('order_status_changed', handler);
    this.socket?.on('order:status_updated', handler);
    return () => {
      this.socket?.off('order_status_changed', handler);
      this.socket?.off('order:status_updated', handler);
    };
  }

  onPushNotification(callback: (notif: any) => void): () => void {
    if (!this.socket) this.connect();
    const handler = (data: any) => callback(data);
    this.socket?.on('push_notification', handler);
    return () => {
      this.socket?.off('push_notification', handler);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const adminSocketService = new AdminSocketService();
