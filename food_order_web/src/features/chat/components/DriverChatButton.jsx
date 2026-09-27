import { useTranslation } from '../../../core';

export function DriverChatButton({ driver, unreadCount, onClick, variant = 'floating' }) {
  const { t } = useTranslation();

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="relative group px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 active:scale-95 transition-all flex items-center space-x-2.5 cursor-pointer"
      >
        <div className="relative">
          <img
            src={driver?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
            alt={driver?.name || 'Driver'}
            className="w-6 h-6 rounded-full object-cover ring-2 ring-white/60"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white animate-pulse" />
        </div>
        <span>{t('chat.chatWithDriver') || 'Chat with Rider'}</span>
        {unreadCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-white text-orange-600 font-black text-[10px] flex items-center justify-center shadow-xs animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  // Floating trigger button
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open Driver Chat"
      className="fixed bottom-6 right-6 z-40 group flex items-center space-x-3 p-2.5 pr-4 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-2xl shadow-slate-900/40 border border-slate-700/80 backdrop-blur-md active:scale-95 transition-all duration-300 cursor-pointer"
    >
      <div className="relative">
        <img
          src={driver?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
          alt={driver?.name || 'Driver'}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500 shadow-md"
        />
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center ring-2 ring-slate-900 shadow-md animate-bounce">
            {unreadCount}
          </span>
        )}
      </div>

      <div className="text-left hidden sm:block">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-black text-white">{driver?.name || 'Sok Dara'}</span>
          <span className="text-[10px] font-bold text-amber-400 flex items-center">
            ★ {driver?.rating || '4.9'}
          </span>
        </div>
        <p className="text-[10px] text-slate-300 flex items-center space-x-1">
          <span>🛵</span>
          <span>{t('chat.riderEnRoute') || 'Rider en route • Chat'}</span>
        </p>
      </div>

      <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">
        💬
      </div>
    </button>
  );
}
