import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import { customerRepository } from '../../../data';
import { GetCustomersUseCase } from '../../../domain/customers/usecases/get_customers_usecase';
import { CustomersIntentType, type CustomersIntent, CustomersIntents } from '../customers_intent';
import { initialCustomersState, computeFilteredCustomers, type CustomersState } from '../customers_state';

export const useCustomersStore = defineStore('customers', () => {
  const getCustomersUseCase = new GetCustomersUseCase(customerRepository);

  const state = reactive<CustomersState>({ ...initialCustomersState });

  async function dispatch(intent: CustomersIntent) {
    switch (intent.type) {
      case CustomersIntentType.FETCH_CUSTOMERS: {
        state.isLoading = true;
        state.errorMessage = null;
        try {
          const list = await getCustomersUseCase.execute();
          state.customers = list;
          state.filteredCustomers = computeFilteredCustomers(state.customers, state.searchQuery);
        } catch (err: unknown) {
          state.errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
        } finally {
          state.isLoading = false;
        }
        break;
      }

      case CustomersIntentType.SET_SEARCH: {
        state.searchQuery = intent.payload;
        state.filteredCustomers = computeFilteredCustomers(state.customers, state.searchQuery);
        break;
      }
    }
  }

  // Initial load
  dispatch(CustomersIntents.fetchCustomers());

  const customers = computed(() => state.customers);
  const filteredCustomers = computed(() => state.filteredCustomers);
  const searchQuery = computed({
    get: () => state.searchQuery,
    set: (val: string) => dispatch(CustomersIntents.setSearch(val)),
  });

  return {
    state,
    dispatch,
    customers,
    filteredCustomers,
    searchQuery,
    loadCustomers: () => dispatch(CustomersIntents.fetchCustomers()),
  };
});
