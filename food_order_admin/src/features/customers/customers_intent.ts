/**
 * Intent (I) in MVI for Customers:
 * Actions and user intents for querying and managing customers.
 */
export const CustomersIntentType = {
  FETCH_CUSTOMERS: 'CUSTOMERS/FETCH_CUSTOMERS',
  SET_SEARCH: 'CUSTOMERS/SET_SEARCH',
} as const;

export type CustomersIntent =
  | { type: typeof CustomersIntentType.FETCH_CUSTOMERS }
  | { type: typeof CustomersIntentType.SET_SEARCH; payload: string };

export const CustomersIntents = {
  fetchCustomers: (): CustomersIntent => ({
    type: CustomersIntentType.FETCH_CUSTOMERS,
  }),
  setSearch: (query: string): CustomersIntent => ({
    type: CustomersIntentType.SET_SEARCH,
    payload: query,
  }),
};
