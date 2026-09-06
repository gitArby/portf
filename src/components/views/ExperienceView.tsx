import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAudio } from '../../context/AudioContext';

type FilterType = 'all' | 'education' | 'experience';

export const ExperienceView: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { lang, t } = useLanguage();
  const { playClick } = useAudio();
  const [filter, setFilter] = useState<FilterType>('all');

  const handleFilterClick = (newFilter: FilterType) => {
    setFilter(newFilter);
    playClick();
  };

  const isCs = lang === 'cs';

  const items = [
    {
      type: 'experience',
      date: isCs ? '2026 – současnost' : '2026 – Present',
      title: 'VALBEK-EU, a.s.',
      subtitle: isCs ? 'Aplikační specialista - Junior (Vývoj webových aplikací)' : 'Application Specialist - Junior (Web Development)',
      desc: isCs
        ? 'Vývoj a správa webových aplikací, implementace nových funkcionalit, práce s moderními webovými technologiemi, řešení technických požadavků a optimalizace aplikací.'
        : 'Development and maintenance of web applications, implementation of new features, working with modern web technologies, technical requirements, and application optimization.',
    },
    {
      type: 'education',
      date: '2022 – 2026',
      title: 'Střední průmyslová škola a Střední odborná škola, Varnsdorf',
      subtitle: isCs ? 'Obor: Informační technologie' : 'Field: Information Technology',
      desc: isCs
        ? 'Absolvent studia zakončeného maturitní zkouškou. Zaměření na správu systémů, základy programování, síťové technologie a hardware.'
        : 'Graduate with the school-leaving exam (Maturita). Focused on systems administration, programming basics, networking, and hardware.',
    },
    {
      type: 'experience',
      date: isCs ? 'Odborná stáž (2 týdny)' : 'Internship (2 weeks)',
      title: 'IT servis Turnov',
      subtitle: isCs ? 'Servisní technik' : 'Service Technician',
      desc: isCs
        ? 'Diagnostika, čištění a hardware opravy stolních počítačů a notebooků. Instalace operačních systémů, softwaru a údržba IT vybavení.'
        : 'Diagnostics, cleaning, and hardware repairs of desktop computers and laptops. OS and software installations and maintenance.',
    },
    {
      type: 'experience',
      date: isCs ? 'Odborná stáž (2 týdny)' : 'Internship (2 weeks)',
      title: isCs
        ? 'Spolupráce na webových projektech (u Tomáše Hubičky)'
        : 'Web Projects Collaboration (with Tomáš Hubička)',
      subtitle: isCs ? 'Webový vývojář' : 'Web Developer',
      desc: isCs
        ? 'Praktické seznámení s vývojovým procesem, tvorba a správa webových stránek. Práce s HTML, CSS a ladění kódu na reálných projektech.'
        : 'Hands-on development experience, website creation and management. Working with HTML, CSS, and debugging real-world projects.',
    },
  ];

  const filteredItems = items.filter((item) => filter === 'all' || item.type === filter);

  return (
    <div id="experience-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <section id="experience" className="container reveal active">
        <h3 className="reveal-stagger" style={{ '--stagger-delay': 1 } as React.CSSProperties}>
          {t.timeline?.title || 'Vzdělání & Zkušenosti'}
        </h3>
        <p
          className="container-text reveal-stagger"
          style={{ '--stagger-delay': 2 } as React.CSSProperties}
        >
          {t.timeline?.subtitle || 'Přehled mého studia a odborných praxí v IT oblasti.'}
        </p>

        <div className="timeline-filters reveal-stagger" style={{ '--stagger-delay': 3 } as React.CSSProperties}>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            data-filter="all"
            onClick={() => handleFilterClick('all')}
          >
            {isCs ? 'Vše' : 'All'}
          </button>
          <button
            className={`filter-btn ${filter === 'education' ? 'active' : ''}`}
            data-filter="education"
            onClick={() => handleFilterClick('education')}
          >
            {isCs ? 'Vzdělání' : 'Education'}
          </button>
          <button
            className={`filter-btn ${filter === 'experience' ? 'active' : ''}`}
            data-filter="experience"
            onClick={() => handleFilterClick('experience')}
          >
            {isCs ? 'Praxe' : 'Experience'}
          </button>
        </div>

        <div className="timeline reveal-stagger" style={{ '--stagger-delay': 4 } as React.CSSProperties}>
          {filteredItems.map((item, idx) => (
            <div key={idx} className={`timeline-item ${item.type}`}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <span className="timeline-date">{item.date}</span>
                <h4 className="timeline-title">{item.title}</h4>
                <span className="timeline-subtitle">{item.subtitle}</span>
                <p className="timeline-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
