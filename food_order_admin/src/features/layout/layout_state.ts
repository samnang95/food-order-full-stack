export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  unread: boolean;
  type: 'order' | 'warning' | 'info';
}

export interface LayoutState {
  isSidebarCollapsed: boolean;
  restaurantStatus: 'open' | 'busy' | 'closed';
  apiStatus: 'connected' | 'checking' | 'offline';
  soundEnabled: boolean;
  notifications: NotificationItem[];
}

export const initialLayoutState: LayoutState = {
  isSidebarCollapsed: false,
  restaurantStatus: 'open',
  apiStatus: 'connected',
  soundEnabled: true,
  notifications: [
    { id: '1', title: 'New Order #FD-8942 received!', time: '3m ago', unread: true, type: 'order' },
    { id: '2', title: 'Matcha Lava Cheesecake is low on stock', time: '22m ago', unread: true, type: 'warning' },
    { id: '3', title: 'Driver assigned to Order #FD-8940', time: '28m ago', unread: false, type: 'info' },
  ],
};
