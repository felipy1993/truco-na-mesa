import React from 'react';
import { X, Palette, Sliders, Mic } from 'lucide-react';

const NEON_COLORS = [
  { name: 'Lima', value: '#bef264' },
  { name: 'Ciano', value: '#22d3ee' },
  { name: 'Rosa', value: '#f472b6' },
  { name: 'Amarelo', value: '#fde047' },
  { name: 'Roxo', value: '#c084fc' },
  { name: 'Laranja', value: '#fb923c' },
  { name: 'Vermelho', value: '#f87171' },
  { name: 'Branco', value: '#ffffff' },
];

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  textColor: string;
  setTextColor: (color: string) => void;
  uiOpacity: number;
  setUiOpacity: (opacity: number) => void;
  onResetWins: () => void;
  onResetApp: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen, onClose,
  textColor, setTextColor,
  uiOpacity, setUiOpacity,
  onResetWins, onResetApp,
  voices, selectedVoice, onSelectVoice
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
      <div className="w-4/5 max-w-sm bg-zinc-950 h-full p-8 border-r border-white/10 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-black tracking-tight">AJUSTES</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
        </div>

        <div className="space-y-8 flex-1 overflow-y-auto pr-2">
          <section>
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest opacity-50">
              <Palette size={14} /> Cor do Neon
            </div>
            <div className="grid grid-cols-4 gap-3">
              {NEON_COLORS.map(c => (
                <button 
                  key={c.value}
                  onClick={() => setTextColor(c.value)}
                  className={`aspect-square rounded-full border-2 transition-all ${textColor === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40'}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest opacity-50">
              <Sliders size={14} /> Opacidade UI
            </div>
            <input 
              type="range" min="0.2" max="1.0" step="0.1" 
              value={uiOpacity} onChange={e => setUiOpacity(parseFloat(e.target.value))}
              className="w-full"
            />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest opacity-50">
              <Mic size={14} /> Voz do Narrador
            </div>
            <select 
              value={selectedVoice}
              onChange={(e) => onSelectVoice(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-white/30"
            >
              <option value="">Padrão do Sistema</option>
              {voices.filter(v => v.lang.startsWith('pt')).map(v => (
                <option key={v.name} value={v.name}>
                  {v.name.replace('Google', '').replace('Microsoft', '').trim()}
                </option>
              ))}
              {/* Fallback if no PT voices found */}
              {voices.length > 0 && voices.every(v => !v.lang.startsWith('pt')) && (
                 voices.map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                 ))
              )}
            </select>
          </section>

          <div className="pt-6 space-y-3">
            <button onClick={onResetWins} className="w-full py-4 bg-white/5 rounded-xl text-[10px] font-bold uppercase border border-white/5">Zerar Placar de Vitórias</button>
            <button onClick={onResetApp} className="w-full py-4 bg-red-500/20 text-red-400 rounded-xl text-[10px] font-bold uppercase border border-red-500/20">Reiniciar App</button>
          </div>
        </div>
        
        <div className="mt-auto pt-6 text-center opacity-20 text-[10px] font-mono italic">
          TRUCO NA MESA v1.1
        </div>
      </div>
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    </div>
  );
};
