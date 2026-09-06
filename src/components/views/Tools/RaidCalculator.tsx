import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

export const RaidCalculator: React.FC = () => {
  const { lang, t } = useLanguage();
  const [level, setLevel] = useState('0');
  const [disks, setDisks] = useState(4);
  const [capacity, setCapacity] = useState(1000);
  const [unit, setUnit] = useState('GB');

  let isValid = true;
  let errorText = '';
  let minDisks = 2;

  const raidT = t.calculator as unknown as {
    raidErrorMin?: string;
    raidErrorEven?: string;
    lblRaidLevel?: string;
    lblRaidDisks?: string;
    lblRaidCapacity?: string;
    resLblRaidUsable?: string;
    resLblRaidLost?: string;
    resLblRaidFault?: string;
    resLblRaidRead?: string;
    resLblRaidWrite?: string;
  };

  if (level === '0') {
    minDisks = 2;
    if (disks < minDisks) {
      isValid = false;
      errorText = (raidT?.raidErrorMin || 'Min {min} disks for RAID {level}').replace('{level}', '0').replace('{min}', String(minDisks));
    }
  } else if (level === '1') {
    minDisks = 2;
    if (disks < minDisks) {
      isValid = false;
      errorText = (raidT?.raidErrorMin || 'Min {min} disks for RAID {level}').replace('{level}', '1').replace('{min}', String(minDisks));
    }
  } else if (level === '5') {
    minDisks = 3;
    if (disks < minDisks) {
      isValid = false;
      errorText = (raidT?.raidErrorMin || 'Min {min} disks for RAID {level}').replace('{level}', '5').replace('{min}', String(minDisks));
    }
  } else if (level === '6') {
    minDisks = 4;
    if (disks < minDisks) {
      isValid = false;
      errorText = (raidT?.raidErrorMin || 'Min {min} disks for RAID {level}').replace('{level}', '6').replace('{min}', String(minDisks));
    }
  } else if (level === '10') {
    minDisks = 4;
    if (disks < minDisks) {
      isValid = false;
      errorText = (raidT?.raidErrorMin || 'Min {min} disks for RAID {level}').replace('{level}', '10').replace('{min}', String(minDisks));
    } else if (disks % 2 !== 0) {
      isValid = false;
      errorText = raidT?.raidErrorEven || 'RAID 10 requires an even number of disks!';
    }
  }

  let usable = 0;
  let lost = 0;
  let faultTolerance = 0;
  let readSpeed = '1x';
  let writeSpeed = '1x';

  if (isValid) {
    switch (level) {
      case '0':
        usable = disks * capacity;
        lost = 0;
        faultTolerance = 0;
        readSpeed = `${disks}x`;
        writeSpeed = `${disks}x`;
        break;
      case '1':
        usable = capacity;
        lost = (disks - 1) * capacity;
        faultTolerance = disks - 1;
        readSpeed = `${disks}x`;
        writeSpeed = '1x';
        break;
      case '5':
        usable = (disks - 1) * capacity;
        lost = capacity;
        faultTolerance = 1;
        readSpeed = `${disks - 1}x`;
        writeSpeed = `${(disks / 4).toFixed(2).replace(/\.00$/, '')}x (est.)`;
        break;
      case '6':
        usable = (disks - 2) * capacity;
        lost = 2 * capacity;
        faultTolerance = 2;
        readSpeed = `${disks - 2}x`;
        writeSpeed = `${(disks / 6).toFixed(2).replace(/\.00$/, '')}x (est.)`;
        break;
      case '10':
        usable = (disks / 2) * capacity;
        lost = (disks / 2) * capacity;
        faultTolerance = 1;
        readSpeed = `${disks}x`;
        writeSpeed = `${(disks / 2).toFixed(1).replace(/\.0$/, '')}x`;
        break;
    }
  }

  const formatDisks = (count: number) => {
    if (lang === 'cs') {
      if (count === 1) return '1 disk';
      if (count >= 2 && count <= 4) return `${count} disky`;
      return `${count} disků`;
    }
    return count === 1 ? '1 disk' : `${count} disks`;
  };

  const locale = lang === 'cs' ? 'cs-CZ' : 'en-US';

  return (
    <div className="calc-view active" id="view-raid">
      <div className="subnet-input-grid">
        <div className="input-field">
          <label htmlFor="raid-level">{raidT?.lblRaidLevel || 'RAID Level:'}</label>
          <select id="raid-level" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="0">RAID 0 (Striping)</option>
            <option value="1">RAID 1 (Mirroring)</option>
            <option value="5">RAID 5 (Parity)</option>
            <option value="6">RAID 6 (Double Parity)</option>
            <option value="10">RAID 10 (Stripe of Mirrors)</option>
          </select>
        </div>
        <div className="input-field">
          <label htmlFor="raid-disks">{raidT?.lblRaidDisks || 'Počet disků:'}</label>
          <input
            type="number"
            id="raid-disks"
            min={2}
            max={32}
            value={disks}
            onChange={(e) => setDisks(parseInt(e.target.value, 10) || 2)}
          />
        </div>
        <div className="input-field">
          <label htmlFor="raid-capacity">{raidT?.lblRaidCapacity || 'Kapacita disku:'}</label>
          <div className="capacity-input-wrapper">
            <input
              type="number"
              id="raid-capacity"
              min={1}
              max={100000}
              value={capacity}
              onChange={(e) => setCapacity(parseFloat(e.target.value) || 1)}
            />
            <select id="raid-unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="GB">GB</option>
              <option value="TB">TB</option>
            </select>
          </div>
        </div>
      </div>

      {!isValid ? (
        <div className="raid-error">{errorText}</div>
      ) : (
        <div className="subnet-results">
          <div className="result-row">
            <span className="result-label">{raidT?.resLblRaidUsable || 'Využitelná kapacita:'}</span>
            <span className="result-val">
              {usable.toLocaleString(locale)} {unit}
            </span>
          </div>
          <div className="result-row">
            <span className="result-label">{raidT?.resLblRaidLost || 'Kapacita pro paritu/zrcadlení:'}</span>
            <span className="result-val">
              {lost.toLocaleString(locale)} {unit}
            </span>
          </div>
          <div className="result-row">
            <span className="result-label">{raidT?.resLblRaidFault || 'Odolnost proti výpadku:'}</span>
            <span className="result-val">{formatDisks(faultTolerance)}</span>
          </div>
          <div className="result-row">
            <span className="result-label">{raidT?.resLblRaidRead || 'Rychlost čtení:'}</span>
            <span className="result-val">{readSpeed}</span>
          </div>
          <div className="result-row">
            <span className="result-label">{raidT?.resLblRaidWrite || 'Rychlost zápisu:'}</span>
            <span className="result-val">{writeSpeed}</span>
          </div>
        </div>
      )}
    </div>
  );
};
