import React from 'react';
import { Menu, Maximize, Minimize } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onFullscreenClick: () => void;
  isFullscreen: boolean;
  textColor: string;
  onTitleClick: () => void;
  activeOpacity: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  onFullscreenClick, 
  isFullscreen, 
  textColor, 
  onTitleClick,
  activeOpacity
}) => {
  const getGlow = (color: string, intensity: number = 1) => ({
    color: color,
    textShadow: `0 0 ${8 * intensity}px ${color}88, 0 0 ${16 * intensity}px ${color}44`
  });

  return (
    <header className="flex items-center justify-between mb-4 z-10 transition-opacity duration-500" style={{ opacity: activeOpacity }}>
      <button onClick={onMenuClick} className="p-3 bg-white/5 neo-blur rounded-2xl border border-white/10 active:scale-90 transition-transform">
        <Menu size={24} style={{ color: textColor }} />
      </button>
      
      <div className="flex flex-col items-center" onClick={onTitleClick}>
        <h1 className="text-xl font-black tracking-tighter uppercase italic" style={getGlow(textColor)}>TRUCO PRO</h1>
        <div className="flex gap-1 mt-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: textColor, opacity: 0.3 }} />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
         <button onClick={onFullscreenClick} className="p-3 bg-white/5 neo-blur rounded-2xl border border-white/10 active:scale-90 transition-transform">
          {isFullscreen ? <Minimize size={20} style={{ color: textColor }} /> : <Maximize size={20} style={{ color: textColor }} />}
        </button>
      </div>
    </header>
  );
};
