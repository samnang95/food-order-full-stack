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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Kitchen & Order Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time order processing powered by MVI pattern & Socket.IO
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onIntent(OrdersIntent.fetchOrders())}
            disabled={state.isLoading}
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <span className={state.isLoading ? 'animate-spin' : ''}>🔄</span>
            <span>{state.isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = state.activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onIntent(OrdersIntent.setFilter(tab.id))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'
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
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={state.searchQuery}
            onChange={(e) => onIntent(OrdersIntent.setSearch(e.target.value))}
            placeholder="Search order ID or address..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Error Banner */}
      {state.errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{state.errorMessage}</span>
          </div>
          <button
            onClick={() => onIntent(OrdersIntent.fetchOrders())}
            className="underline font-bold hover:text-rose-800"
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
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl border border-slate-100">
            📦
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
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
