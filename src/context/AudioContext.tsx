import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface AudioContextType {
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  toggleAudio: () => void;
  playClick: () => void;
  playHover: () => void;
  playNotificationSound: (type?: 'info' | 'success' | 'error') => void;
}

const AudioContextInstance = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioEnabled, setAudioEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('audio') === 'true';
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const userInteractedRef = useRef<boolean>(false);

  useEffect(() => {
    const handleFirstGesture = () => {
      userInteractedRef.current = true;
    };
    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  const getCtx = (): AudioContext | null => {
    if (!userInteractedRef.current) return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    return audioCtxRef.current;
  };

  const setAudioEnabled = (enabled: boolean) => {
    setAudioEnabledState(enabled);
    localStorage.setItem('audio', String(enabled));
    if (enabled) {
      setTimeout(playClick, 50);
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const playClick = () => {
    if (!audioEnabled) return;
    try {
      const ctx = getCtx();
      if (!ctx) return;
      ctx.resume().then(() => {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      }).catch(() => {});
    } catch (e) {
      console.warn('Audio click synth failed', e);
    }
  };

  const playHover = () => {
    if (!audioEnabled) return;
    try {
      const ctx = getCtx();
      if (!ctx) return;
      ctx.resume().then(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 300;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
      }).catch(() => {});
    } catch (e) {
      console.warn('Audio hover synth failed', e);
    }
  };

  const playNotificationSound = (type: 'info' | 'success' | 'error' = 'info') => {
    if (!audioEnabled) return;
    try {
      const ctx = getCtx();
      if (!ctx) return;
      ctx.resume().then(() => {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain = ctx.createGain();

        if (type === 'error') {
          osc1.frequency.setValueAtTime(150, now);
          osc1.frequency.setValueAtTime(100, now + 0.1);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc1.connect(gain);
          gain.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.25);
        } else if (type === 'success') {
          osc1.frequency.setValueAtTime(600, now);
          osc1.frequency.setValueAtTime(900, now + 0.08);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc1.connect(gain);
          gain.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.3);
        } else {
          osc1.frequency.setValueAtTime(800, now);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc1.connect(gain);
          gain.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.15);
        }
      }).catch(() => {});
    } catch (e) {
      console.warn('Audio notification synth failed', e);
    }
  };

  return (
    <AudioContextInstance.Provider
      value={{
        audioEnabled,
        setAudioEnabled,
        toggleAudio,
        playClick,
        playHover,
        playNotificationSound,
      }}
    >
      {children}
    </AudioContextInstance.Provider>
  );
};

const defaultAudioContext: AudioContextType = {
  audioEnabled: true,
  setAudioEnabled: () => {},
  toggleAudio: () => {},
  playClick: () => {},
  playHover: () => {},
  playNotificationSound: () => {},
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContextInstance);
  return context || defaultAudioContext;
};
