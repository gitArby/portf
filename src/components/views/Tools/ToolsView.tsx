import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAudio } from '../../../context/AudioContext';
import { SubnetCalculator } from './SubnetCalculator';
import { RaidCalculator } from './RaidCalculator';
import { PsuCalculator } from './PsuCalculator';
import { PasswordGenerator } from './PasswordGenerator';
import { MathCalculator } from './MathCalculator';

type ToolTab = 'subnet' | 'raid' | 'psu' | 'password' | 'math';

export const ToolsView: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { t } = useLanguage();
  const { playClick } = useAudio();
  const [activeTab, setActiveTab] = useState<ToolTab>('subnet');

  const handleTabChange = (tab: ToolTab) => {
    setActiveTab(tab);
    playClick();
  };

  const tabs: { id: ToolTab; label: string }[] = [
    { id: 'subnet', label: t.calculator?.tabSubnet || 'Subnet kalkulačka' },
    { id: 'raid', label: t.calculator?.tabRaid || 'RAID kalkulačka' },
    { id: 'psu', label: t.calculator?.tabPsu || 'PC Zdroj (PSU)' },
    { id: 'password', label: t.calculator?.tabPassword || 'Generátor hesel' },
    { id: 'math', label: t.calculator?.tabMath || 'Matematická kalkulačka' },
  ];

  return (
    <div id="calculator-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <section id="calculator" className="container reveal active">
        <h3 id="calc-title" className="reveal-stagger" style={{ '--stagger-delay': 1 } as React.CSSProperties}>
          {t.calculator?.title || 'Nástroje & Kalkulačky'}
        </h3>
        <p className="container-text reveal-stagger" id="calc-subtitle" style={{ '--stagger-delay': 2 } as React.CSSProperties}>
          {t.calculator?.subtitle ||
            'Rychlé výpočty podsítí pro síťaře a standardní/vědecká kalkulačka pro každodenní úkoly.'}
        </p>

        <div className="calc-hub reveal-card active" style={{ '--stagger-delay': 3 } as React.CSSProperties}>
          <div className="calc-tabs">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                className={`calc-tab-btn ${activeTab === tb.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tb.id)}
              >
                {tb.label}
              </button>
            ))}
          </div>

          <div className="calc-content">
            {activeTab === 'subnet' && <SubnetCalculator />}
            {activeTab === 'raid' && <RaidCalculator />}
            {activeTab === 'psu' && <PsuCalculator />}
            {activeTab === 'password' && <PasswordGenerator />}
            {activeTab === 'math' && <MathCalculator />}
          </div>
        </div>
      </section>
    </div>
  );
};
