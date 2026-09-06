import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

export const SubnetCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [ip, setIp] = useState('192.168.1.1');
  const [cidr, setCidr] = useState(24);

  const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const isValidIp = ipPattern.test(ip.trim());

  let maskStr = 'Invalid IP';
  let netStr = 'Invalid IP';
  let bcStr = 'Invalid IP';
  let rangeStr = 'Invalid IP';
  let hostsStr = 'Invalid IP';
  let wildcardStr = 'Invalid IP';
  let binIpStr = 'Invalid IP Address';
  let binMaskStr = 'N/A';

  if (isValidIp) {
    const ipNum = ip.trim().split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcardNum = ~maskNum >>> 0;

    const netNum = (ipNum & maskNum) >>> 0;
    const bcNum = (netNum | wildcardNum) >>> 0;

    let hosts = 0;
    let firstIp = 'N/A';
    let lastIp = 'N/A';

    if (cidr < 31) {
      hosts = Math.pow(2, 32 - cidr) - 2;
      firstIp = [
        ((netNum + 1) >>> 24) & 255,
        ((netNum + 1) >>> 16) & 255,
        ((netNum + 1) >>> 8) & 255,
        (netNum + 1) & 255,
      ].join('.');
      lastIp = [
        ((bcNum - 1) >>> 24) & 255,
        ((bcNum - 1) >>> 16) & 255,
        ((bcNum - 1) >>> 8) & 255,
        (bcNum - 1) & 255,
      ].join('.');
    } else if (cidr === 31) {
      hosts = 2;
      firstIp = [(netNum >>> 24) & 255, (netNum >>> 16) & 255, (netNum >>> 8) & 255, netNum & 255].join('.');
      lastIp = [(bcNum >>> 24) & 255, (bcNum >>> 16) & 255, (bcNum >>> 8) & 255, bcNum & 255].join('.');
    } else if (cidr === 32) {
      hosts = 1;
      firstIp = [(netNum >>> 24) & 255, (netNum >>> 16) & 255, (netNum >>> 8) & 255, netNum & 255].join('.');
      lastIp = firstIp;
    }

    maskStr = [
      (maskNum >>> 24) & 255,
      (maskNum >>> 16) & 255,
      (maskNum >>> 8) & 255,
      maskNum & 255,
    ].join('.');
    netStr = [
      (netNum >>> 24) & 255,
      (netNum >>> 16) & 255,
      (netNum >>> 8) & 255,
      netNum & 255,
    ].join('.');
    bcStr = [
      (bcNum >>> 24) & 255,
      (bcNum >>> 16) & 255,
      (bcNum >>> 8) & 255,
      bcNum & 255,
    ].join('.');
    rangeStr = `${firstIp} - ${lastIp}`;
    hostsStr = hosts.toLocaleString();
    wildcardStr = [
      (wildcardNum >>> 24) & 255,
      (wildcardNum >>> 16) & 255,
      (wildcardNum >>> 8) & 255,
      wildcardNum & 255,
    ].join('.');

    const octets = ip.trim().split('.');
    binIpStr = octets.map((o) => parseInt(o, 10).toString(2).padStart(8, '0')).join('.');
    const maskOctets = maskStr.split('.');
    binMaskStr = maskOctets.map((o) => parseInt(o, 10).toString(2).padStart(8, '0')).join('.');
  }

  return (
    <div className="calc-view active" id="view-subnet">
      <div className="subnet-input-grid">
        <div className="input-field">
          <label htmlFor="subnet-ip" id="lbl-subnet-ip">
            {t.calculator?.subnetIp || 'IP adresa:'}
          </label>
          <input
            type="text"
            id="subnet-ip"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="Např. 192.168.1.1"
          />
        </div>
        <div className="input-field">
          <label htmlFor="subnet-cidr" id="lbl-subnet-cidr">
            {t.calculator?.subnetCidr || 'Maska / CIDR:'} <span id="cidr-val">/{cidr}</span>
          </label>
          <input
            type="range"
            id="subnet-cidr"
            min="0"
            max="32"
            value={cidr}
            onChange={(e) => setCidr(parseInt(e.target.value, 10))}
            className="slider"
          />
        </div>
      </div>

      <div className="subnet-results">
        <div className="result-row">
          <span className="result-label">{t.calculator?.resMask || 'Maska sítě:'}</span>
          <span className="result-val">{maskStr}</span>
        </div>
        <div className="result-row">
          <span className="result-label">{t.calculator?.resNet || 'Adresa sítě (Network):'}</span>
          <span className="result-val">{netStr}</span>
        </div>
        <div className="result-row">
          <span className="result-label">{t.calculator?.resBroadcast || 'Broadcast adresa:'}</span>
          <span className="result-val">{bcStr}</span>
        </div>
        <div className="result-row">
          <span className="result-label">{t.calculator?.resRange || 'Rozsah použitelných IP:'}</span>
          <span className="result-val">{rangeStr}</span>
        </div>
        <div className="result-row">
          <span className="result-label">{t.calculator?.resHosts || 'Počet použitelných hostů:'}</span>
          <span className="result-val">{hostsStr}</span>
        </div>
        <div className="result-row">
          <span className="result-label">{t.calculator?.resWildcard || 'Wildcard maska:'}</span>
          <span className="result-val">{wildcardStr}</span>
        </div>
      </div>

      <div className="subnet-binary">
        <div className="binary-header">{t.calculator?.binHdr || 'Binární vizualizace'}</div>
        <div className="binary-row">
          <span className="binary-label">IP:</span>
          <span className="binary-val">{binIpStr}</span>
        </div>
        <div className="binary-row">
          <span className="binary-label">MASK:</span>
          <span className="binary-val">{binMaskStr}</span>
        </div>
      </div>
    </div>
  );
};
