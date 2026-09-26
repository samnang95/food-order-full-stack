export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
          🍔
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          BiteCraft Web
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Tailwind CSS v4 is configured and ready. Clean slate for setting up your new architecture.
        </p>
        <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Clean State Ready</span>
        </div>
      </div>
    </div>
  );
}
