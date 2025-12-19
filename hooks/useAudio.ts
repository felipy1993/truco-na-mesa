import { useState, useEffect, useRef, useCallback } from 'react';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('truco_v1_muted') === 'true');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(() => localStorage.getItem('truco_v1_voice') || '');

  useEffect(() => {
    localStorage.setItem('truco_v1_muted', isMuted.toString());
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('truco_v1_voice', selectedVoice);
  }, [selectedVoice]);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      
      // Auto-select Google Português if available and nothing selected
      if (!selectedVoice && available.length > 0) {
        const pt = available.find(v => v.lang === 'pt-BR' && v.name.includes('Google'));
        if (pt) setSelectedVoice(pt.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [selectedVoice]);

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

  const speak = useCallback((text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    
    // Cancel previous utterances
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }

    utterance.pitch = 1.0; 
    utterance.rate = 1.0; 
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  }, [isMuted, selectedVoice, voices]);

  return { isMuted, setIsMuted, playTone, vibrate, initAudio, speak, voices, selectedVoice, setSelectedVoice };
};
