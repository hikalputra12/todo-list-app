import React from 'react';

interface WashiContainerProps {
  children: React.ReactNode;
}

export const WashiContainer: React.FC<WashiContainerProps> = ({ children }) => {
  return (
    <div className="min-h-[100dvh] bg-[#FBF9F5] text-[#2D2A26] flex flex-col items-center washi-paper-bg selection:bg-[#E7E0D6] relative">
      <main className="w-full max-w-md mx-auto px-5 pt-5 pb-28 flex flex-col min-h-[100dvh]">
        {children}
      </main>
    </div>
  );
};
