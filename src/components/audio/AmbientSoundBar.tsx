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
    { type: 'gentle_rain', label: 'Hujan', icon: <CloudRain size={13} /> },
    { type: 'bamboo_wind', label: 'Bambu', icon: <Wind size={13} /> },
    { type: 'tea_room', label: 'Teh', icon: <Coffee size={13} /> },
    { type: 'none', label: 'Hening', icon: <VolumeX size={13} /> },
  ];

  return (
    <nav
      aria-label="Ambient sound controls"
      className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 w-auto max-w-[96vw] z-40 select-none box-border"
    >
      <div className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#F5F1EB]/95 border border-[#E7E0D6] backdrop-blur-md shadow-lg shadow-black/5 transition-all">
        {/* Sound Selection Chips - All equal with both icon and text */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {soundOptions.map((opt) => {
            const isSelected = activeSound === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => onSelectSound(opt.type)}
                aria-label={opt.label}
                title={opt.label}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[10.5px] sm:text-[11px] font-sans whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#C49767] text-white font-medium shadow-sm'
                    : 'text-[#78716C] hover:text-[#2D2A26] hover:bg-[#EAE4D8]'
                }`}
              >
                <span className="shrink-0">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Compact Volume Control */}
        <div className="flex items-center gap-1 pl-1.5 sm:pl-2 border-l border-[#E7E0D6] shrink-0">
          <Volume2 size={13} className="text-[#78716C] shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            aria-label="Volume suara ambient"
            className="w-10 sm:w-14 h-1 bg-[#E7E0D6] rounded-lg appearance-none cursor-pointer accent-[#C49767] shrink-0"
          />
        </div>
      </div>
    </nav>
  );
};
