import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useLanguage } from './LanguageContext';
import { useAudio } from './AudioContext';
import { useNotification } from './NotificationContext';

interface EasterEggContextType {
  foundEggs: string[];
  discoverEgg: (eggId: string) => void;
  totalEggs: number;
  isTrackerVisible: boolean;
  setIsTrackerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTracker: () => void;
  matrixRainActive: boolean;
  triggerMatrixRain: () => void;
}

const EasterEggContext = createContext<EasterEggContextType | undefined>(undefined);

export const EasterEggProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [foundEggs, setFoundEggs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('foundEggs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isTrackerVisible, setIsTrackerVisible] = useState<boolean>(false);
  const [matrixRainActive, setMatrixRainActive] = useState<boolean>(false);

  const { t } = useLanguage();
  const { playNotificationSound } = useAudio();
  const { showHUDNotification } = useNotification();
  const totalEggs = 4;

  const discoverEgg = (eggId: string) => {
    if (!foundEggs.includes(eggId)) {
      const updated = [...foundEggs, eggId];
      setFoundEggs(updated);
      localStorage.setItem('foundEggs', JSON.stringify(updated));

      const foundMsg = t.easterEggs?.found || '🎉 Skrytý Easter Egg nalezen!';
      showHUDNotification(`${foundMsg} (${updated.length}/${totalEggs})`, 'success');

      if (updated.length === totalEggs) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          const allFoundMsg =
            t.easterEggs?.allFound ||
            'Neskutečné! Našel jsi všechny 4 skryté Easter Eggy. Jsi opravdový lovec pokladů! 🏆';
          alert(allFoundMsg);
        }, 800);
      }
    }
  };

  const toggleTracker = () => {
    setIsTrackerVisible((prev) => !prev);
  };

  const triggerMatrixRain = () => {
    setMatrixRainActive(true);
    setTimeout(() => {
      setMatrixRainActive(false);
    }, 5000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        discoverEgg('f12');
      }
      if (
        (e.key === 'f' || e.key === 'F') &&
        (e.target as HTMLElement).tagName !== 'INPUT' &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA'
      ) {
        toggleTracker();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [foundEggs, t]);

  return (
    <EasterEggContext.Provider
      value={{
        foundEggs,
        discoverEgg,
        totalEggs,
        isTrackerVisible,
        setIsTrackerVisible,
        toggleTracker,
        matrixRainActive,
        triggerMatrixRain,
      }}
    >
      {children}
    </EasterEggContext.Provider>
  );
};

const defaultEasterEggContext: EasterEggContextType = {
  foundEggs: [],
  discoverEgg: () => {},
  totalEggs: 4,
  isTrackerVisible: false,
  setIsTrackerVisible: () => {},
  toggleTracker: () => {},
  matrixRainActive: false,
  triggerMatrixRain: () => {},
};

export const useEasterEgg = (): EasterEggContextType => {
  const context = useContext(EasterEggContext);
  return context || defaultEasterEggContext;
};
