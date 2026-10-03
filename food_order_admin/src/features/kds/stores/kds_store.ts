import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { KdsState } from '../kds_state';
import { initialKdsState } from '../kds_state';
import type { KdsIntent } from '../kds_intent';
import { orderRepository } from '../../../data';
import { GetOrdersUseCase } from '../../../domain/orders/usecases/get_orders_usecase';
import { UpdateOrderStatusUseCase } from '../../../domain/orders/usecases/update_order_status_usecase';
import { playKitchenChime } from '../../../core/utils/audio_chime';
import { adminSocketService } from '../../../core/services/socket_service';
import { LocalDB } from '../../../core/db/local_db';
import { DBKeys } from '../../../core/db/db_keys';

export const useKdsStore = defineStore('kds', () => {
  const getOrdersUseCase = new GetOrdersUseCase(orderRepository);
  const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);

  // State
  const state = ref<KdsState>({
    ...initialKdsState,
    soundEnabled: LocalDB.getBool(DBKeys.SOUND_ENABLED, true),
  });

  // Track previous pending count to trigger chime on new orders
  let prevPendingCount = -1;

  // Getters
  const activeOrders = computed(() =>
    state.value.orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
  );

  const incomingOrders = computed(() =>
    state.value.orders.filter(o => o.status === 'pending' || o.status === 'confirmed')
  );

  const cookingOrders = computed(() =>
    state.value.orders.filter(o => o.status === 'preparing')
  );

  const readyOrders = computed(() =>
    state.value.orders.filter(o => o.status === 'on_delivery')
  );

  const incomingCount = computed(() => incomingOrders.value.length);
  const cookingCount = computed(() => cookingOrders.value.length);
  const readyCount = computed(() => readyOrders.value.length);

  // Dispatch Intent handler
  async function dispatch(intent: KdsIntent): Promise<void> {
    switch (intent.type) {
      case 'LOAD_ORDERS': {
        state.value.isLoading = true;
        try {
          const freshOrders = await getOrdersUseCase.execute();
          state.value.orders = freshOrders;

          const currentPending = freshOrders.filter(o => o.status === 'pending').length;
          if (prevPendingCount !== -1 && currentPending > prevPendingCount && state.value.soundEnabled) {
            playKitchenChime();
          }
          prevPendingCount = currentPending;
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to load KDS orders';
        } finally {
          state.value.isLoading = false;
        }
        break;
      }

      case 'UPDATE_STATUS': {
        try {
          const updated = await updateOrderStatusUseCase.execute(
            intent.payload.id,
            intent.payload.status
          );
          const idx = state.value.orders.findIndex(o => o.id === updated.id);
          if (idx >= 0) {
            state.value.orders[idx] = updated;
          }
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to update order status';
        }
        break;
      }

      case 'TOGGLE_ITEM_PREPARED': {
        const key = `${intent.payload.orderId}_${intent.payload.itemId}`;
        state.value.preparedItems[key] = !state.value.preparedItems[key];
        break;
      }

      case 'TOGGLE_SOUND': {
        state.value.soundEnabled = !state.value.soundEnabled;
        LocalDB.setBool(DBKeys.SOUND_ENABLED, state.value.soundEnabled);
        if (state.value.soundEnabled) {
          playKitchenChime();
        }
        break;
      }

      case 'SET_FILTER': {
        state.value.activeFilter = intent.payload;
        break;
      }

      case 'OPEN_PRINT_MODAL': {
        state.value.selectedOrderForPrint = intent.payload;
        state.value.isPrintModalOpen = true;
        break;
      }

      case 'CLOSE_PRINT_MODAL': {
        state.value.isPrintModalOpen = false;
        state.value.selectedOrderForPrint = null;
        break;
      }

      case 'TOGGLE_FULLSCREEN': {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().then(() => {
            state.value.isFullscreen = true;
          }).catch(() => {});
        } else {
          document.exitFullscreen().then(() => {
            state.value.isFullscreen = false;
          }).catch(() => {});
        }
        break;
      }
    }
  }

  // Initial load
  dispatch({ type: 'LOAD_ORDERS' });

  // Real-time socket events for Kitchen Display System
  adminSocketService.onOrderCreated(() => {
    dispatch({ type: 'LOAD_ORDERS' });
  });

  adminSocketService.onOrderStatusChanged(() => {
    dispatch({ type: 'LOAD_ORDERS' });
  });

  return {
    state,
    activeOrders,
    incomingOrders,
    cookingOrders,
    readyOrders,
    incomingCount,
    cookingCount,
    readyCount,
    dispatch,
  };
});
