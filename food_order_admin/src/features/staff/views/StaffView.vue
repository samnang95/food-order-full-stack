<script setup lang="ts">
import { onMounted } from 'vue';
import { useStaffStore } from '../stores/staff_store';
import StaffStatsBar from '../components/StaffStatsBar.vue';
import StaffCard from '../components/StaffCard.vue';
import StaffModal from '../components/StaffModal.vue';
import type { UserRole } from '../../../domain/auth/entities/user';
import type { StaffStatus } from '../../../domain/staff/entities/staff_member';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Crown,
  Briefcase,
  ChefHat,
  Store,
  Sparkles,
  ShieldAlert,
} from 'lucide-vue-next';

const staffStore = useStaffStore();

onMounted(() => {
  staffStore.loadStaff();
});

const roleFilters: Array<{ role: UserRole | 'all'; label: string; icon?: any }> = [
  { role: 'all', label: 'All Roles' },
  { role: 'admin', label: 'Super Admin', icon: Crown },
  { role: 'manager', label: 'Managers', icon: Briefcase },
  { role: 'kitchen', label: 'Kitchen Crew', icon: ChefHat },
  { role: 'staff', label: 'Front Staff', icon: Store },
];

const statusFilters: Array<{ status: StaffStatus | 'all'; label: string }> = [
  { status: 'all', label: 'All Shifts' },
  { status: 'active', label: 'On Duty' },
  { status: 'on_break', label: 'On Break' },
  { status: 'inactive', label: 'Off Duty' },
];

function handleRoleChange(id: string, newRole: UserRole) {
  staffStore.dispatch({
    type: 'UPDATE_STAFF_ROLE',
    payload: { id, role: newRole },
  });
}

function handleDeleteStaff(id: string) {
  if (confirm('Are you sure you want to remove this staff account?')) {
    staffStore.removeStaff(id);
  }
}

async function handleModalSubmit(form: any) {
  if (staffStore.modalMode === 'create') {
    await staffStore.dispatch({
      type: 'CREATE_STAFF',
      payload: {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        title: form.title,
        department: form.department,
        phoneNumber: form.phoneNumber,
        shift: form.shift,
      },
    });
  } else {
    await staffStore.dispatch({
      type: 'UPDATE_STAFF_ROLE',
      payload: {
        id: form.id,
        role: form.role,
        title: form.title,
        shift: form.shift,
        status: form.status,
      },
    });
  }
}
</script>

<template>
  <div class="space-y-6 select-none">
    <!-- View Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
            <Users class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-white font-display tracking-tight flex items-center gap-2">
              Staff & Team Management
              <span class="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-bold border border-orange-500/20 font-mono">
                RBAC
              </span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
              Control staff accounts, assign operational permissions, and monitor active shifts.
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          @click="staffStore.loadStaff()"
          class="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 transition cursor-pointer"
          title="Refresh List"
        >
          <RefreshCw :class="['w-4 h-4', staffStore.isLoading ? 'animate-spin text-orange-400' : '']" />
        </button>

        <button
          @click="staffStore.openCreateModal()"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition cursor-pointer active:scale-95"
        >
          <UserPlus class="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>
    </div>

    <!-- KPI Stats Bar -->
    <StaffStatsBar :stats="staffStore.stats" />

    <!-- Filters & Search Toolbar -->
    <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          :value="staffStore.searchQuery"
          @input="staffStore.setSearchQuery(($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Search team member by name, email, or title..."
          class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition"
        />
      </div>

      <!-- Filter Pills: Role & Shift -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Role Pills -->
        <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <button
            v-for="rf in roleFilters"
            :key="rf.role"
            @click="staffStore.setRoleFilter(rf.role)"
            :class="[
              'px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5',
              staffStore.selectedRoleFilter === rf.role
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            ]"
          >
            <component :is="rf.icon" v-if="rf.icon" class="w-3 h-3" />
            <span>{{ rf.label }}</span>
          </button>
        </div>

        <!-- Status Filter Selector -->
        <select
          :value="staffStore.selectedStatusFilter"
          @change="staffStore.setStatusFilter(($event.target as HTMLSelectElement).value as any)"
          class="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
        >
          <option v-for="sf in statusFilters" :key="sf.status" :value="sf.status">
            {{ sf.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Error Alert if any -->
    <div
      v-if="staffStore.error"
      class="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <ShieldAlert class="w-4 h-4 text-red-400 shrink-0" />
        <span>{{ staffStore.error }}</span>
      </div>
      <button @click="staffStore.loadStaff()" class="text-xs font-bold text-red-400 hover:underline cursor-pointer">
        Retry
      </button>
    </div>

    <!-- Staff Cards Grid -->
    <div v-if="staffStore.filteredStaff.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <StaffCard
        v-for="member in staffStore.filteredStaff"
        :key="member.id"
        :staff="member"
        @edit="staffStore.openEditModal"
        @delete="handleDeleteStaff"
        @change-role="handleRoleChange"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!staffStore.isLoading"
      class="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl flex flex-col items-center justify-center p-6"
    >
      <div class="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-500 mb-3">
        <Users class="w-7 h-7" />
      </div>
      <h3 class="text-base font-bold text-white">No team members found</h3>
      <p class="text-xs text-slate-400 max-w-sm mt-1">
        Try adjusting your search query or role filter, or invite a new staff member to the platform.
      </p>
      <button
        @click="staffStore.openCreateModal()"
        class="mt-4 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer"
      >
        Add Team Member
      </button>
    </div>

    <!-- Staff Create/Edit Modal -->
    <StaffModal
      :is-open="staffStore.isModalOpen"
      :mode="staffStore.modalMode"
      :staff="staffStore.editingStaff"
      @close="staffStore.closeModal"
      @submit="handleModalSubmit"
    />
  </div>
</template>
