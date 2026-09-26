import React, { useState, useEffect } from 'react';

export default function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    fetch('http://localhost:3000/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') setApiStatus('connected');
        else setApiStatus('disconnected');
      })
      .catch(() => setApiStatus('offline'));
  }, []);

  const stats = [
    { label: "Today's Revenue", value: '$1,280.50', change: '+14.2%', icon: '💰', color: 'from-amber-500 to-orange-500' },
    { label: 'Active Orders', value: '18', change: '4 preparing', icon: '🍳', color: 'from-orange-500 to-red-500' },
    { label: 'Out for Delivery', value: '7', change: 'Avg 18 mins', icon: '🛵', color: 'from-emerald-500 to-teal-600' },
    { label: 'Total Customers', value: '432', change: '+28 this week', icon: '👥', color: 'from-indigo-500 to-purple-600' },
  ];

  const recentOrders = [
    { id: 'ORD-8921', customer: 'Sokha Meng', items: '2x Truffle Burger, 1x Fries', total: '$28.50', payment: 'ABA KHQR', status: 'preparing', time: '4m ago' },
    { id: 'ORD-8920', customer: 'Dara Chan', items: '1x Spicy Salmon Roll, 1x Green Tea', total: '$16.20', payment: 'Credit Card', status: 'on_the_way', time: '12m ago' },
    { id: 'ORD-8919', customer: 'Bopha Vong', items: '1x Beef Lok Lak, 1x Coconut Shake', total: '$13.50', payment: 'Cash', status: 'delivered', time: '26m ago' },
    { id: 'ORD-8918', customer: 'Virak Keo', items: '3x Crispy Wings, 2x Soda', total: '$22.00', payment: 'ABA KHQR', status: 'pending', time: '1m ago' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">⏳ Pending Acceptance</span>;
      case 'preparing':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">🍳 Cooking</span>;
      case 'on_the_way':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">🛵 On The Way</span>;
      case 'delivered':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">✅ Delivered</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-orange-500/20">
              🍔
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">BiteCraft</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase bg-orange-100 text-orange-700 rounded-md">
                  Web Hub
                </span>
              </div>
              <p className="text-xs text-slate-500">Restaurant Operations & Kitchen Control</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Backend API Status Pill */}
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
              <span className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-slate-600 font-medium">
                {apiStatus === 'connected' ? 'API Live (Port 3000)' : 'API Connecting...'}
              </span>
            </div>

            <button className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-orange-500/25 transition-all">
              + New Menu Item
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-orange-500/30">
              <span>⚡ Tailwind CSS v4 Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Restaurant Kitchen & Order Operations
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Manage incoming mobile food orders, control kitchen workflow, update live driver delivery dispatch, and edit food menus seamlessly with pure Tailwind CSS.
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-xs font-medium text-emerald-600 flex items-center space-x-1">
                <span>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Section Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex space-x-2">
              {['orders', 'menu', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'orders' ? 'Live Orders (4)' : tab === 'menu' ? 'Menu Catalog' : 'Analytics'}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Auto-updating via Socket.IO
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Ordered Items</th>
                  <th className="px-6 py-3.5">Total & Method</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{order.customer}</div>
                      <div className="text-xs text-slate-500">{order.time}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{order.items}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{order.total}</div>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {order.payment}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        BiteCraft Restaurant Management Hub • Styled exclusively with Tailwind CSS v4
      </footer>
    </div>
  );
}
