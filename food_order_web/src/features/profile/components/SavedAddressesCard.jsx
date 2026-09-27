import { useState } from 'react';
import { useSavedAddresses } from '../use_saved_addresses';
import { useTranslation } from '../../../core';

const LABEL_ICONS = {
  Home: '🏠',
  Work: '🏢',
  Gym: '🏋️',
  Partner: '❤️',
  Other: '📍',
};

export function SavedAddressesCard() {
  const { t } = useTranslation();
  const { addresses, addAddress, removeAddress, setDefaultAddress } = useSavedAddresses();
  const [isAdding, setIsAdding] = useState(false);

  const [label, setLabel] = useState('Home');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!address.trim()) return;

    addAddress({
      label,
      address: address.trim(),
      note: note.trim(),
      isDefault,
    });

    setAddress('');
    setNote('');
    setIsDefault(false);
    setIsAdding(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-black">
            📍
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              {t('profile.savedAddresses') || 'Saved Addresses'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Manage your delivery locations for 1-click checkout
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 text-orange-600 dark:text-orange-400 text-xs font-bold transition-all flex items-center space-x-1"
        >
          <span>{isAdding ? '✕ Cancel' : '+ Add Address'}</span>
        </button>
      </div>

      {/* Add New Address Form Modal/Drawer */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(LABEL_ICONS).map((lbl) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setLabel(lbl)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  label === lbl
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                }`}
              >
                <span>{LABEL_ICONS[lbl]}</span>
                <span>{lbl}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Delivery Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Building 12, Street 302, Boeng Keng Kang 1, Phnom Penh"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Rider Instructions (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Call upon arrival, 2nd floor, leave at reception"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded-md border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <span>Set as default delivery address</span>
            </label>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      {/* Address List */}
      <div className="space-y-2.5">
        {addresses.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            {t('profile.noSavedAddresses') || 'No saved addresses yet.'}
          </div>
        ) : (
          addresses.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.isDefault
                  ? 'border-orange-500/60 bg-orange-50/20 dark:bg-orange-950/10'
                  : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start space-x-3 min-w-0">
                <span className="text-xl shrink-0 mt-0.5">
                  {LABEL_ICONS[item.label] || '📍'}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {item.label}
                    </span>
                    {item.isDefault && (
                      <span className="px-2 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-orange-500 text-white">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 break-words">
                    {item.address}
                  </p>
                  {item.note && (
                    <p className="text-[10px] text-slate-400 mt-0.5 italic">
                      Note: {item.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {!item.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(item.id)}
                    className="px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAddress(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  title="Delete address"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
