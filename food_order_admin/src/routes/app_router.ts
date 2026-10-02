import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { AppRoutes } from './app_routes';
import DashboardView from '../features/dashboard/views/DashboardView.vue';
import OrdersView from '../features/orders/views/OrdersView.vue';
import MenuView from '../features/menu/views/MenuView.vue';
import CategoriesView from '../features/categories/views/CategoriesView.vue';
import CustomersView from '../features/customers/views/CustomersView.vue';
import SettingsView from '../features/settings/views/SettingsView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: AppRoutes.ROOT,
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'Dashboard Overview' },
  },
  {
    path: AppRoutes.ORDERS,
    name: 'orders',
    component: OrdersView,
    meta: { title: 'Live Orders & Operations' },
  },
  {
    path: AppRoutes.MENU,
    name: 'menu',
    component: MenuView,
    meta: { title: 'Menu & Food Catalog' },
  },
  {
    path: AppRoutes.CATEGORIES,
    name: 'categories',
    component: CategoriesView,
    meta: { title: 'Food Categories' },
  },
  {
    path: AppRoutes.CUSTOMERS,
    name: 'customers',
    component: CustomersView,
    meta: { title: 'Customer Directory' },
  },
  {
    path: AppRoutes.SETTINGS,
    name: 'settings',
    component: SettingsView,
    meta: { title: 'Settings & API Config' },
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

export default appRouter;
