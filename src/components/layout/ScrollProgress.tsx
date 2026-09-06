import React, { useEffect, useState } from 'react';

export const ScrollProgress: React.FC<{ mainContentRef?: React.RefObject<HTMLElement | null> }> = ({
  mainContentRef,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const isDesktop = window.innerWidth > 900;
      const el = isDesktop && mainContentRef?.current ? mainContentRef.current : document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const current = isDesktop && mainContentRef?.current ? mainContentRef.current.scrollTop : window.scrollY;
      setProgress(max > 0 ? (current / max) * 100 : 0);
    };

    const target = (window.innerWidth > 900 && mainContentRef?.current) ? mainContentRef.current : window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [mainContentRef]);

  return <div id="scroll-progress" style={{ width: `${progress}%` }} />;
};
