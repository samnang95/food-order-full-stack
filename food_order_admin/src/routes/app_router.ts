import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { AppRoutes } from './app_routes';
import DashboardView from '../features/dashboard/views/DashboardView.vue';
import OrdersView from '../features/orders/views/OrdersView.vue';
import MenuView from '../features/menu/views/MenuView.vue';
import CategoriesView from '../features/categories/views/CategoriesView.vue';
import CustomersView from '../features/customers/views/CustomersView.vue';
import SettingsView from '../features/settings/views/SettingsView.vue';
import { VouchersView } from '../features/vouchers';
import { KdsView } from '../features/kds';
import { LoginView } from '../features/auth';
import { LocalDB } from '../core/db/local_db';
import { DBKeys } from '../core/db/db_keys';

const routes: RouteRecordRaw[] = [
  {
    path: AppRoutes.LOGIN,
    name: 'login',
    component: LoginView,
    meta: { title: 'Sign In • FoodHub Operations Hub', guestOnly: true },
  },
  {
    path: AppRoutes.ROOT,
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'Dashboard Overview • FoodHub', requiresAuth: true },
  },
  {
    path: AppRoutes.ORDERS,
    name: 'orders',
    component: OrdersView,
    meta: { title: 'Live Orders & Operations • FoodHub', requiresAuth: true },
  },
  {
    path: AppRoutes.KDS,
    name: 'kds',
    component: KdsView,
    meta: { title: 'Kitchen Display System (KDS) • FoodHub', requiresAuth: true },
  },
  {
    path: AppRoutes.MENU,
    name: 'menu',
    component: MenuView,
    meta: { title: 'Menu & Food Catalog • FoodHub', requiresAuth: true },
  },
  {
    path: AppRoutes.CATEGORIES,
    name: 'categories',
    component: CategoriesView,
    meta: { title: 'Food Categories • FoodHub', requiresAuth: true },
  },
  {
    path: AppRoutes.CUSTOMERS,
    name: 'customers',
    component: CustomersView,
    meta: { title: 'Customer Directory • FoodHub', requiresAuth: true },
  },
  {
    path: AppRoutes.VOUCHERS,
    name: 'vouchers',
    component: VouchersView,
    meta: { title: 'Vouchers & Promotions • FoodHub', requiresAuth: true },
  },
  {
    path: AppRoutes.SETTINGS,
    name: 'settings',
    component: SettingsView,
    meta: { title: 'Settings & API Config • FoodHub', requiresAuth: true },
  },
  {
    path: AppRoutes.NOT_FOUND,
    redirect: AppRoutes.ROOT,
  },
];

export const appRouter = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guards: Protect private routes & redirect authenticated users from login
appRouter.beforeEach((to, _from, next) => {
  const token = LocalDB.getString(DBKeys.AUTH_TOKEN);
  const isAuthenticated = Boolean(token && token.length > 5);

  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  // If user is logged in and navigates to login, redirect to root dashboard
  if (to.meta.guestOnly && isAuthenticated) {
    return next({ path: AppRoutes.ROOT });
  }

  // If route requires auth and user is NOT logged in, redirect to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({
      path: AppRoutes.LOGIN,
      query: { redirect: to.fullPath !== AppRoutes.ROOT ? to.fullPath : undefined },
    });
  }

  next();
});

export default appRouter;
