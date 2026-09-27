import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSavedAddresses } from '../../profile/use_saved_addresses';
import { useTranslation } from '../../../core';

const PRESET_LABELS = [
  { key: 'Home', icon: '🏠', translationKey: 'checkout.addressLabelHome' },
  { key: 'Work', icon: '🏢', translationKey: 'checkout.addressLabelWork' },
  { key: 'Partner', icon: '❤️', translationKey: 'checkout.addressLabelPartner' },
  { key: 'Gym', icon: '🏋️', translationKey: 'checkout.addressLabelGym' },
  { key: 'Other', icon: '📍', translationKey: 'checkout.addressLabelOther' },
];

export function SaveAddressModal({
  isOpen,
  onClose,
  initialAddress = '',
  initialNote = '',
  initialCoords = [11.551, 104.925],
  onSaveSuccess,
}) {
  if (!isOpen) return null;

  return (
    <SaveAddressModalDialog
      onClose={onClose}
      initialAddress={initialAddress}
      initialNote={initialNote}
      initialCoords={initialCoords}
      onSaveSuccess={onSaveSuccess}
    />
  );
}

function SaveAddressModalDialog({
  onClose,
  initialAddress = '',
  initialNote = '',
  initialCoords = [11.551, 104.925],
  onSaveSuccess,
}) {
  const { t } = useTranslation();
  const { addAddress } = useSavedAddresses();

  const [selectedLabel, setSelectedLabel] = useState('Home');
  const [customLabel, setCustomLabel] = useState('');
  const [address, setAddress] = useState(initialAddress);
  const [note, setNote] = useState(initialNote);
  const [isDefault, setIsDefault] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.trim()) return;

    const finalLabel = selectedLabel === 'Other' && customLabel.trim()
      ? customLabel.trim()
      : selectedLabel;

    const newAddr = addAddress({
      label: finalLabel,
      address: address.trim(),
      note: note.trim(),
      lat: initialCoords[0] || 11.551,
      lng: initialCoords[1] || 104.925,
      isDefault,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      onSaveSuccess?.(newAddr);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center space-x-2.5">
            <span className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-lg shadow-md shadow-orange-500/25">
              📍
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                {t('checkout.saveAddressTitle')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Save to your address book for instant 1-click delivery
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center animate-in fade-in duration-200">
              ✓ {t('checkout.addressSavedSuccess')}
            </div>
          )}

          {/* Preset Label Pills */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Address Category
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_LABELS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedLabel(item.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    selectedLabel === item.key
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-102'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{t(item.translationKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedLabel === 'Other' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Custom Name (Optional)
              </label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g. Villa 24, Mom's House, Studio"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          )}

          {/* Full Street Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Detailed Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Building 45, Street 302, Sangkat BKK 1"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            />
          </div>

          {/* Rider Delivery Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              {t('checkout.noteForRider')} (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Leave with security, ring bell, 3rd floor"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            />
          </div>

          {/* Pinned Coordinates Preview */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1 font-medium">
              <span>📍</span>
              <span>Map Pin GPS:</span>
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {initialCoords[0]?.toFixed(4)}, {initialCoords[1]?.toFixed(4)}
            </span>
          </div>

          {/* Set as default checkbox */}
          <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded-md border-slate-300 text-orange-500 focus:ring-orange-500"
            />
            <span>Set as default delivery address</span>
          </label>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center space-x-1.5"
            >
              <span>💾</span>
              <span>Save to Address Book</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

SaveAddressModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialAddress: PropTypes.string,
  initialNote: PropTypes.string,
  initialCoords: PropTypes.arrayOf(PropTypes.number),
  onSaveSuccess: PropTypes.func,
};

SaveAddressModalDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  initialAddress: PropTypes.string,
  initialNote: PropTypes.string,
  initialCoords: PropTypes.arrayOf(PropTypes.number),
  onSaveSuccess: PropTypes.func,
};

