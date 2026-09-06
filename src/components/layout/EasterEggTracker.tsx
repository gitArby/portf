import React from 'react';
import { useEasterEgg } from '../../context/EasterEggContext';
import { useLanguage } from '../../context/LanguageContext';

export const EasterEggTracker: React.FC = () => {
  const { foundEggs, totalEggs, isTrackerVisible, toggleTracker } = useEasterEgg();
  const { t } = useLanguage();

  const titleMsg = t.easterEggs?.trackerTitle || 'Odhaleno tajných Easter Eggů:';

  return (
    <div
      id="egg-tracker-widget"
      className={`egg-tracker ${!isTrackerVisible ? 'hidden' : ''} ${
        foundEggs.length >= totalEggs ? 'complete' : ''
      }`}
      title={`${titleMsg} ${foundEggs.length}/${totalEggs}`}
      onClick={toggleTracker}
      style={{ cursor: 'pointer' }}
    >
      🥚 <span id="egg-tracker-count">{`${foundEggs.length}/${totalEggs}`}</span>
    </div>
  );
};
