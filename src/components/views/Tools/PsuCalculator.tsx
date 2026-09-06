import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

export const PsuCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [cpuTdp, setCpuTdp] = useState(125);
  const [gpuTdp, setGpuTdp] = useState(200);
  const [ramCount, setRamCount] = useState(2);
  const [drivesCount, setDrivesCount] = useState(2);
  const [fansCount, setFansCount] = useState(4);
  const [isOc, setIsOc] = useState(false);

  const baseDraw = 50;
  let total = cpuTdp + gpuTdp + ramCount * 5 + drivesCount * 7 + fansCount * 3 + baseDraw;
  if (isOc) total *= 1.15;

  const estPeak = Math.round(total);
  let recommended = Math.ceil((estPeak * 1.3) / 50) * 50;
  if (recommended < 350) recommended = 350;

  let efficiency = '80 Plus Bronze';
  if (recommended >= 400 && recommended < 650) {
    efficiency = '80 Plus Gold';
  } else if (recommended >= 650) {
    efficiency = '80 Plus Platinum / Titanium';
  }

  const psuT = t.calculator as unknown as {
    lblPsuCpu?: string;
    lblPsuGpu?: string;
    lblPsuRam?: string;
    lblPsuDrives?: string;
    lblPsuFans?: string;
    lblPsuOc?: string;
    resLblPsuEst?: string;
    resLblPsuRec?: string;
    resLblPsuEff?: string;
  };

  return (
    <div className="calc-view active" id="view-psu">
      <div className="subnet-input-grid">
        <div className="input-field">
          <label htmlFor="psu-cpu">{psuT?.lblPsuCpu || 'Procesor (CPU):'}</label>
          <select
            id="psu-cpu"
            value={cpuTdp}
            onChange={(e) => setCpuTdp(parseInt(e.target.value, 10))}
          >
            <option value="65">Kancelářský / Úsporný (65W)</option>
            <option value="125">Střední třída / Herní (125W)</option>
            <option value="250">High-end / Taktovaný (250W)</option>
          </select>
        </div>

        <div className="input-field">
          <label htmlFor="psu-gpu">{psuT?.lblPsuGpu || 'Grafická karta (GPU):'}</label>
          <select
            id="psu-gpu"
            value={gpuTdp}
            onChange={(e) => setGpuTdp(parseInt(e.target.value, 10))}
          >
            <option value="0">Integrovaná / Žádná (0W)</option>
            <option value="75">Základní (75W)</option>
            <option value="200">Střední třída (200W)</option>
            <option value="350">High-end (350W)</option>
          </select>
        </div>

        <div className="input-field">
          <label htmlFor="psu-ram">{psuT?.lblPsuRam || 'Počet pamětí RAM:'}</label>
          <select
            id="psu-ram"
            value={ramCount}
            onChange={(e) => setRamCount(parseInt(e.target.value, 10))}
          >
            <option value="1">1 modul</option>
            <option value="2">2 moduly</option>
            <option value="4">4 moduly</option>
            <option value="8">8 modulů</option>
          </select>
        </div>

        <div className="input-field">
          <label htmlFor="psu-drives">{psuT?.lblPsuDrives || 'Počet disků (SSD/HDD):'}</label>
          <input
            type="number"
            id="psu-drives"
            min={1}
            max={20}
            value={drivesCount}
            onChange={(e) => setDrivesCount(parseInt(e.target.value, 10) || 1)}
          />
        </div>

        <div className="input-field">
          <label htmlFor="psu-fans">{psuT?.lblPsuFans || 'Počet ventilátorů:'}</label>
          <input
            type="number"
            id="psu-fans"
            min={1}
            max={30}
            value={fansCount}
            onChange={(e) => setFansCount(parseInt(e.target.value, 10) || 1)}
          />
        </div>

        <div className="input-field checkbox-field-wrapper">
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="psu-oc"
              checked={isOc}
              onChange={(e) => setIsOc(e.target.checked)}
            />
            <label htmlFor="psu-oc">{psuT?.lblPsuOc || 'Taktování (OC +15%)'}</label>
          </div>
        </div>
      </div>

      <div className="subnet-results">
        <div className="result-row">
          <span className="result-label">{psuT?.resLblPsuEst || 'Odhadovaný špičkový příkon:'}</span>
          <span className="result-val">{estPeak} W</span>
        </div>
        <div className="result-row">
          <span className="result-label">{psuT?.resLblPsuRec || 'Doporučený výkon zdroje:'}</span>
          <span
            className="result-val"
            style={{ color: 'var(--accent-color)', fontWeight: 900 }}
          >
            {recommended} W
          </span>
        </div>
        <div className="result-row psu-eff-row">
          <span className="result-label">{psuT?.resLblPsuEff || 'Doporučená certifikace:'}</span>
          <span className="result-val">{efficiency}</span>
        </div>
      </div>
    </div>
  );
};
