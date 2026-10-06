<script setup lang="ts">
import { computed } from 'vue';
import type { StaffMember } from '../../../domain/staff/entities/staff_member';
import type { UserRole } from '../../../domain/auth/entities/user';
import { getRoleConfig, ROLE_CONFIGS } from '../../../core/auth/rbac';
import {
  Shield,
  Clock,
  Phone,
  Mail,
  Edit2,
  Trash2,
  CheckCircle,
  Coffee,
  XCircle,
  Package,
} from 'lucide-vue-next';

const props = defineProps<{
  staff: StaffMember;
}>();

const emit = defineEmits<{
  (e: 'edit', id: string): void;
  (e: 'delete', id: string): void;
  (e: 'change-role', id: string, role: UserRole): void;
}>();

const roleConfig = computed(() => getRoleConfig(props.staff.role));

const statusBadge = computed(() => {
  switch (props.staff.status) {
    case 'active':
      return { label: 'On Duty', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle };
    case 'on_break':
      return { label: 'On Break', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Coffee };
    case 'inactive':
      return { label: 'Off Duty', color: 'bg-slate-700/30 text-slate-400 border-slate-700/50', icon: XCircle };
  }
});

const shiftLabel = computed(() => {
  switch (props.staff.shift) {
    case 'morning':
      return 'Morning (06:00 - 14:00)';
    case 'evening':
      return 'Evening (14:00 - 22:00)';
    case 'night':
      return 'Night (22:00 - 06:00)';
    case 'full_day':
      return 'Full Day (Operations)';
    default:
      return 'Flexible Shift';
  }
});
</script>

<template>
  <div class="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 relative overflow-hidden group hover:border-slate-700 transition flex flex-col justify-between">
    <!-- Ambient Accent Strip -->
    <div :class="['absolute top-0 left-0 right-0 h-1', roleConfig.themeColor.dot]" />

    <div>
      <!-- Header: Avatar + User Info + Role Badge -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="relative shrink-0">
            <img
              :src="staff.avatar"
              :alt="staff.username"
              loading="lazy"
              decoding="async"
              :class="['w-12 h-12 rounded-2xl object-cover ring-2 transition', roleConfig.themeColor.ring]"
            />
            <span
              :class="[
                'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900',
                staff.status === 'active' ? 'bg-emerald-500' : staff.status === 'on_break' ? 'bg-amber-500' : 'bg-slate-500'
              ]"
            />
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-white truncate">{{ staff.username }}</h3>
              <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider', roleConfig.themeColor.bg, roleConfig.themeColor.text, roleConfig.themeColor.border]">
                {{ roleConfig.badge }}
              </span>
            </div>
            <p class="text-xs text-slate-400 font-medium truncate mt-0.5">{{ staff.title }}</p>
          </div>
        </div>

        <!-- Status Pill -->
        <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded-lg border flex items-center gap-1 shrink-0', statusBadge.color]">
          <component :is="statusBadge.icon" class="w-3 h-3" />
          {{ statusBadge.label }}
        </span>
      </div>

      <!-- Contact & Details Grid -->
      <div class="mt-4 pt-3 border-t border-slate-800/60 space-y-2 text-xs text-slate-400">
        <div class="flex items-center gap-2 truncate">
          <Mail class="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span class="truncate">{{ staff.email }}</span>
        </div>

        <div class="flex items-center gap-2 truncate" v-if="staff.phoneNumber">
          <Phone class="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{{ staff.phoneNumber }}</span>
        </div>

        <div class="flex items-center gap-2 truncate">
          <Clock class="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span class="text-slate-300 font-medium">{{ shiftLabel }}</span>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="mt-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs">
        <span class="text-slate-400 flex items-center gap-1.5">
          <Package class="w-3.5 h-3.5 text-orange-400" />
          Activity Logged
        </span>
        <span class="font-mono font-bold text-white">{{ staff.ordersHandled || 0 }} actions</span>
      </div>
    </div>

    <!-- Card Footer & Action Buttons -->
    <div class="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
      <!-- Quick Role Selector dropdown -->
      <div class="flex items-center gap-1.5">
        <label class="text-[10px] uppercase font-bold text-slate-500">Role:</label>
        <select
          :value="staff.role"
          @change="emit('change-role', staff.id, ($event.target as HTMLSelectElement).value as UserRole)"
          class="bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/80 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500 cursor-pointer"
        >
          <option value="admin">Super Admin</option>
          <option value="manager">Manager</option>
          <option value="kitchen">Kitchen Chef</option>
          <option value="staff">Front Staff</option>
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-1">
        <button
          @click="emit('edit', staff.id)"
          class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          title="Edit Details"
        >
          <Edit2 class="w-3.5 h-3.5" />
        </button>
        <button
          v-if="staff.role !== 'admin'"
          @click="emit('delete', staff.id)"
          class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition cursor-pointer"
          title="Remove Staff"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
