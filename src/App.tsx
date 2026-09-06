import React, { useState, useEffect, useRef } from 'react';
import { ViewId } from './types';
import { useAudio } from './context/AudioContext';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { BootScreen } from './components/layout/BootScreen';
import { CustomCursor } from './components/layout/CustomCursor';
import { EasterEggCanvas } from './components/layout/EasterEggCanvas';
import { HUDNotifications } from './components/layout/HUDNotifications';
import { EasterEggTracker } from './components/layout/EasterEggTracker';
import { Navbar } from './components/layout/Navbar';

import { HomeView } from './components/views/HomeView';
import { AboutView } from './components/views/AboutView';
import { SkillsView } from './components/views/SkillsView';
import { CertificatesView } from './components/views/CertificatesView';
import { ToolsView } from './components/views/Tools/ToolsView';
import { TerminalView } from './components/views/TerminalView';
import { ExperienceView } from './components/views/ExperienceView';
import { LolStatsView } from './components/views/LolStatsView';
import { GamesView } from './components/views/Games/GamesView';
import { ProjectsView } from './components/views/ProjectsView';
import { IpsumView } from './components/views/IpsumView';
import { FaqView } from './components/views/FaqView';
import { ContactView } from './components/views/ContactView';

export const App: React.FC = () => {
  const { playClick, playHover } = useAudio();
  const [activeView, setActiveView] = useState<ViewId>(() => {
    const saved = localStorage.getItem('activeTab') as ViewId;
    const validViews: ViewId[] = [
      'home-view',
      'about-view',
      'skills-view',
      'certificates-view',
      'calculator-view',
      'terminal-view',
      'experience-view',
      'lol-stats-view',
      'games-view',
      'projects-view',
      'ipsum-view',
      'faq-view',
      'contact-view',
    ];
    return validViews.includes(saved) ? saved : 'home-view';
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const mainContentRef = useRef<HTMLElement | null>(null);

  const handleSelectView = (viewId: ViewId) => {
    setActiveView(viewId);
    localStorage.setItem('activeTab', viewId);
    if (window.innerWidth > 900 && mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Scroll listener for sticky nav background
  useEffect(() => {
    const onScroll = () => {
      const isDesktop = window.innerWidth > 900;
      const scrollY = isDesktop && mainContentRef.current ? mainContentRef.current.scrollTop : window.scrollY;
      setIsScrolled(scrollY > 80);
    };

    const target = window.innerWidth > 900 && mainContentRef.current ? mainContentRef.current : window;
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, []);

  // Global sound feedback for interactive elements
  useEffect(() => {
    const audioSelector = 'a, button, .discord-badge, .project-card, .tech-icon, .cert-card, .timeline-item, .topo-node';

    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(audioSelector)) {
        playClick();
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(audioSelector);
      if (target) {
        if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest(audioSelector) === target) {
          return;
        }
        playHover();
      }
    };

    document.body.addEventListener('click', handleClick);
    document.body.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.body.removeEventListener('click', handleClick);
      document.body.removeEventListener('mouseover', handleMouseOver);
    };
  }, [playClick, playHover]);

  return (
    <>
      <ScrollProgress mainContentRef={mainContentRef} />
      <Navbar activeView={activeView} onSelectView={handleSelectView} isScrolled={isScrolled} />
      <BootScreen />
      <CustomCursor />
      <EasterEggCanvas />

      <main className="main-content" id="main-content" ref={mainContentRef}>
        <HomeView isActive={activeView === 'home-view'} onNavigate={handleSelectView} />
        <AboutView isActive={activeView === 'about-view'} />
        <SkillsView isActive={activeView === 'skills-view'} />
        <CertificatesView isActive={activeView === 'certificates-view'} />
        <ToolsView isActive={activeView === 'calculator-view'} />
        <TerminalView isActive={activeView === 'terminal-view'} onNavigate={handleSelectView} />
        <ExperienceView isActive={activeView === 'experience-view'} />
        <LolStatsView isActive={activeView === 'lol-stats-view'} />
        <GamesView isActive={activeView === 'games-view'} />
        <ProjectsView isActive={activeView === 'projects-view'} />
        <IpsumView isActive={activeView === 'ipsum-view'} />
        <FaqView isActive={activeView === 'faq-view'} />
        <ContactView isActive={activeView === 'contact-view'} />
      </main>

      <HUDNotifications />
      <EasterEggTracker />
    </>
  );
};
