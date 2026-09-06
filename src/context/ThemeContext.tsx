import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeName } from '../types';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  customHue: number;
  setCustomHue: (hue: number) => void;
  customLightness: number;
  setCustomLightness: (lightness: number) => void;
  customHex: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function hexToRgbString(hex: string): string {
  let c: string | string[] = hex.replace(/^#/, '');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  } else {
    c = c.split('');
  }
  const num = parseInt(c.join(''), 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

function hexToRgba(hex: string, alpha: number): string {
  return `rgba(${hexToRgbString(hex)}, ${alpha})`;
}

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme');
    const validThemes: ThemeName[] = ['green', 'blue', 'amber', 'red', 'purple', 'pink', 'custom'];
    return validThemes.includes(saved as ThemeName) ? (saved as ThemeName) : 'green';
  });

  const [customHue, setCustomHue] = useState<number>(() => {
    const saved = localStorage.getItem('customThemeHue');
    return saved ? parseInt(saved, 10) : 150;
  });

  const [customLightness, setCustomLightness] = useState<number>(() => {
    const saved = localStorage.getItem('customThemeLightness');
    return saved ? parseInt(saved, 10) : 50;
  });

  const customHex = hslToHex(customHue, 100, customLightness);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'custom') {
      document.documentElement.style.setProperty('--accent-color', customHex);
      document.documentElement.style.setProperty('--accent-color-rgb', hexToRgbString(customHex));
      document.documentElement.style.setProperty('--accent-color-glow', hexToRgba(customHex, 0.4));
      localStorage.setItem('customThemeColor', customHex);
      localStorage.setItem('customThemeHue', customHue.toString());
      localStorage.setItem('customThemeLightness', customLightness.toString());
    } else {
      document.documentElement.style.removeProperty('--accent-color');
      document.documentElement.style.removeProperty('--accent-color-rgb');
      document.documentElement.style.removeProperty('--accent-color-glow');
    }
  }, [theme, customHex, customHue, customLightness]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        customHue,
        setCustomHue,
        customLightness,
        setCustomLightness,
        customHex,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

const defaultThemeContext: ThemeContextType = {
  theme: 'green',
  setTheme: () => {},
  customHue: 140,
  setCustomHue: () => {},
  customLightness: 50,
  setCustomLightness: () => {},
  customHex: '#00ff66',
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  return context || defaultThemeContext;
};
