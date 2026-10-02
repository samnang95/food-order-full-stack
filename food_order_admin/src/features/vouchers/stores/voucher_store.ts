import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { VoucherState } from '../voucher_state';
import { initialVoucherState } from '../voucher_state';
import type { VoucherIntent } from '../voucher_intent';
import {
  GetVouchersUseCase,
  CreateVoucherUseCase,
  UpdateVoucherUseCase,
  DeleteVoucherUseCase,
  ToggleVoucherStatusUseCase,
  ValidateVoucherUseCase,
} from '../../../domain/vouchers';
import { VoucherRepositoryImpl } from '../../../data/vouchers/repositories/voucher_repository_impl';

export const useVoucherStore = defineStore('vouchers', () => {
  // Repository & Use Cases
  const voucherRepository = new VoucherRepositoryImpl();
  const getVouchersUseCase = new GetVouchersUseCase(voucherRepository);
  const createVoucherUseCase = new CreateVoucherUseCase(voucherRepository);
  const updateVoucherUseCase = new UpdateVoucherUseCase(voucherRepository);
  const deleteVoucherUseCase = new DeleteVoucherUseCase(voucherRepository);
  const toggleVoucherStatusUseCase = new ToggleVoucherStatusUseCase(voucherRepository);
  const validateVoucherUseCase = new ValidateVoucherUseCase(voucherRepository);

  // State
  const state = ref<VoucherState>({ ...initialVoucherState });

  // Getters
  const vouchers = computed(() => state.value.vouchers);
  const isLoading = computed(() => state.value.isLoading);
  const error = computed(() => state.value.error);

  const filteredVouchers = computed(() => {
    let list = state.value.vouchers;

    // Search query
    if (state.value.searchQuery.trim()) {
      const q = state.value.searchQuery.toLowerCase();
      list = list.filter(
        v =>
          v.code.toLowerCase().includes(q) ||
          v.title.toLowerCase().includes(q) ||
          v.desc.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (state.value.typeFilter !== 'all') {
      list = list.filter(v => v.type === state.value.typeFilter);
    }

    // Status filter
    if (state.value.statusFilter !== 'all') {
      const isActive = state.value.statusFilter === 'active';
      list = list.filter(v => v.isActive === isActive);
    }

    return list;
  });

  const totalCount = computed(() => state.value.vouchers.length);
  const activeCount = computed(() => state.value.vouchers.filter(v => v.isActive).length);
  const totalRedemptions = computed(() =>
    state.value.vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0)
  );

  // Intent Handlers (MVI dispatch pattern)
  async function dispatch(intent: VoucherIntent): Promise<void> {
    switch (intent.type) {
      case 'LOAD_VOUCHERS': {
        state.value.isLoading = true;
        state.value.error = null;
        try {
          state.value.vouchers = await getVouchersUseCase.execute();
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to load vouchers';
        } finally {
          state.value.isLoading = false;
        }
        break;
      }

      case 'CREATE_VOUCHER': {
        state.value.isLoading = true;
        state.value.error = null;
        try {
          const created = await createVoucherUseCase.execute(intent.payload);
          state.value.vouchers.unshift(created);
          state.value.isModalOpen = false;
          state.value.editingVoucher = null;
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to create voucher';
        } finally {
          state.value.isLoading = false;
        }
        break;
      }

      case 'UPDATE_VOUCHER': {
        state.value.isLoading = true;
        state.value.error = null;
        try {
          const updated = await updateVoucherUseCase.execute(intent.payload);
          const idx = state.value.vouchers.findIndex(v => v.id === updated.id);
          if (idx >= 0) {
            state.value.vouchers[idx] = updated;
          }
          state.value.isModalOpen = false;
          state.value.editingVoucher = null;
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to update voucher';
        } finally {
          state.value.isLoading = false;
        }
        break;
      }

      case 'DELETE_VOUCHER': {
        try {
          await deleteVoucherUseCase.execute(intent.payload);
          state.value.vouchers = state.value.vouchers.filter(v => v.id !== intent.payload);
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to delete voucher';
        }
        break;
      }

      case 'TOGGLE_STATUS': {
        try {
          const updated = await toggleVoucherStatusUseCase.execute(intent.payload);
          const idx = state.value.vouchers.findIndex(v => v.id === updated.id);
          if (idx >= 0) {
            state.value.vouchers[idx] = updated;
          }
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to toggle status';
        }
        break;
      }

      case 'VALIDATE_VOUCHER': {
        state.value.isValidating = true;
        state.value.validationResult = null;
        try {
          const result = await validateVoucherUseCase.execute(
            intent.payload.code,
            intent.payload.subtotal
          );
          state.value.validationResult = result;
        } catch (err: unknown) {
          state.value.validationResult = {
            valid: false,
            message: err instanceof Error ? err.message : 'Validation failed',
          };
        } finally {
          state.value.isValidating = false;
        }
        break;
      }

      case 'SET_SEARCH': {
        state.value.searchQuery = intent.payload;
        break;
      }

      case 'SET_TYPE_FILTER': {
        state.value.typeFilter = intent.payload;
        break;
      }

      case 'SET_STATUS_FILTER': {
        state.value.statusFilter = intent.payload;
        break;
      }

      case 'OPEN_CREATE_MODAL': {
        state.value.editingVoucher = null;
        state.value.isModalOpen = true;
        state.value.error = null;
        break;
      }

      case 'OPEN_EDIT_MODAL': {
        state.value.editingVoucher = intent.payload;
        state.value.isModalOpen = true;
        state.value.error = null;
        break;
      }

      case 'CLOSE_MODAL': {
        state.value.isModalOpen = false;
        state.value.editingVoucher = null;
        state.value.error = null;
        break;
      }

      case 'COPY_CODE': {
        state.value.copiedCode = intent.payload;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(intent.payload);
        }
        setTimeout(() => {
          if (state.value.copiedCode === intent.payload) {
            state.value.copiedCode = null;
          }
        }, 2000);
        break;
      }

      case 'CLEAR_ERROR': {
        state.value.error = null;
        break;
      }
    }
  }

  // Load vouchers initially
  dispatch({ type: 'LOAD_VOUCHERS' });

  return {
    state,
    vouchers,
    filteredVouchers,
    isLoading,
    error,
    totalCount,
    activeCount,
    totalRedemptions,
    dispatch,
  };
});
