import React from 'react';
import { TimerMode } from '../../types';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  mode: TimerMode;
  onToggle: () => void;
  onReset: () => void;
  onSwitchMode: (mode: TimerMode) => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  mode,
  onToggle,
  onReset,
  onSwitchMode,
}) => {
  return (
    <div className="flex flex-col items-center gap-3 mt-2">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-[#F5F1EB] border border-[#E7E0D6] text-xs">
        <button
          type="button"
          onClick={() => onSwitchMode('focus')}
          className={`px-3 py-1 rounded-full transition-all ${
            mode === 'focus'
              ? 'bg-[#C49767] text-white font-medium shadow-sm'
              : 'text-[#78716C] hover:text-[#2D2A26]'
          }`}
        >
          Fokus
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
    </div>
  );
};
