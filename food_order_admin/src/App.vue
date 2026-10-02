<script setup lang="ts">
import { AdminSidebar, AdminHeader } from './features/layout';
import OrderDetailModal from './features/orders/components/OrderDetailModal.vue';
import FoodFormModal from './features/menu/components/FoodFormModal.vue';
</script>

<template>
  <div class="h-screen bg-slate-950 text-slate-100 flex antialiased selection:bg-orange-500 selection:text-white overflow-hidden">
    <!-- Left Navigation Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <AdminHeader />

      <main class="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
        <router-view />
      </main>
    </div>

    <!-- Global Feature Modals -->
    <OrderDetailModal />
    <FoodFormModal />
  </div>
</template>
