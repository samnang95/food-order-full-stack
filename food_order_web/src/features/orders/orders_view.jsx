import { useOrdersStore } from './orders_store';
import { OrdersIntent } from './orders_intent';
import { OrderCard } from './components/order_card';
import { OrderDetailModal } from './components/order_detail_modal';

export function OrdersView() {
  const { state, onIntent } = useOrdersStore();

  const filterTabs = [
    { id: 'all', label: 'All Orders', count: state.orders.length },
    {
      id: 'pending',
      label: 'Pending',
      count: state.orders.filter((o) => (o.status || '').toLowerCase() === 'pending').length,
    },
    {
      id: 'preparing',
      label: 'Cooking',
      count: state.orders.filter((o) => (o.status || '').toLowerCase() === 'preparing').length,
    },
    {
      id: 'on_the_way',
      label: 'Delivering',
      count: state.orders.filter((o) => (o.status || '').toLowerCase() === 'on_the_way').length,
    },
    {
      id: 'delivered',
      label: 'Completed',
      count: state.orders.filter((o) => (o.status || '').toLowerCase() === 'delivered').length,
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      count: state.orders.filter((o) => (o.status || '').toLowerCase() === 'cancelled').length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Kitchen & Order Dispatch
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time order processing powered by MVI pattern & Socket.IO
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onIntent(OrdersIntent.fetchOrders())}
            disabled={state.isLoading}
            className="inline-flex items-center space-x-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span className={state.isLoading ? 'animate-spin' : ''}>🔄</span>
            <span>{state.isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors">
        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = state.activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onIntent(OrdersIntent.setFilter(tab.id))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-slate-700 dark:bg-orange-600 text-slate-100 dark:text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-500 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={state.searchQuery}
            onChange={(e) => onIntent(OrdersIntent.setSearch(e.target.value))}
            placeholder="Search order ID or address..."
            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Error Banner */}
      {state.errorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{state.errorMessage}</span>
          </div>
          <button
            onClick={() => onIntent(OrdersIntent.fetchOrders())}
            className="underline font-bold hover:text-rose-800 dark:hover:text-rose-200 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Orders Grid */}
      {state.filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {state.filteredOrders.map((order) => (
            <OrderCard
              key={order._id || order.id}
              order={order}
              onSelect={(ord) => onIntent(OrdersIntent.selectOrder(ord))}
              onUpdateStatus={(id, st) => onIntent(OrdersIntent.updateOrderStatus(id, st))}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center max-w-md mx-auto my-12 shadow-xs transition-colors">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl border border-slate-100 dark:border-slate-700">
            📦
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">No Orders Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {state.searchQuery
              ? `No orders matching "${state.searchQuery}". Try adjusting your search query.`
              : `There are currently no orders in the "${state.activeFilter}" category.`}
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {state.selectedOrder && (
        <OrderDetailModal
          order={state.selectedOrder}
          onClose={() => onIntent(OrdersIntent.clearSelectedOrder())}
          onUpdateStatus={(id, st) => onIntent(OrdersIntent.updateOrderStatus(id, st))}
        />
      )}
    </div>
  );
}
