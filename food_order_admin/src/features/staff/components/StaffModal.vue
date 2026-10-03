<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { StaffMember, StaffStatus } from '../../../domain/staff/entities/staff_member';
import type { UserRole } from '../../../domain/auth/entities/user';
import { ROLE_CONFIGS } from '../../../core/auth/rbac';
import {
  X,
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  Briefcase,
  Crown,
  ChefHat,
  Store,
  Clock,
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  mode: 'create' | 'edit';
  staff: StaffMember | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', form: {
    id?: string;
    username: string;
    email: string;
    password?: string;
    role: UserRole;
    title: string;
    department: string;
    phoneNumber: string;
    shift: 'morning' | 'evening' | 'night' | 'full_day';
    status: StaffStatus;
  }): void;
}>();

// Form states
const username = ref('');
const email = ref('');
const password = ref('');
const role = ref<UserRole>('staff');
const title = ref('');
const department = ref('');
const phoneNumber = ref('');
const shift = ref<'morning' | 'evening' | 'night' | 'full_day'>('morning');
const status = ref<StaffStatus>('active');

const rolesList: Array<{ role: UserRole; label: string; desc: string; icon: any }> = [
  { role: 'admin', label: 'Super Admin', desc: 'Full System Access', icon: Crown },
  { role: 'manager', label: 'Store Manager', desc: 'Menu, Vouchers, CRM', icon: Briefcase },
  { role: 'kitchen', label: 'Kitchen Chef', desc: 'KDS & Prep Timers', icon: ChefHat },
  { role: 'staff', label: 'Front Staff', desc: 'Orders & Receipts', icon: Store },
];

watch(
  () => props.staff,
  (s) => {
    if (s && props.mode === 'edit') {
      username.value = s.username;
      email.value = s.email;
      password.value = '';
      role.value = s.role;
      title.value = s.title;
      department.value = s.department;
      phoneNumber.value = s.phoneNumber || '';
      shift.value = s.shift || 'morning';
      status.value = s.status;
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  username.value = '';
  email.value = '';
  password.value = '';
  role.value = 'staff';
  title.value = ROLE_CONFIGS.staff.title;
  department.value = ROLE_CONFIGS.staff.badge;
  phoneNumber.value = '';
  shift.value = 'morning';
  status.value = 'active';
}

function handleRoleChange(selectedRole: UserRole) {
  role.value = selectedRole;
  if (!title.value || props.mode === 'create') {
    title.value = ROLE_CONFIGS[selectedRole].title;
    department.value = ROLE_CONFIGS[selectedRole].badge;
  }
}

function handleSubmit() {
  emit('submit', {
    id: props.staff?.id,
    username: username.value,
    email: email.value,
    password: password.value || undefined,
    role: role.value,
    title: title.value,
    department: department.value,
    phoneNumber: phoneNumber.value,
    shift: shift.value,
    status: status.value,
  });
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]"
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-white">
            {{ mode === 'create' ? 'Add New Team Member' : 'Edit Staff Profile' }}
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ mode === 'create' ? 'Create credentials and assign an operational role' : 'Update role permissions and shift assignments' }}
          </p>
        </div>
        <button
          @click="emit('close')"
          class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 overflow-y-auto flex-1">
        <!-- Role Selection Cards -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Select Operational Role
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="r in rolesList"
              :key="r.role"
              type="button"
              @click="handleRoleChange(r.role)"
              :class="[
                'p-2.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5',
                role === r.role
                  ? `${ROLE_CONFIGS[r.role].themeColor.bg} ${ROLE_CONFIGS[r.role].themeColor.border} ring-1 ring-orange-500/40 text-white`
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60'
              ]"
            >
              <component
                :is="r.icon"
                :class="['w-4 h-4 shrink-0 mt-0.5', role === r.role ? ROLE_CONFIGS[r.role].themeColor.text : 'text-slate-500']"
              />
              <div class="min-w-0">
                <span class="text-xs font-bold block truncate leading-tight">{{ r.label }}</span>
                <span class="text-[10px] text-slate-400 block truncate mt-0.5">{{ r.desc }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Username & Email -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-300">Username</label>
            <div class="relative">
              <UserIcon class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="username"
                type="text"
                required
                placeholder="e.g. chef.mario"
                class="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-300">Email Address</label>
            <div class="relative">
              <Mail class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="email"
                type="email"
                required
                placeholder="mario@foodhub.com"
                class="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        <!-- Password (Optional in edit mode) -->
        <div class="space-y-1" v-if="mode === 'create'">
          <label class="block text-xs font-semibold text-slate-300">Initial Password</label>
          <div class="relative">
            <Lock class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <!-- Job Title & Phone -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-300">Job Title</label>
            <input
              v-model="title"
              type="text"
              required
              placeholder="e.g. Executive Head Chef"
              class="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-300">Phone Number</label>
            <div class="relative">
              <Phone class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="phoneNumber"
                type="text"
                placeholder="+1 (555) 019-2834"
                class="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        <!-- Shift & Status -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-300">Shift Schedule</label>
            <div class="relative">
              <Clock class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                v-model="shift"
                class="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="morning">Morning (06:00 - 14:00)</option>
                <option value="evening">Evening (14:00 - 22:00)</option>
                <option value="night">Night (22:00 - 06:00)</option>
                <option value="full_day">Full Day (Operations)</option>
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-300">Active Status</label>
            <select
              v-model="status"
              class="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="active">On Duty (Active)</option>
              <option value="on_break">On Break</option>
              <option value="inactive">Off Duty (Inactive)</option>
            </select>
          </div>
        </div>

        <!-- Submit Footer -->
        <div class="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition cursor-pointer"
          >
            {{ mode === 'create' ? 'Create Staff Member' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
