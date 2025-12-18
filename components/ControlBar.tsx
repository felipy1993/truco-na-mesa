import React from 'react';
import { RotateCcw, Volume2, VolumeX, EyeOff } from 'lucide-react';

interface ControlBarProps {
  onResetPoints: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onToggleEco: () => void;
  activeOpacity: number;
}

export const ControlBar: React.FC<ControlBarProps> = ({ 
  onResetPoints, 
  onToggleMute, 
  isMuted, 
  onToggleEco, 
  activeOpacity 
}) => {
  return (
    <div className="grid grid-cols-3 gap-3 transition-opacity duration-500" style={{ opacity: activeOpacity }}>
      <button onClick={onResetPoints} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10">
        <RotateCcw size={20} className="mb-1 opacity-60" />
        <span className="text-[8px] font-bold uppercase tracking-widest">Zerar</span>
      </button>
      <button onClick={onToggleMute} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10">
        {isMuted ? <VolumeX size={20} className="mb-1 text-red-400" /> : <Volume2 size={20} className="mb-1 text-green-400" />}
        <span className="text-[8px] font-bold uppercase tracking-widest">Som</span>
      </button>
      <button onClick={onToggleEco} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10">
         <EyeOff size={20} className="mb-1 opacity-60" />
        <span className="text-[8px] font-bold uppercase tracking-widest">Eco</span>
      </button>
    </div>
  );
};
