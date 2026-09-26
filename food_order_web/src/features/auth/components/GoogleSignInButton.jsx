import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AppConfig } from '../../../core';

export function GoogleSignInButton({ onCredential, disabled = false }) {
  const containerRef = useRef(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    let checkInterval = null;
    let attempts = 0;

    const initGsi = () => {
      if (window.google?.accounts?.id && containerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: AppConfig.googleClientId,
            callback: (response) => {
              if (response?.credential) {
                onCredential(response.credential);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Check if dark mode is active
          const isDark = document.documentElement.classList.contains('dark');

          // Clear previous render if any
          containerRef.current.innerHTML = '';

          window.google.accounts.id.renderButton(containerRef.current, {
            type: 'standard',
            shape: 'pill',
            theme: isDark ? 'filled_black' : 'outline',
            text: 'continue_with',
            size: 'large',
            logo_alignment: 'left',
            width: 320,
          });

          setGisLoaded(true);
        } catch (err) {
          console.warn('[GoogleSignIn] GSI render warning:', err);
          setInitError(err.message || 'Failed to initialize Google Sign-In');
        }
        return true;
      }
      return false;
    };

    if (!initGsi()) {
      checkInterval = setInterval(() => {
        attempts += 1;
        if (initGsi() || attempts > 25) {
          clearInterval(checkInterval);
          if (attempts > 25 && !window.google?.accounts?.id) {
            setInitError('Google Sign-In service could not be loaded');
          }
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [onCredential]);

  const handleManualClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.debug('[GoogleSignIn] One Tap not displayed:', notification.getNotDisplayedReason());
        }
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Official Google GSI Render Container */}
      <div
        ref={containerRef}
        className={`min-h-[44px] flex items-center justify-center transition-opacity ${
          gisLoaded ? 'opacity-100' : 'hidden'
        } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      />

      {/* Styled Fallback / Loading Google Button */}
      {!gisLoaded && (
        <button
          type="button"
          onClick={handleManualClick}
          disabled={disabled}
          className="w-full py-2.5 px-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 shadow-xs flex items-center justify-center space-x-3 transition-all active:scale-98 disabled:opacity-50"
        >
          {/* Authentic Google 'G' Logo SVG */}
          <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.24C.45 8.18 0 9.99 0 12s.45 3.82 1.24 5.4l4.04-3.13z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.6l4.04 3.13c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      )}

      {initError && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-center">
          Note: Ensure third-party cookies/scripts are allowed for Google Sign-In.
        </p>
      )}
    </div>
  );
}

GoogleSignInButton.propTypes = {
  onCredential: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
