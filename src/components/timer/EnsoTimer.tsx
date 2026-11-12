import React from 'react';
import { TimerMode } from '../../types';
import { TimerControls } from './TimerControls';

interface EnsoTimerProps {
  timeLeft: number;
  isRunning: boolean;
  mode: TimerMode;
  progress: number; // 0 to 1
  focusDuration?: number;
  onToggle: () => void;
  onReset: () => void;
  onSwitchMode: (mode: TimerMode) => void;
  onSetFocusDuration?: (minutes: number) => void;
}

export const EnsoTimer: React.FC<EnsoTimerProps> = ({
  timeLeft,
  isRunning,
  mode,
  progress,
  focusDuration = 25,
  onToggle,
  onReset,
  onSwitchMode,
  onSetFocusDuration = () => {},
}) => {
  // Format seconds to MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG circular dimensions
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Ensō circle has an organic gap (~10% unclosed)
  const arcLength = circumference * 0.9;
  const strokeDashoffset = arcLength * (1 - progress);

  return (
    <section className="flex flex-col items-center justify-center my-4 select-none">
      {/* Ensō Circular Canvas Container */}
      <div
        className="relative flex items-center justify-center cursor-pointer group"
        onClick={onToggle}
        title={isRunning ? 'Klik untuk jeda' : 'Klik untuk mulai'}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 transition-all duration-300"
        >
          {/* Subtle background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#E7E0D6"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            className="opacity-40"
          />

          {/* Active Ensō ink brush stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={mode === 'focus' ? '#C49767' : '#78716C'}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-linear"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-mono tracking-wider font-light text-[#2D2A26] transition-transform duration-200 group-hover:scale-105">
            {timeFormatted}
          </span>
          <span className="text-[11px] font-serif uppercase tracking-widest text-[#78716C] mt-1">
            {mode === 'focus' ? `Fokus ${focusDuration}m` : 'Rehat Sejenak'}
          </span>
        </div>
      </div>

      {/* Timer Controls (Buttons, Presets, Switcher) */}
      <TimerControls
        isRunning={isRunning}
        mode={mode}
        focusDuration={focusDuration}
        onToggle={onToggle}
        onReset={onReset}
        onSwitchMode={onSwitchMode}
        onSetFocusDuration={onSetFocusDuration}
      />
    </section>
  );
};
