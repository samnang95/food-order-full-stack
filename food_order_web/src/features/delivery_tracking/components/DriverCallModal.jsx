import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

export function DriverCallModal({ isOpen, onClose, driver }) {
  const [callState, setCallState] = useState('calling'); // 'calling' | 'connected' | 'ended'
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const ringIntervalRef = useRef(null);

  // Play phone ring tone using Web Audio API
  const playRingTone = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 440;
      osc2.frequency.value = 480;

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const playPickupBeep = () => {
    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // ignore
    }
  };

  const playHangupTone = () => {
    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setCallState('calling');
      setSeconds(0);
      setIsMuted(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      return;
    }

    // Start ringing
    playRingTone();
    ringIntervalRef.current = setInterval(playRingTone, 2400);

    // Simulate driver answering after 2.6 seconds
    const answerTimeout = setTimeout(() => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      playPickupBeep();
      setCallState('connected');
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }, 2600);

    return () => {
      clearTimeout(answerTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    };
  }, [isOpen]);

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    playHangupTone();
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 450);
  };

  if (!isOpen || !driver) return null;

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-8 text-center text-white overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            HD Audio Call
          </span>
          <span className="font-mono text-slate-400">
            {callState === 'connected' ? formatTimer(seconds) : 'Connecting...'}
          </span>
        </div>

        {/* Driver Avatar with Pulsing Rings */}
        <div className="relative inline-block my-4">
          <div
            className={`absolute -inset-3 rounded-full transition-all duration-700 ${
              callState === 'calling'
                ? 'bg-orange-500/20 animate-ping'
                : 'bg-emerald-500/20 animate-pulse'
            }`}
          />
          <img
            src={driver.avatar || driver.driverAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
            alt={driver.name || driver.driverName}
            className="relative w-24 h-24 rounded-full object-cover ring-4 ring-orange-500/60 shadow-xl mx-auto"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120';
            }}
          />
        </div>

        {/* Driver Name & Subtitle */}
        <h3 className="text-xl font-black font-display text-white mt-2">
          {driver.name || driver.driverName || 'Delivery Rider'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          🛵 {driver.vehicleType || driver.vehicle || 'Motorbike'} • {driver.vehiclePlate || driver.plate || 'PP-0000'}
        </p>

        {/* Status / Audio Waveform Visualizer */}
        <div className="h-10 my-4 flex items-center justify-center">
          {callState === 'calling' && (
            <div className="flex items-center gap-1 text-xs text-orange-400 font-bold animate-pulse">
              <span>Calling driver...</span>
            </div>
          )}

          {callState === 'connected' && (
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-3 rounded-full bg-emerald-400 animate-[bounce_1s_infinite_100ms]" />
              <span className="w-1 h-6 rounded-full bg-emerald-400 animate-[bounce_1s_infinite_200ms]" />
              <span className="w-1 h-4 rounded-full bg-emerald-400 animate-[bounce_1s_infinite_300ms]" />
              <span className="w-1 h-7 rounded-full bg-emerald-400 animate-[bounce_1s_infinite_150ms]" />
              <span className="w-1 h-3 rounded-full bg-emerald-400 animate-[bounce_1s_infinite_250ms]" />
              <span className="text-xs font-bold text-emerald-400 ml-2">Connected</span>
            </div>
          )}

          {callState === 'ended' && (
            <span className="text-xs font-bold text-rose-400">Call Ended</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {/* Mute Mic */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`w-13 h-13 rounded-2xl flex flex-col items-center justify-center text-xs transition cursor-pointer border ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700/60 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            <span className="text-lg">{isMuted ? '🔇' : '🎙️'}</span>
            <span className="text-[9px] font-bold mt-0.5">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 flex items-center justify-center text-2xl transition hover:scale-105 active:scale-95 cursor-pointer"
            title="End Call"
          >
            📞
          </button>

          {/* Speakerphone */}
          <button
            type="button"
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-13 h-13 rounded-2xl flex flex-col items-center justify-center text-xs transition cursor-pointer border ${
              isSpeaker
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700/60 hover:bg-slate-700'
            }`}
            title="Speakerphone"
          >
            <span className="text-lg">{isSpeaker ? '🔊' : '🔈'}</span>
            <span className="text-[9px] font-bold mt-0.5">{isSpeaker ? 'Speaker' : 'Ear'}</span>
          </button>
        </div>

        {/* Fallback Cellular Call */}
        <div className="mt-8 pt-4 border-t border-slate-800/80">
          <a
            href={`tel:${driver.phone || driver.driverPhone || '+85512889900'}`}
            className="text-[11px] font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5"
          >
            <span>📱 Switch to direct cellular call</span>
            <span className="font-mono text-slate-500">
              ({driver.phone || driver.driverPhone || '+85512889900'})
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

DriverCallModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  driver: PropTypes.object,
};
