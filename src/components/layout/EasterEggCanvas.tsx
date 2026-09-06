import React, { useEffect, useRef } from 'react';
import { useEasterEgg } from '../../context/EasterEggContext';

export const EasterEggCanvas: React.FC = () => {
  const { matrixRainActive } = useEasterEgg();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!matrixRainActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drops = Array.from({ length: Math.floor(canvas.width / 20) }, () => 1);
    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZPENTAKILLlol🏆';

    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(10,10,10,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff66';
      ctx.font = '20px monospace';
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      });
    }, 35);

    return () => {
      clearInterval(interval);
    };
  }, [matrixRainActive]);

  return (
    <canvas
      ref={canvasRef}
      id="easter-egg-canvas"
      style={{ display: matrixRainActive ? 'block' : 'none' }}
    />
  );
};
