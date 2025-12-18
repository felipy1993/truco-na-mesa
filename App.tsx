
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Menu, RotateCcw, Trophy, Minus, Plus, X, 
  Volume2, VolumeX, Edit2, Maximize, Minimize, 
  Eye, EyeOff, Palette, Sliders, ChevronRight
} from 'lucide-react';
import { GameState, ModalType } from './types.ts';

const INITIAL_STATE: GameState = {
  nos: { name: 'NÓS', points: 0, wins: 0 },
  eles: { name: 'ELES', points: 0, wins: 0 }
};

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

const App: React.FC = () => {
  const [game, setGame] = useState<GameState>(() => {
    const saved = localStorage.getItem('truco_v1_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [textColor, setTextColor] = useState(() => localStorage.getItem('truco_v1_color') || '#bef264');
  const [uiOpacity, setUiOpacity] = useState(() => parseFloat(localStorage.getItem('truco_v1_opacity') || '0.9'));
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('truco_v1_muted') === 'true');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>('none');
  const [handValue, setHandValue] = useState<number>(1);
  const [isTrucoAnimating, setIsTrucoAnimating] = useState(false);
  const [editingTeam, setEditingTeam] = useState<'nos' | 'eles' | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempHide, setTempHide] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('truco_v1_state', JSON.stringify(game));
    localStorage.setItem('truco_v1_color', textColor);
    localStorage.setItem('truco_v1_opacity', uiOpacity.toString());
    localStorage.setItem('truco_v1_muted', isMuted.toString());
  }, [game, textColor, uiOpacity, isMuted]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = (freq: number, duration: number, type: OscillatorType = 'sine') => {
    if (isMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  // Fix: Allow vibrate to accept a number or a pattern array to fix line 92
  const vibrate = (pattern: number | number[] = 40) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const updatePoints = (team: 'nos' | 'eles', delta: number) => {
    initAudio();
    const amount = delta > 0 ? handValue : -1;
    
    setGame(prev => {
      const newPoints = Math.max(0, prev[team].points + amount);
      
      if (newPoints >= 12) {
        playSound(880, 0.5, 'triangle');
        vibrate([100, 50, 100]);
        setHandValue(1);
        return {
          ...prev,
          nos: { ...prev.nos, points: 0, wins: team === 'nos' ? prev.nos.wins + 1 : prev.nos.wins },
          eles: { ...prev.eles, points: 0, wins: team === 'eles' ? prev.eles.wins + 1 : prev.eles.wins }
        };
      }

      playSound(delta > 0 ? 440 + (newPoints * 20) : 220, 0.1);
      vibrate();
      if (delta > 0) setHandValue(1);
      return { ...prev, [team]: { ...prev[team], points: newPoints } };
    });
  };

  const toggleTruco = () => {
    initAudio();
    const values: Record<number, number> = { 1: 3, 3: 6, 6: 9, 9: 12, 12: 1 };
    const next = values[handValue];
    setHandValue(next);
    if (next > 1) {
      setIsTrucoAnimating(true);
      playSound(150, 0.3, 'sawtooth');
      vibrate(80);
      setTimeout(() => setIsTrucoAnimating(false), 500);
    } else {
      vibrate(20);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getGlow = (color: string, intensity: number = 1) => ({
    color: color,
    textShadow: `0 0 ${8 * intensity}px ${color}88, 0 0 ${16 * intensity}px ${color}44`
  });

  const activeOpacity = tempHide ? 0.05 : uiOpacity;

  return (
    <div className="flex flex-col h-full w-full p-4 pt-[var(--safe-top)] pb-[var(--safe-bottom)] transition-all duration-700 bg-transparent text-white overflow-hidden">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-4 z-10 transition-opacity duration-500" style={{ opacity: activeOpacity }}>
        <button onClick={() => { initAudio(); setIsMenuOpen(true); vibrate(20); }} className="p-3 bg-white/5 neo-blur rounded-2xl border border-white/10 active:scale-90 transition-transform">
          <Menu size={24} style={{ color: textColor }} />
        </button>
        
        <div className="flex flex-col items-center" onClick={() => { setTempHide(true); setTimeout(() => setTempHide(false), 3000); }}>
          <h1 className="text-xl font-black tracking-tighter uppercase italic" style={getGlow(textColor)}>TRUCO PRO</h1>
          <div className="flex gap-1 mt-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: textColor, opacity: 0.3 }} />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
           <button onClick={toggleFullscreen} className="p-3 bg-white/5 neo-blur rounded-2xl border border-white/10 active:scale-90 transition-transform">
            {isFullscreen ? <Minimize size={20} style={{ color: textColor }} /> : <Maximize size={20} style={{ color: textColor }} />}
          </button>
        </div>
      </header>

      {/* Main Scoreboard */}
      <main className="flex-1 grid grid-cols-2 gap-4 transition-all duration-500" style={{ opacity: activeOpacity }}>
        {(['nos', 'eles'] as const).map(team => (
          <div key={team} className="flex flex-col items-center justify-between bg-white/[0.03] neo-blur rounded-[2.5rem] border border-white/5 p-4 py-8 relative">
            <button 
              onClick={() => { setEditingTeam(team); setTempName(game[team].name); }}
              className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/10 active:scale-95 transition-all"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase truncate max-w-[80px]">{game[team].name}</span>
              <Edit2 size={10} className="opacity-50" />
            </button>

            <div className="flex flex-col items-center my-6">
              <div className="text-7xl font-black tabular-nums transition-all duration-300" style={getGlow(textColor, 1.5)}>
                {game[team].points}
              </div>
              <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-white/5 rounded-full">
                <Trophy size={12} className="text-yellow-500" />
                <span className="text-xs font-bold tabular-nums opacity-80">{game[team].wins}</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <button 
                onClick={() => updatePoints(team, 1)}
                className="w-full py-8 bg-white/10 rounded-[2rem] border border-white/10 active:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
              >
                <Plus size={32} style={{ color: textColor }} />
              </button>
              <button 
                onClick={() => updatePoints(team, -1)}
                disabled={game[team].points === 0}
                className="w-full py-3 bg-black/40 rounded-2xl border border-white/5 active:bg-red-500/20 disabled:opacity-20 transition-all flex items-center justify-center"
              >
                <Minus size={18} />
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Bottom Controls */}
      <footer className="mt-6 flex flex-col gap-4 transition-opacity duration-500" style={{ opacity: activeOpacity }}>
        <button 
          onClick={toggleTruco}
          className={`w-full py-6 rounded-[2.5rem] border-2 transition-all active:scale-95 flex items-center justify-center relative overflow-hidden ${isTrucoAnimating ? 'animate-truco' : ''} ${handValue > 1 ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5'}`}
        >
          <span className={`text-3xl font-black italic uppercase tracking-tighter ${handValue > 1 ? 'text-orange-500' : ''}`} style={handValue === 1 ? getGlow(textColor) : {}}>
            {handValue === 1 ? 'TRUCO!' : `VALE ${handValue}`}
          </span>
          {handValue > 1 && <div className="absolute inset-0 bg-orange-500/10 animate-pulse" />}
        </button>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setModal('reset-points')} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10">
            <RotateCcw size={20} className="mb-1 opacity-60" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Zerar</span>
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10">
            {isMuted ? <VolumeX size={20} className="mb-1 text-red-400" /> : <Volume2 size={20} className="mb-1 text-green-400" />}
            <span className="text-[8px] font-bold uppercase tracking-widest">Som</span>
          </button>
          <button onClick={() => setTempHide(!tempHide)} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10">
             <EyeOff size={20} className="mb-1 opacity-60" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Eco</span>
          </button>
        </div>
      </footer>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
          <div className="w-4/5 max-w-sm bg-zinc-950 h-full p-8 border-r border-white/10 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black tracking-tight">AJUSTES</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
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

              <div className="pt-6 space-y-3">
                <button onClick={() => { setGame(prev => ({...prev, nos: {...prev.nos, wins: 0}, eles: {...prev.eles, wins: 0}})); setIsMenuOpen(false); vibrate(50); }} className="w-full py-4 bg-white/5 rounded-xl text-[10px] font-bold uppercase border border-white/5">Zerar Placar de Vitórias</button>
                <button onClick={() => { setGame(INITIAL_STATE); setHandValue(1); setIsMenuOpen(false); vibrate(100); }} className="w-full py-4 bg-red-500/20 text-red-400 rounded-xl text-[10px] font-bold uppercase border border-red-500/20">Reiniciar App</button>
              </div>
            </div>
            
            <div className="mt-auto pt-6 text-center opacity-20 text-[10px] font-mono italic">
              TRUCO NA MESA v1.0
            </div>
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        </div>
      )}

      {/* Edit Name Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in zoom-in duration-200">
          <div className="bg-zinc-900 p-8 rounded-[2.5rem] w-full max-w-xs border border-white/10 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-50 text-center">Editar Nome</h3>
            <input 
              autoFocus
              type="text" 
              value={tempName} 
              onChange={e => setTempName(e.target.value.toUpperCase())}
              className="w-full bg-black/50 border border-white/10 rounded-2xl py-5 text-center text-2xl font-black mb-8 focus:border-blue-500 outline-none"
              maxLength={10}
            />
            <div className="flex gap-3">
              <button onClick={() => setEditingTeam(null)} className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-bold uppercase">Cancelar</button>
              <button onClick={() => {
                setGame(prev => ({ ...prev, [editingTeam]: { ...prev[editingTeam], name: tempName || (editingTeam === 'nos' ? 'NÓS' : 'ELES') } }));
                setEditingTeam(null);
              }} className="flex-1 py-4 bg-blue-600 rounded-2xl text-[10px] font-bold uppercase">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Modal */}
      {modal === 'reset-points' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in zoom-in duration-200">
          <div className="bg-zinc-900 p-8 rounded-[2.5rem] w-full max-w-xs border border-white/10 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <RotateCcw className="text-red-500" size={32} />
            </div>
            <h3 className="text-lg font-black uppercase mb-2">Zerar Pontos?</h3>
            <p className="text-xs opacity-50 mb-8">Isso limpará os pontos da rodada atual mas manterá as vitórias.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => {
                setGame(prev => ({...prev, nos: {...prev.nos, points: 0}, eles: {...prev.eles, points: 0}}));
                setHandValue(1);
                setModal('none');
                vibrate(20);
              }} className="w-full py-5 bg-red-600 rounded-2xl font-black uppercase text-xs">Sim, Limpar</button>
              <button onClick={() => setModal('none')} className="w-full py-4 text-xs font-bold uppercase opacity-40">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
