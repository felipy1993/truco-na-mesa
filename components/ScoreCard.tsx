import React from 'react';
import { Trophy, Plus, Minus, Edit2 } from 'lucide-react';
import { TeamState } from '../types';

interface ScoreCardProps {
  teamKey: 'nos' | 'eles';
  teamData: TeamState;
  onUpdatePoints: (delta: number) => void;
  onEditName: () => void;
  textColor: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ 
  teamData, 
  onUpdatePoints, 
  onEditName, 
  textColor 
}) => {
  const getGlow = (color: string, intensity: number = 1) => ({
    color: color,
    textShadow: `0 0 ${8 * intensity}px ${color}88, 0 0 ${16 * intensity}px ${color}44`
  });

  return (
    <div className="flex flex-col items-center justify-between bg-white/[0.03] neo-blur rounded-[2.5rem] border border-white/5 p-4 py-8 relative h-full">
      <button 
        onClick={onEditName}
        className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/10 active:scale-95 transition-all w-full justify-center max-w-[140px]"
      >
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase truncate max-w-[80px]">{teamData.name}</span>
        <Edit2 size={10} className="opacity-50 flex-shrink-0" />
      </button>

      <div className="flex flex-col items-center my-6">
        <div className="text-7xl font-black tabular-nums transition-all duration-300 select-none" style={getGlow(textColor, 1.5)}>
          {teamData.points}
        </div>
        <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-white/5 rounded-full">
          <Trophy size={12} className="text-yellow-500" />
          <span className="text-xs font-bold tabular-nums opacity-80">{teamData.wins}</span>
        </div>
      </div>

      <div className="w-full space-y-3 mt-auto">
        <button 
          onClick={() => onUpdatePoints(1)}
          className="w-full py-8 bg-white/10 rounded-[2rem] border border-white/10 active:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
        >
          <Plus size={32} style={{ color: textColor }} />
        </button>
        <button 
          onClick={() => onUpdatePoints(-1)}
          disabled={teamData.points === 0}
          className="w-full py-3 bg-black/40 rounded-2xl border border-white/5 active:bg-red-500/20 disabled:opacity-20 transition-all flex items-center justify-center"
        >
          <Minus size={18} />
        </button>
      </div>
    </div>
  );
};
