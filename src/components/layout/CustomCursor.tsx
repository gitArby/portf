import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isMobile) return;

    let mx = 0;
    let my = 0;
    let dotX = 0;
    let dotY = 0;
    let outlineX = 0;
    let outlineY = 0;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      document.documentElement.classList.add('cursor-active');
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'a, button, summary, .discord-badge, #mega-trigger, .topo-node, select, input, label, .project-card, .cert-card, .theme-dot'
        )
      ) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };

    const animate = () => {
      dotX += (mx - dotX) * 0.5;
      dotY += (my - dotY) * 0.5;
      outlineX += (mx - outlineX) * 0.2;
      outlineY += (my - outlineY) * 0.2;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
      if (outlineRef.current) {
        outlineRef.current.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className={`cursor-dot ${isActive ? 'active' : ''}`} />
      <div ref={outlineRef} className={`cursor-outline ${isActive ? 'active' : ''}`} />
    </>
  );
};
