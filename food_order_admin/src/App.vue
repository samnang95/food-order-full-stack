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
  <div v-if="isAuthRoute" class="h-screen w-screen overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-main)] transition-colors duration-200">
    <router-view />
  </div>

  <!-- Authenticated Admin Operations Shell -->
  <div v-else class="h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex antialiased selection:bg-[var(--accent-primary)] selection:text-white overflow-hidden transition-colors duration-200">
    <!-- Left Navigation Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden w-full">
      <AdminHeader />

      <main class="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
        <router-view />
      </main>
    </div>

    <!-- Global Feature Modals -->
    <OrderDetailModal />
    <FoodFormModal />
  </div>
</template>
