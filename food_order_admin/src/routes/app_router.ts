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
import { ReviewsView } from '../features/reviews';
import { StaffView } from '../features/staff';
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
    path: AppRoutes.REVIEWS,
    name: 'reviews',
    component: ReviewsView,
    meta: { title: 'Reviews & Reputation • FoodHub', requiresAuth: true },
  },
  {
    path: AppRoutes.STAFF,
    name: 'staff',
    component: StaffView,
    meta: { title: 'Staff & Team Management • FoodHub', requiresAuth: true },
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

import type { User } from '../domain/auth/entities/user';
import { isRouteAllowedForRole, getRoleConfig } from '../core/auth/rbac';

// Navigation Guards: Protect private routes & enforce Role-Based Access Control
appRouter.beforeEach((to, _from, next) => {
  const token = LocalDB.getString(DBKeys.AUTH_TOKEN);
  const isAuthenticated = Boolean(token && token.length > 5);
  const user = LocalDB.getJson<User>(DBKeys.USER_PROFILE);
  const userRole = user?.role || 'admin';
  const roleConfig = getRoleConfig(userRole);

  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  // If user is already logged in and navigates to login, redirect to role's default home
  if (to.meta.guestOnly && isAuthenticated) {
    return next({ path: roleConfig.defaultRoute });
  }

  // If route requires auth and user is NOT logged in, redirect to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({
      path: AppRoutes.LOGIN,
      query: { redirect: to.fullPath !== AppRoutes.ROOT ? to.fullPath : undefined },
    });
  }

  // If route requires auth and user IS logged in, verify role permissions
  if (to.meta.requiresAuth && isAuthenticated) {
    if (!isRouteAllowedForRole(to.path, userRole)) {
      console.warn(`[RBAC] Access denied for role "${userRole}" to "${to.path}". Redirecting to ${roleConfig.defaultRoute}`);
      return next({ path: roleConfig.defaultRoute });
    }
  }

  next();
});

export default appRouter;
