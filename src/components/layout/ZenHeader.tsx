import React from 'react';

interface ZenHeaderProps {
  title?: string;
  subtitle?: string;
}

export const ZenHeader: React.FC<ZenHeaderProps> = ({
  title = 'Washi Focus',
  subtitle = 'Waktu Tenang',
}) => {
  // Format Indonesian date: e.g. "Kamis, 12 November"
  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <header className="flex flex-col items-center text-center my-3 transition-all">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-[#E7E0D6] bg-[#F5F1EB] text-[#78716C]">
          {subtitle}
        </span>
        <span className="text-xs text-[#78716C] font-mono">
          {dateStr}
        </span>
      </div>
      <h1 className="text-2xl font-serif tracking-wide text-[#2D2A26] font-normal">
        {title}
      </h1>
      <div className="w-8 h-[1px] bg-[#C49767] opacity-60 mt-2"></div>
    </header>
  );
};
