<script setup lang="ts">
import { AdminSidebar, AdminHeader } from './features/layout';
import OrderDetailModal from './features/orders/components/OrderDetailModal.vue';
import FoodFormModal from './features/menu/components/FoodFormModal.vue';
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex antialiased selection:bg-orange-500 selection:text-white overflow-x-hidden">
    <!-- Left Navigation Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <AdminHeader />

      <main class="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Global Feature Modals -->
    <OrderDetailModal />
    <FoodFormModal />
  </div>
</template>

<style>
/* Smooth page switch transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
