import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { HomeView } from '../features/home/home_view';
import { MenuView } from '../features/menu/menu_view';
import { OrdersView, OrderDetailView } from '../features/orders';
import { CategoriesView, CategoryDetailView } from '../features/categories';
import { SearchView } from '../features/search';
import { VouchersView } from '../features/vouchers';
import { FavoritesView } from '../features/favorites';
import { CheckoutView } from '../features/checkout';
import { ProfileView } from '../features/profile';
import { NotificationsView } from '../features/notifications';
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
        path: 'categories',
        element: <CategoriesView />,
      },
      {
        path: 'category/:id',
        element: <CategoryDetailView />,
      },
      {
        path: 'search',
        element: <SearchView />,
      },
      {
        path: 'vouchers',
        element: <VouchersView />,
      },
      {
        path: 'orders',
        element: <OrdersView />,
      },
      {
        path: 'orders/:id',
        element: <OrderDetailView />,
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
        path: 'notifications',
        element: <NotificationsView />,
      },
      {
        path: '*',
        element: <NotFoundView />,
      },
    ],
  },
]);
