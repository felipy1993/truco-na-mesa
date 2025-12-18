import React from 'react';

interface TrucoButtonProps {
  handValue: number;
  onToggle: () => void;
  isAnimating: boolean;
  textColor: string;
}

export const TrucoButton: React.FC<TrucoButtonProps> = ({ 
  handValue, 
  onToggle, 
  isAnimating, 
  textColor 
}) => {
  const getGlow = (color: string, intensity: number = 1) => ({
    color: color,
    textShadow: `0 0 ${8 * intensity}px ${color}88, 0 0 ${16 * intensity}px ${color}44`
  });

  return (
    <button 
      onClick={onToggle}
      className={`w-full py-6 rounded-[2.5rem] border-2 transition-all active:scale-95 flex items-center justify-center relative overflow-hidden ${isAnimating ? 'animate-truco' : ''} ${handValue > 1 ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5'}`}
    >
      <span className={`text-3xl font-black italic uppercase tracking-tighter ${handValue > 1 ? 'text-orange-500' : ''}`} style={handValue === 1 ? getGlow(textColor) : {}}>
        {handValue === 1 ? 'TRUCO!' : `VALE ${handValue}`}
      </span>
      {handValue > 1 && <div className="absolute inset-0 bg-orange-500/10 animate-pulse" />}
    </button>
  );
};
