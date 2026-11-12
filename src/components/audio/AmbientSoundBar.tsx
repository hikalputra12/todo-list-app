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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-40 select-none">
      <div className="flex items-center justify-between px-3 py-2 rounded-full bg-[#F5F1EB]/95 border border-[#E7E0D6] backdrop-blur-md shadow-lg shadow-black/5 transition-all">
        {/* Sound Selection Chips */}
        <div className="flex items-center gap-1">
          {soundOptions.map((opt) => {
            const isSelected = activeSound === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => onSelectSound(opt.type)}
                aria-label={opt.label}
                title={opt.label}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-all ${
                  isSelected
                    ? 'bg-[#C49767] text-white font-medium shadow-sm'
                    : 'text-[#78716C] hover:text-[#2D2A26] hover:bg-[#EFE9DF]'
                }`}
              >
                {opt.icon}
                <span className="text-[11px] font-sans">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-[#E7E0D6]/80">
          <Volume2 size={14} className="text-[#78716C] shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            aria-label="Volume suara ambient"
            className="w-16 h-1 bg-[#E7E0D6] rounded-lg appearance-none cursor-pointer accent-[#C49767]"
          />
        </div>
      </div>
    </div>
  );
};
