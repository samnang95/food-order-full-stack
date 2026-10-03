import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { KdsState, KdsStation } from '../kds_state';
import { initialKdsState } from '../kds_state';
import type { KdsIntent } from '../kds_intent';
import type { OrderEntity } from '../../../domain/orders/entities/order_entity';
import { orderRepository } from '../../../data';
import { GetOrdersUseCase } from '../../../domain/orders/usecases/get_orders_usecase';
import { UpdateOrderStatusUseCase } from '../../../domain/orders/usecases/update_order_status_usecase';
import { playKitchenChime, playStatusTransitionChime, playUrgentAlertChime } from '../../../core/utils/audio_chime';
import { adminSocketService } from '../../../core/services/socket_service';
import { LocalDB } from '../../../core/db/local_db';
import { DBKeys } from '../../../core/db/db_keys';

function matchesStation(order: OrderEntity, station: KdsStation): boolean {
  if (station === 'all') return true;

  const drinkKeywords = [
    'coffee', 'tea', 'boba', 'smoothie', 'juice', 'soda', 'beer',
    'latte', 'drink', 'shake', 'water', 'mojito', 'cappuccino', 'espresso', 'beverage'
  ];
  const dessertKeywords = [
    'cake', 'ice cream', 'pie', 'donut', 'doughnut', 'waffle', 'pancake',
    'cookie', 'dessert', 'pastry', 'brownie', 'tart', 'tiramisu', 'pudding'
  ];

  if (station === 'drinks') {
    return order.items.some(item =>
      drinkKeywords.some(kw => item.name.toLowerCase().includes(kw))
    );
  }
  if (station === 'dessert') {
    return order.items.some(item =>
      dessertKeywords.some(kw => item.name.toLowerCase().includes(kw))
    );
  }
  if (station === 'kitchen') {
    return order.items.some(item => {
      const lower = item.name.toLowerCase();
      const isDrink = drinkKeywords.some(kw => lower.includes(kw));
      const isDessert = dessertKeywords.some(kw => lower.includes(kw));
      return !isDrink && !isDessert;
    }) || order.items.length === 0;
  }
  return true;
}

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

  // Filtered by station
  const stationOrders = computed(() =>
    state.value.orders.filter(order => matchesStation(order, state.value.stationFilter))
  );

  // Getters
  const activeOrders = computed(() =>
    stationOrders.value.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
  );

  const incomingOrders = computed(() =>
    stationOrders.value.filter(o => o.status === 'pending' || o.status === 'confirmed')
  );

  const cookingOrders = computed(() =>
    stationOrders.value.filter(o => o.status === 'preparing')
  );

  const readyOrders = computed(() =>
    stationOrders.value.filter(o => o.status === 'on_delivery')
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

          if (state.value.recentlyBumpedOrders.length === 0) {
            state.value.recentlyBumpedOrders = freshOrders
              .filter(o => o.status === 'delivered' || o.status === 'cancelled')
              .slice(0, 10);
          }

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
          const existing = state.value.orders.find(o => o.id === intent.payload.id);
          const updated = await updateOrderStatusUseCase.execute(
            intent.payload.id,
            intent.payload.status
          );
          const idx = state.value.orders.findIndex(o => o.id === updated.id);
          if (idx >= 0) {
            state.value.orders[idx] = updated;
          }

          // If bumped to delivered/cancelled, save to recentlyBumped
          if ((intent.payload.status === 'delivered' || intent.payload.status === 'cancelled') && existing) {
            state.value.recentlyBumpedOrders = [
              updated,
              ...state.value.recentlyBumpedOrders.filter(o => o.id !== updated.id),
            ].slice(0, 10);
          }

          if (state.value.soundEnabled) {
            playStatusTransitionChime();
          }
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to update order status';
        }
        break;
      }

      case 'RECALL_ORDER': {
        try {
          const updated = await updateOrderStatusUseCase.execute(
            intent.payload.id,
            intent.payload.status
          );
          const idx = state.value.orders.findIndex(o => o.id === updated.id);
          if (idx >= 0) {
            state.value.orders[idx] = updated;
          } else {
            state.value.orders.push(updated);
          }
          state.value.recentlyBumpedOrders = state.value.recentlyBumpedOrders.filter(o => o.id !== updated.id);
          if (state.value.soundEnabled) {
            playStatusTransitionChime();
          }
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to recall order';
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

      case 'TEST_SOUND': {
        if (intent.payload === 'urgent') {
          playUrgentAlertChime();
        } else if (intent.payload === 'transition') {
          playStatusTransitionChime();
        } else {
          playKitchenChime();
        }
        break;
      }

      case 'SET_FILTER': {
        state.value.activeFilter = intent.payload;
        break;
      }

      case 'SET_STATION': {
        state.value.stationFilter = intent.payload;
        break;
      }

      case 'TOGGLE_RECALL_DRAWER': {
        state.value.isRecallDrawerOpen = !state.value.isRecallDrawerOpen;
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

