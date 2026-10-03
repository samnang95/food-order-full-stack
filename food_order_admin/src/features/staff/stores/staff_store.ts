import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { StaffState } from '../staff_state';
import { initialStaffState } from '../staff_state';
import type { StaffIntent } from '../staff_intent';
import type { StaffMember } from '../../../domain/staff/entities/staff_member';
import {
  GetStaffUseCase,
  CreateStaffUseCase,
  UpdateStaffRoleUseCase,
  DeleteStaffUseCase,
} from '../../../domain/staff';
import { StaffRepositoryImpl } from '../../../data/staff/repositories/staff_repository_impl';

export const useStaffStore = defineStore('staff', () => {
  const repository = new StaffRepositoryImpl();
  const getStaffUseCase = new GetStaffUseCase(repository);
  const createStaffUseCase = new CreateStaffUseCase(repository);
  const updateStaffRoleUseCase = new UpdateStaffRoleUseCase(repository);
  const deleteStaffUseCase = new DeleteStaffUseCase(repository);

  const state = ref<StaffState>({ ...initialStaffState });

  // Getters
  const staffList = computed(() => state.value.staffList);
  const isLoading = computed(() => state.value.isLoading);
  const error = computed(() => state.value.error);
  const searchQuery = computed(() => state.value.searchQuery);
  const selectedRoleFilter = computed(() => state.value.selectedRoleFilter);
  const selectedStatusFilter = computed(() => state.value.selectedStatusFilter);
  const isModalOpen = computed(() => state.value.isModalOpen);
  const modalMode = computed(() => state.value.modalMode);
  const editingStaff = computed<StaffMember | null>(() => {
    if (!state.value.editingStaffId) return null;
    return state.value.staffList.find((s) => s.id === state.value.editingStaffId) || null;
  });

  const filteredStaff = computed(() => {
    let list = state.value.staffList;

    // Search query filter
    if (state.value.searchQuery.trim()) {
      const q = state.value.searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.username.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (state.value.selectedRoleFilter !== 'all') {
      list = list.filter((s) => s.role === state.value.selectedRoleFilter);
    }

    // Status filter
    if (state.value.selectedStatusFilter !== 'all') {
      list = list.filter((s) => s.status === state.value.selectedStatusFilter);
    }

    return list;
  });

  const stats = computed(() => {
    const list = state.value.staffList;
    return {
      total: list.length,
      active: list.filter((s) => s.status === 'active').length,
      kitchen: list.filter((s) => s.role === 'kitchen').length,
      frontDesk: list.filter((s) => s.role === 'staff').length,
      managers: list.filter((s) => s.role === 'manager' || s.role === 'admin').length,
    };
  });

  // Intent handler
  async function dispatch(intent: StaffIntent): Promise<void> {
    switch (intent.type) {
      case 'LOAD_STAFF': {
        state.value.isLoading = true;
        state.value.error = null;
        try {
          const list = await getStaffUseCase.execute();
          state.value.staffList = list;
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to load staff list';
        } finally {
          state.value.isLoading = false;
        }
        break;
      }

      case 'CREATE_STAFF': {
        state.value.isLoading = true;
        state.value.error = null;
        try {
          const created = await createStaffUseCase.execute(intent.payload);
          state.value.staffList.unshift(created);
          state.value.isModalOpen = false;
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to create staff account';
          throw err;
        } finally {
          state.value.isLoading = false;
        }
        break;
      }

      case 'UPDATE_STAFF_ROLE': {
        state.value.isLoading = true;
        state.value.error = null;
        try {
          const updated = await updateStaffRoleUseCase.execute(intent.payload);
          const idx = state.value.staffList.findIndex((s) => s.id === updated.id);
          if (idx !== -1) {
            state.value.staffList[idx] = updated;
          }
          state.value.isModalOpen = false;
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to update staff member';
          throw err;
        } finally {
          state.value.isLoading = false;
        }
        break;
      }

      case 'DELETE_STAFF': {
        state.value.isLoading = true;
        try {
          await deleteStaffUseCase.execute(intent.payload);
          state.value.staffList = state.value.staffList.filter((s) => s.id !== intent.payload);
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to remove staff member';
        } finally {
          state.value.isLoading = false;
        }
        break;
      }

      case 'SET_SEARCH_QUERY':
        state.value.searchQuery = intent.payload;
        break;

      case 'SET_ROLE_FILTER':
        state.value.selectedRoleFilter = intent.payload;
        break;

      case 'SET_STATUS_FILTER':
        state.value.selectedStatusFilter = intent.payload;
        break;

      case 'OPEN_CREATE_MODAL':
        state.value.modalMode = 'create';
        state.value.editingStaffId = null;
        state.value.isModalOpen = true;
        break;

      case 'OPEN_EDIT_MODAL':
        state.value.modalMode = 'edit';
        state.value.editingStaffId = intent.payload;
        state.value.isModalOpen = true;
        break;

      case 'CLOSE_MODAL':
        state.value.isModalOpen = false;
        state.value.editingStaffId = null;
        break;
    }
  }

  // Convenience methods
  const loadStaff = () => dispatch({ type: 'LOAD_STAFF' });
  const openCreateModal = () => dispatch({ type: 'OPEN_CREATE_MODAL' });
  const openEditModal = (id: string) => dispatch({ type: 'OPEN_EDIT_MODAL', payload: id });
  const closeModal = () => dispatch({ type: 'CLOSE_MODAL' });
  const setSearchQuery = (q: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: q });
  const setRoleFilter = (role: StaffState['selectedRoleFilter']) =>
    dispatch({ type: 'SET_ROLE_FILTER', payload: role });
  const setStatusFilter = (status: StaffState['selectedStatusFilter']) =>
    dispatch({ type: 'SET_STATUS_FILTER', payload: status });
  const removeStaff = (id: string) => dispatch({ type: 'DELETE_STAFF', payload: id });

  return {
    state,
    staffList,
    filteredStaff,
    stats,
    isLoading,
    error,
    searchQuery,
    selectedRoleFilter,
    selectedStatusFilter,
    isModalOpen,
    modalMode,
    editingStaff,
    dispatch,
    loadStaff,
    openCreateModal,
    openEditModal,
    closeModal,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    removeStaff,
  };
});
