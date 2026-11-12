import React, { useEffect, useState } from 'react';

interface ZenCelebrationProps {
  show: boolean;
  onDone?: () => void;
}

export const ZenCelebration: React.FC<ZenCelebrationProps> = ({ show, onDone }) => {
  const [active, setActive] = useState(show);

  useEffect(() => {
    if (show) {
      setActive(true);
      const timer = setTimeout(() => {
        setActive(false);
        if (onDone) onDone();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!active) return null;

  // 12 subtle falling leaf particles with organic pastel hues
  const leaves = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 90 + 5}%`,
    delay: `${Math.random() * 1.5}s`,
    duration: `${2.5 + Math.random() * 2}s`,
    size: 14 + Math.random() * 10,
    rotate: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute top-[-40px] animate-fall opacity-80"
          style={{
            left: leaf.left,
            animationDelay: leaf.delay,
            animationDuration: leaf.duration,
            transform: `rotate(${leaf.rotate}deg)`,
          }}
        >
          {/* Leaf / Sakura petal SVG */}
          <svg
            width={leaf.size}
            height={leaf.size}
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#C49767]/70"
          >
            <path
              d="M12 2C7 7 4 14 12 22C20 14 17 7 12 2Z"
              fill="currentColor"
              opacity="0.8"
            />
          </svg>
        </div>
      ))}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#F5F1EB] border border-[#E7E0D6] px-4 py-1.5 rounded-full shadow-md text-xs font-serif text-[#2D2A26] animate-bounce">
        🌸 Hari ini terasa bermakna & tenang
      </div>
    </div>
  );
};
