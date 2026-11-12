import React, { useState } from 'react';
import { TimerMode } from '../../types';
import { Play, Pause, RotateCcw, SlidersHorizontal, Check, X, Plus, Minus } from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  mode: TimerMode;
  focusDuration: number;
  onToggle: () => void;
  onReset: () => void;
  onSwitchMode: (mode: TimerMode) => void;
  onSetFocusDuration: (minutes: number) => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  mode,
  focusDuration,
  onToggle,
  onReset,
  onSwitchMode,
  onSetFocusDuration,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempMinutes, setTempMinutes] = useState(focusDuration);

  const presets = [15, 25, 30, 45, 50, 60, 90, 120];

  const handleOpenModal = () => {
    setTempMinutes(focusDuration);
    setIsModalOpen(true);
  };

  const handleApply = () => {
    const valid = Math.max(1, Math.min(240, tempMinutes));
    onSetFocusDuration(valid);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-2 w-full">
      {/* Mode Switcher Tabs + Edit Button */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#F5F1EB] border border-[#E7E0D6] text-xs">
        <button
          type="button"
          onClick={() => onSwitchMode('focus')}
          className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
            mode === 'focus'
              ? 'bg-[#C49767] text-white font-medium shadow-sm'
              : 'text-[#78716C] hover:text-[#2D2A26]'
          }`}
        >
          <span>Fokus {focusDuration}m</span>
        </button>

        <button
          type="button"
          onClick={() => onSwitchMode('shortBreak')}
          className={`px-3 py-1 rounded-full transition-all ${
            mode === 'shortBreak'
              ? 'bg-[#C49767] text-white font-medium shadow-sm'
              : 'text-[#78716C] hover:text-[#2D2A26]'
          }`}
        >
          Rehat 5m
        </button>

        <button
          type="button"
          onClick={() => onSwitchMode('longBreak')}
          className={`px-3 py-1 rounded-full transition-all ${
            mode === 'longBreak'
              ? 'bg-[#C49767] text-white font-medium shadow-sm'
              : 'text-[#78716C] hover:text-[#2D2A26]'
          }`}
        >
          Rehat 15m
        </button>

        {/* Edit duration button */}
        <button
          type="button"
          onClick={handleOpenModal}
          title="Atur durasi fokus"
          aria-label="Atur durasi fokus"
          className="w-7 h-7 rounded-full flex items-center justify-center text-[#78716C] hover:text-[#2D2A26] hover:bg-[#EAE4D8] transition-colors"
        >
          <SlidersHorizontal size={13} />
        </button>
      </div>

      {/* Main Play/Pause & Reset Action Row */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onReset}
          aria-label="Atur ulang timer"
          title="Atur ulang timer"
          className="w-10 h-10 rounded-full flex items-center justify-center border border-[#E7E0D6] bg-[#F5F1EB] text-[#78716C] hover:text-[#2D2A26] hover:bg-[#EFE9DF] transition-all"
        >
          <RotateCcw size={16} />
        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-label={isRunning ? 'Jeda timer' : 'Mulai timer'}
          className={`px-6 py-2.5 rounded-full flex items-center gap-2 font-medium text-sm transition-all duration-300 shadow-sm ${
            isRunning
              ? 'bg-[#F5F1EB] border border-[#C49767] text-[#C49767] hover:bg-[#EFE9DF]'
              : 'bg-[#2D2A26] text-[#FBF9F5] hover:bg-[#443F3B]'
          }`}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          <span>{isRunning ? 'Jeda' : 'Mulai Fokus'}</span>
        </button>
      </div>

      {/* Modal / Dialog Atur Durasi Fokus */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#FBF9F5] border border-[#E7E0D6] rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-slideUp text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E7E0D6] pb-2">
              <div>
                <h3 className="font-serif text-base font-medium text-[#2D2A26]">
                  Atur Durasi Fokus
                </h3>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Sesuaikan dengan teknik dan ritme belajar Anda
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#78716C] hover:bg-[#F5F1EB]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Stepper & Number Display */}
            <div className="flex items-center justify-center gap-4 py-2">
              <button
                type="button"
                onClick={() => setTempMinutes((prev) => Math.max(5, prev - 5))}
                className="w-10 h-10 rounded-full border border-[#E7E0D6] bg-[#F5F1EB] flex items-center justify-center text-[#78716C] hover:text-[#2D2A26] active:scale-95"
              >
                <Minus size={16} />
              </button>

              <div className="flex items-baseline gap-1 text-center min-w-[100px] justify-center">
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={tempMinutes}
                  onChange={(e) => setTempMinutes(parseInt(e.target.value) || 1)}
                  className="w-16 text-3xl font-mono text-center font-normal bg-transparent border-b border-[#C49767] text-[#2D2A26] focus:outline-none"
                />
                <span className="text-sm font-serif text-[#78716C]">menit</span>
              </div>

              <button
                type="button"
                onClick={() => setTempMinutes((prev) => Math.min(240, prev + 5))}
                className="w-10 h-10 rounded-full border border-[#E7E0D6] bg-[#F5F1EB] flex items-center justify-center text-[#78716C] hover:text-[#2D2A26] active:scale-95"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C]">
                Pilihan Cepat
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTempMinutes(p)}
                    className={`py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      tempMinutes === p
                        ? 'border-[#C49767] bg-[#C49767] text-white font-medium shadow-sm'
                        : 'border-[#E7E0D6] bg-[#F5F1EB] text-[#78716C] hover:text-[#2D2A26] hover:bg-[#EFE9DF]'
                    }`}
                  >
                    {p}m
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#E7E0D6]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 rounded-lg border border-[#E7E0D6] text-xs text-[#78716C] hover:bg-[#F5F1EB]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-2 rounded-lg bg-[#2D2A26] text-[#FBF9F5] text-xs font-medium hover:bg-[#443F3B] flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check size={14} />
                <span>Terapkan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
