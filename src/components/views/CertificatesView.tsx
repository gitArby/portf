import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useEasterEgg } from '../../context/EasterEggContext';
import { useAudio } from '../../context/AudioContext';

export const CertificatesView: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { t } = useLanguage();
  const { discoverEgg } = useEasterEgg();
  const { playClick } = useAudio();

  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const consoleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consoleBodyRef = useRef<HTMLDivElement>(null);

  const handleDeviceClick = (deviceKey: string) => {
    setSelectedDevice(deviceKey);
    playClick();

    if (consoleTimeoutRef.current) {
      clearTimeout(consoleTimeoutRef.current);
    }
    setConsoleLogs([]);

    const deviceLogs = (t as unknown as { ciscoLab?: { devices?: Record<string, string[]> } })
      ?.ciscoLab?.devices?.[deviceKey];
    if (!deviceLogs || deviceLogs.length === 0) return;

    let idx = 0;
    const printLine = () => {
      if (idx < deviceLogs.length) {
        const line = deviceLogs[idx];
        setConsoleLogs((prev) => [...prev, line]);
        idx++;
        consoleTimeoutRef.current = setTimeout(printLine, 120);
      }
    };
    printLine();
  };

  useEffect(() => {
    if (consoleBodyRef.current) {
      consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  useEffect(() => {
    return () => {
      if (consoleTimeoutRef.current) clearTimeout(consoleTimeoutRef.current);
    };
  }, []);

  return (
    <div id="certificates-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <section id="certificates" className="container reveal active">
        <h3 className="reveal-stagger" style={{ '--stagger-delay': 1 } as React.CSSProperties}>
          Certifikace
        </h3>
        <p
          className="container-text reveal-stagger"
          style={{ '--stagger-delay': 2 } as React.CSSProperties}
        >
          Oficiální osvědčení, která potvrzují mé teoretické i praktické znalosti v oblasti síťových technologií.
        </p>

        <div className="certs-grid">
          {/* CCNA 1 */}
          <div
            className="cert-card reveal-card active"
            style={{ '--stagger-delay': 3 } as React.CSSProperties}
          >
            <div className="cert-badge-wrapper">
              <div className="cisco-badge">
                <div className="cisco-inner">
                  <i className="fa-solid fa-ethernet" />
                </div>
              </div>
            </div>
            <div className="cert-info">
              <span className="cert-issuer">Cisco Networking Academy</span>
              <h4 className="cert-name">CCNA 1: Introduction to Networks</h4>
              <p className="cert-desc">
                Základy počítačových sítí, IP adresace (IPv4/IPv6), síťové protokoly, Ethernet a základní
                konfigurace přepínačů a směrovačů.
              </p>
              <div className="cert-status">
                <span className="status-label">
                  <i className="fa-solid fa-check-double" /> Dokončeno
                </span>
              </div>
            </div>
          </div>

          {/* CCNA 2 */}
          <div
            className="cert-card reveal-card active"
            style={{ '--stagger-delay': 4 } as React.CSSProperties}
          >
            <div className="cert-badge-wrapper">
              <div className="cisco-badge">
                <div className="cisco-inner">
                  <i className="fa-solid fa-route" />
                </div>
              </div>
            </div>
            <div className="cert-info">
              <span className="cert-issuer">Cisco Networking Academy</span>
              <h4 className="cert-name">CCNA 2: Switching, Routing, and Wireless Essentials</h4>
              <p className="cert-desc">
                Směrovací protokoly (OSPF), konfigurace VLAN, redundantní sítě (STP/EtherChannel),
                bezpečnost sítě (ACL/DHCP Snooping) a základy WLAN.
              </p>
              <div className="cert-status">
                <span className="status-label">
                  <i className="fa-solid fa-check-double" /> Dokončeno
                </span>
              </div>
            </div>
          </div>

          {/* SoloLearn */}
          <div
            className="cert-card reveal-card active"
            style={{ '--stagger-delay': 5 } as React.CSSProperties}
          >
            <div className="cert-badge-wrapper">
              <div className="cisco-badge" style={{ background: 'linear-gradient(135deg, #1abc9c, #16a085)' }}>
                <div className="cisco-inner">
                  <i className="fa-solid fa-graduation-cap" />
                </div>
              </div>
            </div>
            <div className="cert-info">
              <span className="cert-issuer">SoloLearn</span>
              <h4 className="cert-name">Certifikáty ze všech zmíněných jazyků</h4>
              <p className="cert-desc">
                Úspěšné absolvování kurzů a získání certifikátů pro všechny programovací jazyky uvedené v sekci dovedností.
              </p>
              <div className="cert-status">
                <span className="status-label">
                  <i className="fa-solid fa-check-double" /> Dokončeno
                </span>
              </div>
            </div>
          </div>

          {/* LoL Easter Egg */}
          <div
            id="egg-lol"
            className="cert-card reveal-card active"
            style={{ '--stagger-delay': 6, cursor: 'pointer' } as React.CSSProperties}
            onMouseEnter={() => discoverEgg('lol')}
            onClick={() => discoverEgg('lol')}
            title="Klikni pro odhalení easter eggu"
          >
            <div className="cert-badge-wrapper">
              <div className="cisco-badge" style={{ background: 'linear-gradient(135deg, #c2a14e, #93712b)' }}>
                <div className="cisco-inner">
                  <i className="fa-solid fa-gamepad" />
                </div>
              </div>
            </div>
            <div className="cert-info">
              <span className="cert-issuer">League of Legends</span>
              <h4 className="cert-name">1V9 L9 Mašina (Not Low Elo)</h4>
              <p className="cert-desc">
                Oficiální potvrzení, že jsem 1v9 L9 mašina, dokážu vyhrát hru i se zavázanýma očima a rozhodně nepatřím do low elo.
              </p>
              <div className="cert-status">
                <span className="status-label" style={{ color: '#c2a14e' }}>
                  <i className="fa-solid fa-crown" /> Challenger potvrzen v mých očích
                </span>
              </div>
            </div>
          </div>
        </div>

        <h4 className="topo-title reveal-stagger" id="topo-title" style={{ '--stagger-delay': 5 } as React.CSSProperties}>
          Cisco CCNA Interaktivní Laboratoř
        </h4>
        <p className="container-text topo-subtitle reveal-stagger" id="topo-subtitle" style={{ '--stagger-delay': 6 } as React.CSSProperties}>
          Kliknutím na síťová zařízení v topologii spustíte simulaci IOS konzole a diagnostických logů.
        </p>

        <div className="topo-grid reveal-stagger" style={{ '--stagger-delay': 7 } as React.CSSProperties}>
          <div className="topo-map">
            <div className="topo-cable cable-r-s"><span className="packet" /></div>
            <div className="topo-cable cable-s-pc"><span className="packet" /></div>
            <div className="topo-cable cable-s-srv"><span className="packet" /></div>

            <div
              className={`topo-node router ${selectedDevice === 'router' ? 'active' : ''}`}
              data-device="router"
              id="node-router"
              onClick={() => handleDeviceClick('router')}
              style={{ cursor: 'pointer' }}
            >
              <div className="node-icon"><i className="fa-solid fa-route" /></div>
              <span className="node-label">Edge_Router</span>
            </div>
            <div
              className={`topo-node switch ${selectedDevice === 'switch' ? 'active' : ''}`}
              data-device="switch"
              id="node-switch"
              onClick={() => handleDeviceClick('switch')}
              style={{ cursor: 'pointer' }}
            >
              <div className="node-icon"><i className="fa-solid fa-network-wired" /></div>
              <span className="node-label">Core_Switch</span>
            </div>
            <div
              className={`topo-node client ${selectedDevice === 'pc' ? 'active' : ''}`}
              data-device="pc"
              id="node-pc"
              onClick={() => handleDeviceClick('pc')}
              style={{ cursor: 'pointer' }}
            >
              <div className="node-icon"><i className="fa-solid fa-desktop" /></div>
              <span className="node-label">Workstation</span>
            </div>
            <div
              className={`topo-node server ${selectedDevice === 'server' ? 'active' : ''}`}
              data-device="server"
              id="node-server"
              onClick={() => handleDeviceClick('server')}
              style={{ cursor: 'pointer' }}
            >
              <div className="node-icon"><i className="fa-solid fa-server" /></div>
              <span className="node-label">Local_Server</span>
            </div>
          </div>

          <div className="topo-console">
            <div className="console-header">
              <span className="console-status-dot" />
              <span id="console-header-title">
                {selectedDevice ? `${selectedDevice.toUpperCase()}_CONSOLE` : 'CISCO_IOS_TERMINAL'}
              </span>
            </div>
            <div className="console-body" id="console-body" ref={consoleBodyRef}>
              {consoleLogs.length === 0 ? (
                <div className="console-placeholder" id="console-placeholder">
                  <p className="blink-fast">&gt; KONEKTIVITA: SMĚROVÁNÍ AKTIVNÍ [OSPFv2]</p>
                  <p>&gt; Kliknutím na jakékoli zařízení na topologické mapě spustíte konzoli a vyvoláte stav konfigurace.</p>
                </div>
              ) : (
                consoleLogs.map((log, lIdx) => {
                  const isHighlight = log.includes('#') || log.includes(':$');
                  return (
                    <div
                      key={lIdx}
                      className="console-line"
                      style={{
                        color: isHighlight ? 'var(--accent-color)' : 'var(--text-light)',
                        fontWeight: isHighlight ? 'bold' : 'normal',
                      }}
                    >
                      {log}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
