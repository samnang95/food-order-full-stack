import { useState, useEffect, useRef } from 'react';
import { useTranslation, ApiClient } from '../../../core';
import { DeliveryInstructionEntity } from '../../../domain/chat/entities/delivery_instruction_entity';

export function DriverChatDrawer({
  isOpen,
  onClose,
  driver,
  messages,
  isDriverTyping,
  driverTypingName,
  deliveryInstruction,
  onSendMessage,
  onSendPreset,
}) {
  const { t } = useTranslation();
  const presets = DeliveryInstructionEntity.getDefaultPresets();
  const [inputText, setInputText] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom of chat when new messages or typing state changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isDriverTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handlePhotoDropoff = () => {
    // Open native file picker for gate/location photo
    fileInputRef.current?.click();
  };

  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      let photoUrl = null;

      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await ApiClient.post('/upload', formData);
        photoUrl = res.url || res.imageUrl;
      } catch {
        // Fallback to local Data URL
        photoUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      if (photoUrl) {
        onSendMessage(file.name ? `📷 Photo: ${file.name}` : '📷 Drop-off Spot Photo', 'photo', photoUrl);
      }
    } catch (err) {
      console.error('Failed to attach photo:', err);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSampleDropoffPhoto = () => {
    const photoUrl = 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500';
    onSendMessage('📷 Photo Confirmation: Delivery drop-off spot', 'photo', photoUrl);
  };

  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={driver?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={driver?.name || 'Driver'}
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-orange-500 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  {driver?.name || 'Sok Dara'}
                </h3>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-md">
                  ★ {driver?.rating || '4.95'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-1">
                <span>🛵</span>
                <span className="line-clamp-1">{driver?.vehicle || 'Honda Scoopy • Phnom Penh 1AB-2345'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Call Button */}
            <a
              href={`tel:${driver?.phone || '+85512889900'}`}
              className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold shadow-2xs transition-all active:scale-95"
              title="Call Rider"
            >
              📞
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Active Delivery Instruction Banner */}
        {deliveryInstruction && (
          <div className="px-4 py-2 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border-b border-orange-200/50 dark:border-orange-800/40 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 overflow-hidden">
              <span className="shrink-0 text-sm">📍</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 mr-1.5">
                  Drop-off Note:
                </span>
                {deliveryInstruction}
              </p>
            </div>
          </div>
        )}

        {/* Messages Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          <div className="text-center py-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full">
              Today • Live Express Delivery
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender === 'customer';

            return (
              <div
                key={msg.id}
                className={`flex items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {/* Rider Avatar on left for incoming messages */}
                {!isMe && (
                  <img
                    src={msg.senderAvatar || driver?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                  />
                )}

                <div
                  className={`max-w-[78%] rounded-2xl p-3 shadow-xs space-y-1 transition-all ${
                    isMe
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  {/* Sender Role / Name snippet if rider */}
                  {!isMe && (
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                        {msg.senderName || 'Sok Dara (Rider)'}
                      </span>
                    </div>
                  )}

                  {/* Photo drop-off proof attachment */}
                  {msg.photoUrl && (
                    <div className="rounded-xl overflow-hidden mb-1.5 border border-white/20">
                      <img
                        src={msg.photoUrl}
                        alt="Drop-off photo"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}

                  <p className="text-xs leading-relaxed font-medium break-words">
                    {msg.text}
                  </p>

                  {/* Message footer timestamp + status ticks */}
                  <div
                    className={`flex items-center justify-end space-x-1 text-[9px] ${
                      isMe ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    <span>{formatTime(msg.timestamp)}</span>
                    {isMe && <span>✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isDriverTyping && (
            <div className="flex items-center space-x-2 animate-in fade-in duration-200">
              <img
                src={driver?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
                alt="Typing"
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-2 flex items-center space-x-1 border border-slate-200 dark:border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                <span className="text-[10px] text-slate-400 font-semibold ml-1.5">
                  {driverTypingName || 'Sok Dara'} is typing...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Presets Carousel */}
        <div className="px-3 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {presets.map((preset) => {
              const label = t(preset.key) || preset.defaultEn;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSendPreset(preset)}
                  className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-700/80 shadow-2xs transition-all active:scale-95 flex items-center space-x-1 cursor-pointer"
                >
                  <span>{preset.icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Input Controls */}
        <form
          onSubmit={handleSend}
          className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2"
        >
          {/* Hidden File Input for Native Photo Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFileSelect}
          />

          {/* Photo drop-off / gate photo upload */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={handlePhotoDropoff}
              disabled={isUploadingPhoto}
              title={t('chat.uploadGatePhoto') || 'Upload photo of your gate or drop-off location'}
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-600 flex items-center justify-center text-base transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isUploadingPhoto ? (
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                '📷'
              )}
            </button>

            <button
              type="button"
              onClick={handleSampleDropoffPhoto}
              title={t('chat.sendSamplePhoto') || 'Send sample drop-off spot'}
              className="hidden sm:flex w-7 h-7 rounded-xl bg-slate-50 hover:bg-orange-50 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-slate-400 hover:text-orange-600 items-center justify-center text-xs transition-colors shrink-0 cursor-pointer"
            >
              🖼️
            </button>
          </div>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('chat.inputPlaceholder') || 'Message your driver...'}
            className="flex-1 text-xs py-2.5 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isUploadingPhoto}
            className="w-10 h-10 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-orange-500/25 active:scale-95 transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
