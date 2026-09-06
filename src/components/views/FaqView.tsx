import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAudio } from '../../context/AudioContext';

export const FaqView: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { t } = useLanguage();
  const { playClick } = useAudio();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
    playClick();
  };

  const faqList = [
    { q: t.faq?.q1 || 'Opravíš mi tiskárnu?', a: t.faq?.a1 || 'Ne. Tiskárny jsou dílem čisté temné magie a odmítám se jich dotýkat.' },
    { q: t.faq?.q2 || 'Složíš mi PC?', a: t.faq?.a2 || 'Jasně! Napiš mi do zpráv, sepíšeme si rozpočet a vymyslíme tu nejlepší sestavu.' },
    { q: t.faq?.q3 || 'Jsi opravdu 1v9 L9 mašina?', a: t.faq?.a3 || 'Samozřejmě. Moje herní mechaniky jsou bezchybné.' },
    { q: t.faq?.q4 || 'Co znamená "arbyy"?', a: t.faq?.a4 || 'To je tajemství, které se předává z generace na generaci.' },
  ];

  return (
    <div id="faq-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <section className="container reveal active">
        <h3 className="reveal-stagger" style={{ '--stagger-delay': 1 } as React.CSSProperties}>
          {t.faq?.title || 'Často kladené dotazy'}
        </h3>

        <div className="faq-accordion reveal-stagger" style={{ '--stagger-delay': 2 } as React.CSSProperties}>
          {faqList.map((item, idx) => (
            <div key={idx} className={`faq-item ${openIndex === idx ? 'active' : ''}`}>
              <div
                className="faq-question"
                onClick={() => toggleIndex(idx)}
                style={{ cursor: 'pointer' }}
              >
                <span>{item.q}</span>
                <i className="fa-solid fa-chevron-down" />
              </div>
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
