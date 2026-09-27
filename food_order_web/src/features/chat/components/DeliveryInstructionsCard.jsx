import { useState } from 'react';
import { useTranslation } from '../../../core';
import { DeliveryInstructionEntity } from '../../../domain/chat/entities/delivery_instruction_entity';

export function DeliveryInstructionsCard({
  currentInstruction,
  onSaveInstruction,
  onSendPresetToChat,
}) {
  const { t } = useTranslation();
  const presets = DeliveryInstructionEntity.getDefaultPresets();

  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleStartEdit = () => {
    setCustomText(currentInstruction || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    onSaveInstruction(customText.trim());
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSelectPreset = (preset) => {
    const text = t(preset.key) || preset.defaultEn;
    setCustomText(text);
    onSaveInstruction(text);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    if (onSendPresetToChat) {
      onSendPresetToChat(preset);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📋</span>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {t('chat.deliveryInstructions') || 'Delivery Instructions & Notes'}
            </h4>
            <p className="text-[11px] text-slate-400">
              {t('chat.instructionHelp') || 'Help your rider find your door or lobby quickly'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => (isEditing ? setIsEditing(false) : handleStartEdit())}
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
        >
          {isEditing ? t('common.cancel') || 'Cancel' : t('common.edit') || 'Edit'}
        </button>
      </div>

      {/* Active Instruction Display */}
      {!isEditing && (
        <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/40 flex items-start justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 block">
              {t('chat.activeNote') || 'Active Drop-off Note for Rider'}
            </span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {currentInstruction || t('chat.noInstruction') || 'No special note yet. Tap edit or pick a quick preset below.'}
            </p>
          </div>
          {savedSuccess && (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
              ✓ Saved!
            </span>
          )}
        </div>
      )}

      {/* Editing Mode */}
      {isEditing && (
        <div className="space-y-3 pt-1">
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={
              t('chat.customInstructionPlaceholder') ||
              'e.g. Leave at apartment lobby reception, ring intercom #402, or call upon arrival...'
            }
            rows={2}
            className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              {t('common.save') || 'Save Note'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Preset Buttons */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          {t('chat.oneTapPresets') || '1-Tap Delivery Presets'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => {
            const label = t(p.key) || p.defaultEn;
            const isSelected = currentInstruction === label;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-[11px] font-medium px-2.5 py-1.5 rounded-xl border transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{p.icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
