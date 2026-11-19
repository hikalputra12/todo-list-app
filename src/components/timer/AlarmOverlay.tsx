import React, { useEffect, useRef } from 'react';
import { BellOff, BellRing } from 'lucide-react';
import { TimerMode } from '../../types';

interface AlarmOverlayProps {
  isRinging: boolean;
  /** Mode the timer just switched INTO after finishing (used for the message). */
  nextMode: TimerMode;
  onStop: () => void;
}

/**
 * Full-screen alert shown while the time-up alarm is ringing.
 * The alarm only stops when the user explicitly presses the stop button.
 */
export const AlarmOverlay: React.FC<AlarmOverlayProps> = ({ isRinging, nextMode, onStop }) => {
  const stopButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the stop button (Enter/Space stops it) and flash the tab title for background tabs
  useEffect(() => {
    if (!isRinging) return;
    stopButtonRef.current?.focus();

    const originalTitle = document.title;
    let flip = false;
    const titleTimer = setInterval(() => {
      flip = !flip;
      document.title = flip ? '⏰ Waktu habis!' : originalTitle;
    }, 1000);
    document.title = '⏰ Waktu habis!';

    return () => {
      clearInterval(titleTimer);
      document.title = originalTitle;
    };
  }, [isRinging]);

  if (!isRinging) return null;

  const message =
    nextMode === 'focus' ? 'Rehat selesai. Saatnya kembali fokus.' : 'Sesi fokus selesai. Saatnya rehat sejenak.';

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alarm-title"
      aria-describedby="alarm-desc"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2D2A26]/60 backdrop-blur-sm p-4 animate-fadeIn"
    >
      <div className="w-full max-w-sm bg-[#FBF9F5] border border-[#E7E0D6] rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center animate-slideUp">
        <div className="w-16 h-16 rounded-full bg-[#C49767]/15 flex items-center justify-center text-[#C49767] animate-pulse">
          <BellRing size={30} />
        </div>
        <div>
          <h2 id="alarm-title" className="font-serif text-xl text-[#2D2A26]">
            Waktu habis!
          </h2>
          <p id="alarm-desc" className="text-sm text-[#78716C] mt-1">
            {message}
          </p>
        </div>
        <button
          ref={stopButtonRef}
          type="button"
          onClick={onStop}
          className="w-full py-3 rounded-xl bg-[#2D2A26] text-[#FBF9F5] font-medium text-base flex items-center justify-center gap-2 shadow-sm hover:bg-[#443F3B] active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C49767] focus-visible:ring-offset-2"
        >
          <BellOff size={18} />
          <span>Hentikan Alarm</span>
        </button>
      </div>
    </div>
  );
};
