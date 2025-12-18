import { useState, useEffect, useRef, useCallback } from 'react';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('truco_v1_muted') === 'true');
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('truco_v1_muted', isMuted.toString());
  }, [isMuted]);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine') => {
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
  }, [isMuted, initAudio]);

  const vibrate = useCallback((pattern: number | number[] = 40) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return { isMuted, setIsMuted, playTone, vibrate, initAudio };
};
