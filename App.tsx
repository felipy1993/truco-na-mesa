import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { GameState, ModalType } from './types';
import { useAudio } from './hooks/useAudio';
import { useWakeLock } from './hooks/useWakeLock';
import { ScoreCard } from './components/ScoreCard';
import { TrucoButton } from './components/TrucoButton';
import { SettingsMenu } from './components/SettingsMenu';
import { Header } from './components/Header';
import { ControlBar } from './components/ControlBar';

const INITIAL_STATE: GameState = {
  nos: { name: 'NÓS', points: 0, wins: 0 },
  eles: { name: 'ELES', points: 0, wins: 0 }
};

const App: React.FC = () => {
  useWakeLock();
  const [game, setGame] = useState<GameState>(() => {
    const saved = localStorage.getItem('truco_v1_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [textColor, setTextColor] = useState(() => localStorage.getItem('truco_v1_color') || '#bef264');
  const [uiOpacity, setUiOpacity] = useState(() => parseFloat(localStorage.getItem('truco_v1_opacity') || '0.9'));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>('none');
  const [handValue, setHandValue] = useState<number>(1);
  const [isTrucoAnimating, setIsTrucoAnimating] = useState(false);
  const [editingTeam, setEditingTeam] = useState<'nos' | 'eles' | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempHide, setTempHide] = useState(false);

  const { isMuted, setIsMuted, playTone, vibrate, initAudio, speak, voices, selectedVoice, setSelectedVoice } = useAudio();

  useEffect(() => {
    localStorage.setItem('truco_v1_state', JSON.stringify(game));
    localStorage.setItem('truco_v1_color', textColor);
    localStorage.setItem('truco_v1_opacity', uiOpacity.toString());
  }, [game, textColor, uiOpacity]);

  const updatePoints = (team: 'nos' | 'eles', delta: number) => {
    initAudio();
    const amount = delta > 0 ? handValue : -1;
    
    setGame(prev => {
      const newPoints = Math.max(0, prev[team].points + amount);
      
      if (newPoints >= 12) {
        playTone(880, 0.5, 'triangle');
        vibrate([100, 50, 100]);
        speak('Vitória!');
        setHandValue(1);
        return {
          ...prev,
          nos: { ...prev.nos, points: 0, wins: team === 'nos' ? prev.nos.wins + 1 : prev.nos.wins },
          eles: { ...prev.eles, points: 0, wins: team === 'eles' ? prev.eles.wins + 1 : prev.eles.wins }
        };
      }

      playTone(delta > 0 ? 440 + (newPoints * 20) : 220, 0.1);
      vibrate();
      if (delta > 0) setHandValue(1);

      // Announce Score
      const nosPoints = team === 'nos' ? newPoints : prev.nos.points;
      const elesPoints = team === 'eles' ? newPoints : prev.eles.points;
      const pn1 = prev.nos.name;
      const pn2 = prev.eles.name;
      const p1 = nosPoints === 1 ? 'ponto' : 'pontos';
      const p2 = elesPoints === 1 ? 'ponto' : 'pontos';
      
      speak(`${pn1} ${nosPoints} ${p1}, ${pn2} ${elesPoints} ${p2}`);

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
      playTone(150, 0.3, 'sawtooth');
      vibrate(80);
      speak(next === 3 ? 'Truco!' : next === 6 ? 'Seis!' : next === 9 ? 'Nove!' : 'Doze!');
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

  const activeOpacity = tempHide ? 0.05 : uiOpacity;

  return (
    <div 
      className="flex flex-col h-full w-full p-4 pt-[var(--safe-top)] pb-[var(--safe-bottom)] transition-all duration-700 bg-black text-white overflow-hidden relative"
      style={{ 
        backgroundImage: "url('/mirassol.png')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" /> {/* Overlay for better text readability */}
      <div className="relative z-10 flex flex-col h-full w-full">

      
      <Header 
        onMenuClick={() => { initAudio(); setIsMenuOpen(true); vibrate(20); }}
        onFullscreenClick={toggleFullscreen}
        isFullscreen={isFullscreen}
        textColor={textColor}
        activeOpacity={activeOpacity}
        onTitleClick={() => { setTempHide(true); setTimeout(() => setTempHide(false), 3000); }}
      />

      <main className="flex-1 grid grid-cols-2 gap-4 transition-all duration-500" style={{ opacity: activeOpacity }}>
        {(['nos', 'eles'] as const).map(team => (
          <ScoreCard
            key={team}
            teamKey={team}
            teamData={game[team]}
            onUpdatePoints={(delta) => updatePoints(team, delta)}
            onEditName={() => { setEditingTeam(team); setTempName(game[team].name); }}
            textColor={textColor}
          />
        ))}
      </main>

      <footer className="mt-6 flex flex-col gap-4 transition-opacity duration-500" style={{ opacity: activeOpacity }}>
        <TrucoButton 
          handValue={handValue}
          onToggle={toggleTruco}
          onCancel={() => {
            setHandValue(1);
            vibrate(30);
          }}
          isAnimating={isTrucoAnimating}
          textColor={textColor}
        />

        <ControlBar 
          onResetPoints={() => setModal('reset-points')}
          onToggleMute={() => setIsMuted(!isMuted)}
          isMuted={isMuted}
          onToggleEco={() => setTempHide(!tempHide)}
          activeOpacity={activeOpacity}
        />
      </footer>

      <SettingsMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        textColor={textColor}
        setTextColor={setTextColor}
        uiOpacity={uiOpacity}
        setUiOpacity={setUiOpacity}
        voices={voices}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        onResetWins={() => {
           setGame(prev => ({...prev, nos: {...prev.nos, wins: 0}, eles: {...prev.eles, wins: 0}})); 
           setIsMenuOpen(false); 
           vibrate(50); 
        }}
        onResetApp={() => {
          setGame(INITIAL_STATE);
          setHandValue(1);
          setIsMenuOpen(false);
          vibrate(100);
        }}
      />

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
    </div>
  );
};

export default App;
