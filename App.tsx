
import { Menu, Info, BookOpen, RotateCcw, Trophy, Club, Heart, Minus, Plus, X, Volume2, VolumeX, Sparkles, Undo2, Spade, Diamond, Palette, Shield, Edit2, Image as ImageIcon, Link as LinkIcon, Upload, Eye, EyeOff, Sliders, Pipette, Maximize, Minimize } from 'lucide-react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, ModalType, WallpaperType } from './types';

const INITIAL_STATE: GameState = {
  nos: { name: 'Nós', points: 0, wins: 0 },
  eles: { name: 'Eles', points: 0, wins: 0 }
};

const TEXT_COLORS = [
  { name: 'Neon Verde', value: '#39ff14' },
  { name: 'Branco', value: '#ffffff' },
  { name: 'Neon Ciano', value: '#00ffff' },
  { name: 'Neon Rosa', value: '#ff00ff' },
  { name: 'Neon Roxo', value: '#bc13fe' },
  { name: 'Neon Amarelo', value: '#ccff00' },
  { name: 'Neon Laranja', value: '#ffad00' },
  { name: 'Neon Vermelho', value: '#ff3131' },
  { name: 'Preto', value: '#000000' },
  { name: 'Grafite', value: '#27272a' },
  { name: 'Marinho', value: '#1e3a8a' },
  { name: 'Musgo', value: '#064e3b' },
];

const App: React.FC = () => {
  const [game, setGame] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('truco-na-mesa-state');
      return saved ? JSON.parse(saved) : INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });

  const [wallpaper, setWallpaper] = useState<WallpaperType>(() => {
    try {
      return (localStorage.getItem('truco-na-mesa-wallpaper') as WallpaperType) || 'team-mir';
    } catch {
      return 'team-mir';
    }
  });

  const [textColor, setTextColor] = useState(() => {
    try {
      return localStorage.getItem('truco-na-mesa-text-color') || '#39ff14';
    } catch {
      return '#39ff14';
    }
  });

  const [uiOpacity, setUiOpacity] = useState(() => {
    try {
      const saved = localStorage.getItem('truco-na-mesa-opacity');
      return saved ? Math.max(0.1, parseFloat(saved)) : 0.8;
    } catch {
      return 0.8;
    }
  });

  const [tempHide, setTempHide] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modal, setModal] = useState<ModalType>('none');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTrucoShaking, setIsTrucoShaking] = useState(false);
  const [handValue, setHandValue] = useState<number>(1);
  const [lastWinner, setLastWinner] = useState<'nos' | 'eles' | null>(null);
  const [editingTeam, setEditingTeam] = useState<'nos' | 'eles' | null>(null);
  const [tempName, setTempName] = useState('');
  
  const [isMuted, setIsMuted] = useState(() => {
    try {
      const saved = localStorage.getItem('truco-na-mesa-muted');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = useCallback((type: 'plus' | 'minus' | 'truco' | 'win') => {
    if (isMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'plus':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'minus':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'truco':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'win':
        // Arpeggio simples
        [440, 554, 659, 880].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + (i * 0.1));
          g.gain.setValueAtTime(0.1, now + (i * 0.1));
          g.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.1) + 0.3);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + (i * 0.1));
          o.stop(now + (i * 0.1) + 0.3);
        });
        break;
    }
  }, [isMuted]);

  useEffect(() => {
    try {
      localStorage.setItem('truco-na-mesa-state', JSON.stringify(game));
      localStorage.setItem('truco-na-mesa-muted', JSON.stringify(isMuted));
      localStorage.setItem('truco-na-mesa-opacity', uiOpacity.toString());
      localStorage.setItem('truco-na-mesa-text-color', textColor);
      localStorage.setItem('truco-na-mesa-wallpaper', wallpaper);
    } catch (e) {
      console.warn("LocalStorage storage failed", e);
    }
  }, [game, isMuted, uiOpacity, textColor, wallpaper]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    const autoEnterFullscreen = () => {
      const docEl = document.documentElement as any;
      const request = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
      if (request && !document.fullscreenElement) {
        request.call(docEl).catch(() => {});
      }
      document.removeEventListener('click', autoEnterFullscreen);
      document.removeEventListener('touchstart', autoEnterFullscreen);
    };

    document.addEventListener('click', autoEnterFullscreen);
    document.addEventListener('touchstart', autoEnterFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('click', autoEnterFullscreen);
      document.removeEventListener('touchstart', autoEnterFullscreen);
    };
  }, []);

  const toggleFullscreen = () => {
    initAudio();
    const docEl = document.documentElement as any;
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      const request = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
      if (request) request.call(docEl).catch(console.error);
    } else {
      const exit = document.exitFullscreen || (document as any).webkitExitFullscreen || (document as any).msExitFullscreen;
      if (exit) exit.call(document).catch(console.error);
    }
    vibrate(20);
  };

  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch {}
    }
  }, []);

  const toggleTempHide = () => {
    initAudio();
    setTempHide(true);
    vibrate(10);
    setTimeout(() => setTempHide(false), 3000);
  };

  const updatePoints = (team: 'nos' | 'eles', delta: number) => {
    initAudio();
    setGame(prev => {
      const amount = delta > 0 ? handValue : delta;
      const newPoints = Math.max(0, prev[team].points + amount);
      
      if (newPoints >= 12) {
        vibrate([200, 100, 200]);
        playSound('win');
        setLastWinner(team);
        setHandValue(1);
        setTimeout(() => setLastWinner(null), 4000);

        return {
          ...prev,
          nos: { ...prev.nos, points: 0, wins: team === 'nos' ? prev.nos.wins + 1 : prev.nos.wins },
          eles: { ...prev.eles, points: 0, wins: team === 'eles' ? prev.eles.wins + 1 : prev.eles.wins }
        };
      }
      
      vibrate(40);
      playSound(delta > 0 ? 'plus' : 'minus');
      
      if (delta > 0) setHandValue(1); 
      return { ...prev, [team]: { ...prev[team], points: newPoints } };
    });
  };

  const getGlowStyle = (color: string, intensity: number = 0.5) => {
    const isDark = ['#000000', '#27272a', '#1e3a8a', '#064e3b'].includes(color);
    if (isDark) return { color };
    return {
      color,
      textShadow: `0 0 ${10 * intensity}px ${color}aa, 0 0 ${20 * intensity}px ${color}66`
    };
  };

  const effectiveOpacity = tempHide ? 0.05 : uiOpacity;

  return (
    <div className={`flex flex-col h-full w-full p-4 pt-[var(--safe-top)] pb-[var(--safe-bottom)] relative font-sans select-none overflow-hidden transition-all duration-700 text-white`}>
      
      {/* Header */}
      <header className="flex items-center justify-between mb-2 px-2 shrink-0 transition-opacity duration-500" style={{ opacity: effectiveOpacity + 0.2 }}>
        <button onClick={() => { initAudio(); setIsMenuOpen(true); }} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/90 border border-white/20 active:scale-90 transition-all shadow-xl">
          <Menu size={24} style={{ color: textColor }} />
        </button>
        <div className="text-center px-6 py-2 bg-black/90 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl" onClick={toggleTempHide}>
          <h1 className="text-lg font-black tracking-[0.2em] uppercase leading-none" style={getGlowStyle(textColor, 1.0)}>Truco na Mesa</h1>
          <p className="text-[8px] font-bold opacity-70 uppercase tracking-[0.3em] mt-1" style={{ color: textColor }}>Toque para ocultar UI</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleFullscreen} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/90 border border-white/20 active:scale-90 transition-all shadow-xl">
            {isFullscreen ? <Minimize size={20} style={{ color: textColor }} /> : <Maximize size={20} style={{ color: textColor }} />}
          </button>
          <button onClick={toggleTempHide} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/90 border border-white/20 active:scale-90 transition-all shadow-xl">
            <Eye size={20} style={{ color: textColor }} />
          </button>
        </div>
      </header>

      {/* Placar Area */}
      <main className="flex-1 flex flex-col min-h-0 transition-all duration-500" style={{ opacity: effectiveOpacity }}>
        <div className="flex-1 grid grid-cols-2 gap-2 items-stretch py-2 min-h-0">
          {(['nos', 'eles'] as const).map((team) => {
            const isWinner = lastWinner === team;
            return (
              <div key={team} className={`flex flex-col items-center justify-between transition-all duration-500 relative bg-transparent py-2 ${isWinner ? 'scale-[1.05]' : ''}`}>
                <div className="flex flex-col items-center gap-2 w-full px-2 z-10">
                  <button 
                    onClick={() => { initAudio(); setEditingTeam(team); setTempName(game[team].name); }} 
                    className="flex items-center gap-1.5 px-4 py-2 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg w-full justify-center"
                  >
                    <h2 className="text-[10px] font-black tracking-widest uppercase truncate" style={getGlowStyle(textColor, 0.4)}>{game[team].name}</h2>
                    <Edit2 size={10} style={{ color: textColor, opacity: 0.8 }} />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1 bg-black/90 backdrop-blur-md rounded-xl border border-white/10 shadow-inner">
                    <Trophy size={12} className="text-yellow-500" />
                    <span className="text-[10px] font-black tabular-nums" style={getGlowStyle(textColor, 0.4)}>{game[team].wins}</span>
                  </div>
                </div>
                <div className="relative z-10 group flex items-center justify-center my-4">
                  <div className={`bg-black/80 backdrop-blur-2xl rounded-full w-32 h-32 flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.9)] border-2 transition-all duration-300 ${isWinner ? 'border-yellow-500 animate-pulse' : 'border-white/5'}`}>
                    <span className={`text-7xl font-black tabular-nums transition-all duration-300`} style={getGlowStyle(isWinner ? '#fbbf24' : textColor, 1.6)}>
                      {game[team].points}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full px-2 z-10">
                  <button onClick={() => updatePoints(team, 1)} className="w-full py-8 rounded-[2rem] bg-black/90 backdrop-blur-xl border border-white/10 flex items-center justify-center active:scale-95 active:bg-white/10 transition-all shadow-2xl relative overflow-hidden group">
                    <span className="text-3xl font-black" style={getGlowStyle(textColor, 1.0)}>+{handValue}</span>
                  </button>
                  <button onClick={() => updatePoints(team, -1)} disabled={game[team].points === 0} className="w-full py-3 bg-black/80 backdrop-blur-sm rounded-xl border border-white/5 flex items-center justify-center active:bg-red-500/40 disabled:opacity-10 transition-all shadow-xl">
                    <Minus size={14} style={{ color: textColor }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 shrink-0">
          <button 
            onClick={() => {
              initAudio();
              setIsTrucoShaking(true);
              const nextValues: Record<number, number> = { 1: 3, 3: 6, 6: 9, 9: 12 };
              setHandValue(nextValues[handValue] || 1);
              vibrate(60);
              playSound('truco');
              setTimeout(() => setIsTrucoShaking(false), 500);
            }}
            disabled={handValue === 12}
            className={`w-full py-6 rounded-[2rem] border-2 transition-all active:scale-95 flex items-center justify-center gap-4 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,1)] ${isTrucoShaking ? 'animate-shake' : ''} ${handValue === 1 ? 'border-white/20 bg-black/95' : 'border-orange-500 bg-orange-950/95'}`}
          >
            <span className="text-3xl font-black italic uppercase tracking-tighter" style={handValue === 1 ? getGlowStyle(textColor, 1.2) : { color: '#ffffff', textShadow: '0 0 25px #ffad00' }}>
              {handValue === 1 ? 'TRUUUCO!' : `VALE ${handValue}`}
            </span>
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { initAudio(); setModal('reset-points'); }} className="py-4 bg-black/90 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest active:bg-white/10 transition-all shadow-xl" style={getGlowStyle(textColor, 0.6)}>
              Zerar Pontos
            </button>
            <button onClick={() => { initAudio(); setIsMuted(!isMuted); }} className="py-4 bg-black/90 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest active:bg-white/10 transition-all flex items-center justify-center gap-2 shadow-xl" style={getGlowStyle(textColor, 0.6)}>
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />} Som
            </button>
          </div>
        </div>
      </main>

      {/* Side Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-80 bg-black h-full p-8 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col border-r border-white/20 animate-[slideIn_0.3s_ease-out] relative z-20 text-white">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-widest">Ajustes</h3>
              <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><X size={20} /></button>
            </div>
            
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Palette size={14} className="text-pink-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Cores Neon</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => { setTextColor(color.value); vibrate(20); initAudio(); }}
                      className={`aspect-square rounded-full border-2 transition-all ${textColor === color.value ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Sliders size={14} className="text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Contraste UI</span>
                </div>
                <input 
                  type="range" min="0.1" max="1.0" step="0.05"
                  value={uiOpacity} 
                  onChange={(e) => setUiOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-2">
                <button onClick={() => { setGame(prev => ({ ...prev, nos: { ...prev.nos, wins: 0 }, eles: { ...prev.eles, wins: 0 } })); setIsMenuOpen(false); vibrate(30); initAudio(); }} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                  Zerar Vitórias
                </button>
                <button onClick={() => { setGame(INITIAL_STATE); setHandValue(1); setIsMenuOpen(false); vibrate(50); initAudio(); }} className="w-full p-4 bg-red-600/20 border border-red-500/30 rounded-xl text-red-500 text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg">
                  <RotateCcw size={14} /> Reiniciar Tudo
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-black/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        </div>
      )}

      {/* Edit Name Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <div className="bg-zinc-900 p-8 rounded-[3rem] w-full max-w-xs border border-white/20 shadow-2xl">
            <h4 className="text-sm font-black uppercase mb-6 text-center tracking-widest">Nome do Time</h4>
            <input 
              ref={inputRef} type="text" value={tempName} 
              onChange={e => setTempName(e.target.value)} 
              className="w-full bg-black border border-white/30 rounded-2xl py-4 text-center font-bold text-xl text-white mb-8 outline-none focus:border-blue-500 shadow-inner" 
              maxLength={12}
            />
            <button 
              onClick={() => { initAudio(); setGame(prev => ({ ...prev, [editingTeam!]: { ...prev[editingTeam!], name: tempName || (editingTeam === 'nos' ? 'Nós' : 'Eles') } })); setEditingTeam(null); }}
              className="w-full py-5 bg-blue-600 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >Salvar</button>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {modal !== 'none' && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/98 backdrop-blur-2xl">
          <div className="bg-zinc-900 p-10 rounded-[3.5rem] w-full max-w-xs border border-white/20 text-center shadow-[0_0_100px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black mb-8 uppercase tracking-tight">Zerar Partida?</h3>
            <div className="flex flex-col gap-4">
              <button onClick={() => { initAudio(); setGame(prev => ({ ...prev, nos: { ...prev.nos, points: 0 }, eles: { ...prev.eles, points: 0 } })); setHandValue(1); setModal('none'); }} className="w-full py-5 bg-red-600 rounded-2xl font-black uppercase text-lg shadow-xl active:scale-95 transition-all">Sim, Zerar</button>
              <button onClick={() => { initAudio(); setModal('none'); }} className="w-full py-5 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
};

export default App;
