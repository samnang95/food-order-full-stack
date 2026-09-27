import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { HomeView } from '../features/home/home_view';
import { MenuView } from '../features/menu/menu_view';
import { OrdersView } from '../features/orders/orders_view';
import { FavoritesView } from '../features/favorites';
import { CheckoutView } from '../features/checkout';
import { ProfileView } from '../features/profile';
import { NotFoundView } from '../components/common/NotFoundView';
import { AppRoutes } from './app_routes';

export const appRouter = createBrowserRouter([
  {
    path: AppRoutes.ROOT,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomeView />,
      },
      {
        path: 'menu',
        element: <MenuView />,
      },
      {
        path: 'orders',
        element: <OrdersView />,
      },
      {
        path: 'favorites',
        element: <FavoritesView />,
      },
      {
        path: 'checkout',
        element: <CheckoutView />,
      },
      {
        path: 'profile',
        element: <ProfileView />,
      },
      {
        path: '*',
        element: <NotFoundView />,
      },
    ],
  },
]);
