import React from 'react';
import { AmbientSoundType } from '../../types';
import { CloudRain, Wind, Coffee, Volume2, VolumeX } from 'lucide-react';

interface AmbientSoundBarProps {
  activeSound: AmbientSoundType;
  volume: number;
  isPlaying: boolean;
  onSelectSound: (sound: AmbientSoundType) => void;
  onVolumeChange: (vol: number) => void;
}

export const AmbientSoundBar: React.FC<AmbientSoundBarProps> = ({
  activeSound,
  volume,
  onSelectSound,
  onVolumeChange,
}) => {
  const soundOptions: { type: AmbientSoundType; label: string; icon: React.ReactNode }[] = [
    { type: 'gentle_rain', label: 'Hujan', icon: <CloudRain size={15} /> },
    { type: 'bamboo_wind', label: 'Bambu', icon: <Wind size={15} /> },
    { type: 'tea_room', label: 'Teh', icon: <Coffee size={15} /> },
    { type: 'none', label: 'Hening', icon: <VolumeX size={15} /> },
  ];

  return (
    <nav
      aria-label="Ambient sound controls"
      className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-[390px] z-40 select-none box-border"
    >
      <div className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-[#F5F1EB]/95 border border-[#E7E0D6] backdrop-blur-md shadow-lg shadow-black/5 transition-all overflow-hidden">
        {/* Sound Selection Chips */}
        <div className="flex items-center gap-1 min-w-0">
          {soundOptions.map((opt) => {
            const isSelected = activeSound === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => onSelectSound(opt.type)}
                aria-label={opt.label}
                title={opt.label}
                className={`flex items-center gap-1.5 py-1.5 rounded-full transition-all shrink-0 ${
                  isSelected
                    ? 'px-3 bg-[#C49767] text-white font-medium shadow-sm'
                    : 'px-2 text-[#78716C] hover:text-[#2D2A26] hover:bg-[#EFE9DF]'
                }`}
              >
                <span className="shrink-0">{opt.icon}</span>
                {/* On mobile: only active button shows text to prevent overflow; on sm+ screens, all show */}
                <span
                  className={`text-[11px] font-sans whitespace-nowrap transition-all ${
                    isSelected ? 'inline' : 'hidden sm:inline'
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Volume Slider - with shrink-0 and compact responsive width */}
        <div className="flex items-center gap-1.5 pl-2 ml-1 border-l border-[#E7E0D6]/90 shrink-0">
          <Volume2 size={13} className="text-[#78716C] shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            aria-label="Volume suara ambient"
            className="w-12 sm:w-16 h-1 bg-[#E7E0D6] rounded-lg appearance-none cursor-pointer accent-[#C49767] shrink-0"
          />
        </div>
      </div>
    </nav>
  );
};
