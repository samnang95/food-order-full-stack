import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { NotFoundView } from '../components/common/NotFoundView';
import { AppRoutes } from './app_routes';

export const appRouter = createBrowserRouter([
  {
    path: AppRoutes.ROOT,
    element: <MainLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomeView } = await import('../features/home/home_view');
          return { Component: HomeView };
        },
      },
      {
        path: 'menu',
        lazy: async () => {
          const { MenuView } = await import('../features/menu/menu_view');
          return { Component: MenuView };
        },
      },
      {
        path: 'categories',
        lazy: async () => {
          const { CategoriesView } = await import('../features/categories/categories_view');
          return { Component: CategoriesView };
        },
      },
      {
        path: 'category/:id',
        lazy: async () => {
          const { CategoryDetailView } = await import('../features/categories/category_detail_view');
          return { Component: CategoryDetailView };
        },
      },
      {
        path: 'search',
        lazy: async () => {
          const { SearchView } = await import('../features/search/search_view');
          return { Component: SearchView };
        },
      },
      {
        path: 'vouchers',
        lazy: async () => {
          const { VouchersView } = await import('../features/vouchers/vouchers_view');
          return { Component: VouchersView };
        },
      },
      {
        path: 'orders',
        lazy: async () => {
          const { OrdersView } = await import('../features/orders/orders_view');
          return { Component: OrdersView };
        },
      },
      {
        path: 'orders/:id',
        lazy: async () => {
          const { OrderDetailView } = await import('../features/orders/order_detail_view');
          return { Component: OrderDetailView };
        },
      },
      {
        path: 'favorites',
        lazy: async () => {
          const { FavoritesView } = await import('../features/favorites/favorites_view');
          return { Component: FavoritesView };
        },
      },
      {
        path: 'checkout',
        lazy: async () => {
          const { CheckoutView } = await import('../features/checkout/checkout_view');
          return { Component: CheckoutView };
        },
      },
      {
        path: 'profile',
        lazy: async () => {
          const { ProfileView } = await import('../features/profile/profile_view');
          return { Component: ProfileView };
        },
      },
      {
        path: 'notifications',
        lazy: async () => {
          const { NotificationsView } = await import('../features/notifications/notifications_view');
          return { Component: NotificationsView };
        },
      },
      {
        path: 'tracking/:id',
        lazy: async () => {
          const { TrackingView } = await import('../features/delivery_tracking/tracking_view');
          return { Component: TrackingView };
        },
      },
      {
        path: 'settings',
        lazy: async () => {
          const { SettingsView } = await import('../features/settings/settings_view');
          return { Component: SettingsView };
        },
      },
      {
        path: '*',
        element: <NotFoundView />,
      },
    ],
  },
]);
