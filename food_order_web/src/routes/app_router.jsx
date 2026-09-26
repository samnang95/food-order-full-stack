import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { OrdersView } from '../features/orders/orders_view';
import { MenuView } from '../features/menu/menu_view';
import { NotFoundView } from '../components/common/NotFoundView';
import { AppRoutes } from './app_routes';

export const appRouter = createBrowserRouter([
  {
    path: AppRoutes.ROOT,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={AppRoutes.ORDERS} replace />,
      },
      {
        path: 'orders',
        element: <OrdersView />,
      },
      {
        path: 'menu',
        element: <MenuView />,
      },
      {
        path: '*',
        element: <NotFoundView />,
      },
    ],
  },
]);
