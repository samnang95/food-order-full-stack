<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { AdminSidebar, AdminHeader } from './features/layout';
import OrderDetailModal from './features/orders/components/OrderDetailModal.vue';
import FoodFormModal from './features/menu/components/FoodFormModal.vue';
import { AppRoutes } from './routes/app_routes';

const route = useRoute();
const isAuthRoute = computed(() => route.path === AppRoutes.LOGIN);
</script>

<template>
  <!-- Fullscreen Auth View (Login / Register) -->
  <div v-if="isAuthRoute" class="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
    <router-view />
  </div>

  <!-- Authenticated Admin Operations Shell -->
  <div v-else class="h-screen bg-slate-950 text-slate-100 flex antialiased selection:bg-orange-500 selection:text-white overflow-hidden">
    <!-- Left Navigation Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <AdminHeader />

      <main class="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
        <router-view />
      </main>
    </div>

    <!-- Global Feature Modals -->
    <OrderDetailModal />
    <FoodFormModal />
  </div>
</template>
