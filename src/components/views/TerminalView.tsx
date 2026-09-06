import React, { useState, useRef, useEffect } from 'react';
import { ViewId, ThemeName } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAudio } from '../../context/AudioContext';
import { useEasterEgg } from '../../context/EasterEggContext';
import { useNotification } from '../../context/NotificationContext';
import { generateCV } from '../../utils/generateCV';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'banner';
  content: string | React.ReactNode;
}

interface TerminalViewProps {
  isActive: boolean;
  onNavigate: (viewId: ViewId) => void;
}

const ASCII_LOGO = `
   █████╗ ██████╗ ██████╗ ██╗   ██╗██╗   ██╗
  ██╔══██╗██╔══██╗██╔══██╗╚██╗ ██╔╝╚██╗ ██╔╝
  ███████║██████╔╝██████╔╝ ╚████╔╝  ╚████╔╝ 
  ██╔══██║██╔══██╗██╔══██╗  ╚██╔╝    ╚██╔╝  
  ██║  ██║██║  ██║██████╔╝   ██║      ██║   
  ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝    ╚═╝      ╚═╝   
  [ arbyy-sh v2.4.0 - Cyberdeck Terminal Shell ]
`;

const FORTUNES = [
  '"Neexistují chyby v kódu, pouze neplánované funkce." - arbyy',
  '"Konzistence je klíčem, ať už konfiguruješ OSPF nebo stavíš herní mašinu." - arbyy',
  '"Proč používat GUI, když můžeš mít 120 FPS v terminálu?"',
  '"Kód bez testů je jako PC bez pasty na procesoru: dřív nebo později shoří."',
  '"git commit -m \'fix\' je legitimní životní filosofie."',
  '"Jediný skutečný bug v LoL je matchmaking. Moje mechaniky jsou 100%."',
];

export const TerminalView: React.FC<TerminalViewProps> = ({ isActive, onNavigate }) => {
  const { lang, setLang, t } = useLanguage();
  const { setTheme } = useTheme();
  const { audioEnabled, setAudioEnabled, playClick } = useAudio();
  const { triggerMatrixRain } = useEasterEgg();
  const { showHUDNotification } = useNotification();

  const isCs = lang === 'cs';

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-banner',
      type: 'banner',
      content: ASCII_LOGO,
    },
    {
      id: 'init-welcome',
      type: 'output',
      content: isCs
        ? 'Vítejte v arbyy-sh v2.4.0 (x86_64-pc-cyberdeck)\nNapište "help" pro seznam příkazů nebo použijte rychlá tlačítka níže.'
        : 'Welcome to arbyy-sh v2.4.0 (x86_64-pc-cyberdeck)\nType "help" for available commands or click the quick action chips below.',
    },
  ]);

  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when view becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    playClick();

    // Append to history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Append input line
    const inputLine: TerminalLine = {
      id: `in-${Date.now()}-${Math.random()}`,
      type: 'input',
      content: trimmed,
    };

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputContent: React.ReactNode = '';
    let outputType: TerminalLine['type'] = 'output';

    switch (cmd) {
      case 'help':
      case '?':
        outputContent = (
          <div className="term-help-grid">
            <div className="term-help-item">
              <span className="term-cmd">neofetch</span>
              <span className="term-desc">{isCs ? 'Zobrazit systémové specifikace a profil' : 'Display system specs & profile'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">about</span>
              <span className="term-desc">{isCs ? 'O mně a současná role ve VALBEK-EU, a.s.' : 'About me & current position at VALBEK-EU, a.s.'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">skills</span>
              <span className="term-desc">{isCs ? 'Přehled vývojářských a síťových znalostí' : 'Development & network skills matrix'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">projects</span>
              <span className="term-desc">{isCs ? 'Seznam mých projektů s popisem' : 'List of my projects with descriptions'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">work / exp</span>
              <span className="term-desc">{isCs ? 'Pracovní zkušenosti a vzdělání' : 'Work experience and education'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">contact</span>
              <span className="term-desc">{isCs ? 'Kontaktní údaje a sociální sítě' : 'Contact info and social links'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">cv</span>
              <span className="term-desc">{isCs ? 'Otevřít generátor životopisu (1x A4)' : 'Open resume generator (1x A4)'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">theme &lt;barva&gt;</span>
              <span className="term-desc">{isCs ? 'Změna tématu (green, blue, amber, red, purple, pink)' : 'Change theme (green, blue, amber, red, purple, pink)'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">matrix</span>
              <span className="term-desc">{isCs ? 'Spustit Matrix digitální déšť' : 'Trigger Matrix digital rain effect'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">goto &lt;strana&gt;</span>
              <span className="term-desc">{isCs ? 'Přejít na sekci (home, skills, certs, tools, exp, lol, games, projects, contact)' : 'Navigate to section'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">ping &lt;host&gt;</span>
              <span className="term-desc">{isCs ? 'Simulace síťového pingu' : 'Simulate network ping to host'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">sound &lt;on|off&gt;</span>
              <span className="term-desc">{isCs ? 'Zapnout nebo vypnout zvukové efekty' : 'Toggle sound synthesizer on or off'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">fortune</span>
              <span className="term-desc">{isCs ? 'Náhodná hláška nebo moudro' : 'Random nerd/dev quote'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">history</span>
              <span className="term-desc">{isCs ? 'Historie zadaných příkazů' : 'View recent command history'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">whoami</span>
              <span className="term-desc">{isCs ? 'Kdo jsem a co dělám' : 'User info and identity'}</span>
            </div>
            <div className="term-help-item">
              <span className="term-cmd">clear / cls</span>
              <span className="term-desc">{isCs ? 'Vyčistit obrazovku terminálu' : 'Clear terminal screen'}</span>
            </div>
          </div>
        );
        break;

      case 'neofetch':
      case 'fastfetch':
        outputContent = (
          <div className="term-neofetch">
            <pre className="term-neofetch-art">
{`   /\\_/\\
  ( o.o )
   > ^ <
  /|   |\\
 (_|   |_)`}
            </pre>
            <div className="term-neofetch-info">
              <div className="term-neo-header">
                <strong>arbyy</strong>@<strong>valbek-eu</strong>
              </div>
              <div className="term-neo-sep">-----------------------------</div>
              <div className="term-neo-row"><span>OS:</span> arbyyOS 2026.09 (Rolling Release)</div>
              <div className="term-neo-row"><span>Host:</span> VALBEK-EU Rig</div>
              <div className="term-neo-row"><span>Kernel:</span> 6.8.0-arbyy-lts x86_64</div>
              <div className="term-neo-row"><span>Role:</span> Aplikační specialista - Junior</div>
              <div className="term-neo-row"><span>Firma:</span> VALBEK-EU, a.s.</div>
              <div className="term-neo-row"><span>Specializace:</span> Vývoj webových aplikací</div>
              <div className="term-neo-row"><span>Stack:</span> React 19, TypeScript, Vite, Python, SQL</div>
              <div className="term-neo-row"><span>Sítě:</span> Cisco CCNA 1 &amp; 2, OSPF, VLAN, STP</div>
              <div className="term-neo-row"><span>Editor:</span> VS Code / Neovim</div>
              <div className="term-neo-row"><span>Shell:</span> arbyy-sh v2.4</div>
              <div className="term-neo-palette">
                <span style={{ background: '#00ff66' }} />
                <span style={{ background: '#00b4d8' }} />
                <span style={{ background: '#ffaa00' }} />
                <span style={{ background: '#ff3366' }} />
                <span style={{ background: '#b829dd' }} />
                <span style={{ background: '#ff007f' }} />
                <span style={{ background: '#ffffff' }} />
                <span style={{ background: '#222222' }} />
              </div>
            </div>
          </div>
        );
        break;

      case 'about':
      case 'cat':
        if (args[0] === 'about.txt' || cmd === 'about') {
          outputContent = (
            <div className="term-text-block">
              <p>
                <strong>Adam "Arbyy" Macků</strong> — {isCs ? 'Vývojář webových aplikací & Tech nadšenec' : 'Web Application Developer & Tech Enthusiast'}
              </p>
              <p>
                {isCs
                  ? 'Působím ve společnosti VALBEK-EU, a.s. jako Aplikační specialista - Junior. Věnuji se vývoji moderních webových aplikací (React, TypeScript, CSS/SCSS), správě systémů, počítačovým sítím (Cisco CCNA) a stavění PC sestav. Ve volném čase hraju hry, tvořím s AI a čtu mangu.'
                  : 'Currently working at VALBEK-EU, a.s. as an Application Specialist - Junior. Passionate about web application development (React, TypeScript, CSS/SCSS), system operations, computer networks (Cisco CCNA), and custom PC building. In my free time, I enjoy gaming, creating with AI, and reading manga.'}
              </p>
              <p>
                📍 <em>{isCs ? 'Liberec, Česká republika' : 'Liberec, Czech Republic'}</em>
              </p>
            </div>
          );
        } else {
          outputContent = `cat: ${args.join(' ')}: No such file or directory. Zkuste "cat about.txt"`;
          outputType = 'error';
        }
        break;

      case 'skills':
      case 'ls':
        if (cmd === 'skills' || args[0] === 'skills') {
          outputContent = (
            <div className="term-skills-box">
              <div><strong>[ VÝVOJ &amp; WEB ]</strong>: React, TypeScript, JavaScript, Python, Django, SQL, HTML5, SCSS, Git/GitHub</div>
              <div><strong>[ SÍTĚ &amp; INFRASTRUKTURA ]</strong>: Cisco CCNA 1 &amp; 2, OSPF, VLAN, STP, TCP/IP, DNS/DHCP, Packet Tracer</div>
              <div><strong>[ SYSTÉMY &amp; HARDWARE ]</strong>: Správa OS (Windows/Linux), Diagnostika HW, Sestavování PC (5+ builds), AI nástroje (Claude, Gemini)</div>
            </div>
          );
        } else if (args.length === 0) {
          outputContent = 'about.txt  skills/  projects/  experience/  contact.txt  cv.pdf';
        } else {
          outputContent = `ls: cannot access '${args.join(' ')}': No such file or directory`;
          outputType = 'error';
        }
        break;

      case 'projects':
        outputContent = (
          <div className="term-projects-list">
            <div>1. <strong>Funny weby pro přítelkyni</strong> - Detektivní a zamilovaný web s interaktivními hádkami.</div>
            <div>2. <strong>ScrapScrap</strong> - Steampunková prohlížečová web hra s obchodem a žebříčky.</div>
            <div>3. <strong>Kasař</strong> - Open-source osobní správce rozpočtu a financí.</div>
            <div>4. <strong>Výherní automaty</strong> - Python/Pygame slot machine s animacemi.</div>
            <div>5. <strong>Rádio Bot</strong> - Custom Discord bot pro české rádiové stanice ve voice kanálech.</div>
            <div>6. <strong>D&amp;D Virtual Tabletop</strong> - Webové rozhraní pro správu D&amp;D map a hodů kostkou.</div>
            <div style={{ marginTop: '0.4rem', opacity: 0.8 }}>
              💡 <em>Napište "goto projects" pro otevření plné grafické sekce projektů.</em>
            </div>
          </div>
        );
        break;

      case 'work':
      case 'experience':
      case 'exp':
        outputContent = (
          <div className="term-exp-list">
            <div>🏢 <strong>VALBEK-EU, a.s.</strong> (2026 – současnost)</div>
            <div style={{ paddingLeft: '1.2rem', color: '#00ff66' }}>
              &gt; Aplikační specialista - Junior (Vývoj webových aplikací)
            </div>
            <div style={{ paddingLeft: '1.2rem', opacity: 0.8 }}>
              Vývoj a správa webových aplikací, implementace nových funkcionalit, práce s moderními webovými technologiemi.
            </div>

            <div style={{ marginTop: '0.4rem' }}>🎓 <strong>Střední průmyslová škola a Střední odborná škola, Varnsdorf</strong> (2022 – 2026)</div>
            <div style={{ paddingLeft: '1.2rem' }}>&gt; Obor: Informační technologie (Maturitní zkouška)</div>

            <div style={{ marginTop: '0.4rem' }}>🔧 <strong>IT servis Turnov</strong> (Odborná praxe)</div>
            <div style={{ paddingLeft: '1.2rem', opacity: 0.8 }}>Diagnostika hardwaru, servis PC a notebooků, instalace systémů.</div>

            <div style={{ marginTop: '0.4rem' }}>💻 <strong>Spolupráce na webových projektech (u Tomáše Hubičky)</strong> (Odborná praxe)</div>
            <div style={{ paddingLeft: '1.2rem', opacity: 0.8 }}>Tvorba webových stránek, práce s HTML/CSS a reálnými zakázkami.</div>
          </div>
        );
        break;

      case 'contact':
      case 'socials':
      case 'social':
        outputContent = (
          <div className="term-contact-box">
            <div>📧 <strong>E-mail:</strong> <a href="mailto:mackuadam37@gmail.com" target="_blank" rel="noreferrer">mackuadam37@gmail.com</a></div>
            <div>📱 <strong>Telefon:</strong> +420 776 739 054</div>
            <div>🐙 <strong>GitHub:</strong> <a href="https://github.com/gitArby" target="_blank" rel="noreferrer">github.com/gitArby</a></div>
            <div>📸 <strong>Instagram:</strong> <a href="https://www.instagram.com/adam.macku" target="_blank" rel="noreferrer">instagram.com/adam.macku</a></div>
            <div>🎮 <strong>Steam:</strong> <a href="https://steamcommunity.com/id/TadyArby" target="_blank" rel="noreferrer">steamcommunity.com/id/TadyArby</a></div>
            <div>💬 <strong>Discord:</strong> arbyy</div>
          </div>
        );
        break;

      case 'cv':
        generateCV(lang);
        outputContent = isCs
          ? '📄 Generuji životopis ve formátu 1x A4 v novém okně...'
          : '📄 Generating 1x A4 resume in a new tab...';
        outputType = 'success';
        break;

      case 'matrix':
        triggerMatrixRain();
        outputContent = '🟢 Spouštím Matrix digitální déšť... Wake up, Neo.';
        outputType = 'success';
        break;

      case 'theme': {
        const themeName = args[0]?.toLowerCase() as ThemeName;
        const validThemes: ThemeName[] = ['green', 'blue', 'amber', 'red', 'purple', 'pink'];
        if (validThemes.includes(themeName)) {
          setTheme(themeName);
          outputContent = `🎨 Téma úspěšně přepnuto na: ${themeName}`;
          outputType = 'success';
        } else {
          outputContent = `Neznámé téma "${args[0]}". Dostupné barvy: ${validThemes.join(', ')}`;
          outputType = 'error';
        }
        break;
      }

      case 'sound': {
        const val = args[0]?.toLowerCase();
        if (val === 'on' || val === '1' || val === 'enable') {
          setAudioEnabled(true);
          outputContent = '🔊 Zvukové efekty zapnuty.';
          outputType = 'success';
        } else if (val === 'off' || val === '0' || val === 'disable') {
          setAudioEnabled(false);
          outputContent = '🔇 Zvukové efekty ztlumeny.';
          outputType = 'info' as unknown as TerminalLine['type'];
        } else {
          outputContent = `Zvuk je momentálně: ${audioEnabled ? 'ZAPNUTÝ' : 'VYPNUTÝ'}. Použití: "sound on" nebo "sound off".`;
        }
        break;
      }

      case 'lang': {
        const val = args[0]?.toLowerCase();
        if (val === 'cs' || val === 'cz') {
          setLang('cs');
          outputContent = '🇨🇿 Jazyk přepnut na češtinu.';
          outputType = 'success';
        } else if (val === 'en') {
          setLang('en');
          outputContent = '🇬🇧 Language switched to English.';
          outputType = 'success';
        } else {
          outputContent = 'Použití: "lang cs" nebo "lang en".';
          outputType = 'error';
        }
        break;
      }

      case 'goto': {
        const target = args[0]?.toLowerCase();
        const viewMap: Record<string, ViewId> = {
          home: 'home-view',
          about: 'about-view',
          skills: 'skills-view',
          certs: 'certificates-view',
          certificates: 'certificates-view',
          tools: 'calculator-view',
          calc: 'calculator-view',
          calculator: 'calculator-view',
          terminal: 'terminal-view',
          exp: 'experience-view',
          experience: 'experience-view',
          praxe: 'experience-view',
          lol: 'lol-stats-view',
          games: 'games-view',
          minihry: 'games-view',
          projects: 'projects-view',
          ipsum: 'ipsum-view',
          faq: 'faq-view',
          contact: 'contact-view',
        };

        if (target && viewMap[target]) {
          onNavigate(viewMap[target]);
          outputContent = `🚀 Naviguji do sekce: ${target}...`;
          outputType = 'success';
        } else {
          outputContent = `Neznámá sekce "${target}". Možnosti: ${Object.keys(viewMap).join(', ')}`;
          outputType = 'error';
        }
        break;
      }

      case 'ping': {
        const host = args[0] || 'valbek.eu';
        outputContent = (
          <div className="term-ping-output">
            <div>PING {host} (192.168.10.1): 56 data bytes</div>
            <div>64 bytes from 192.168.10.1: icmp_seq=1 ttl=64 time=0.482 ms</div>
            <div>64 bytes from 192.168.10.1: icmp_seq=2 ttl=64 time=0.391 ms</div>
            <div>64 bytes from 192.168.10.1: icmp_seq=3 ttl=64 time=0.415 ms</div>
            <div>64 bytes from 192.168.10.1: icmp_seq=4 ttl=64 time=0.364 ms</div>
            <div style={{ color: '#00ff66', marginTop: '0.2rem' }}>
              --- {host} ping statistics --- 4 packets transmitted, 4 received, 0% packet loss, time 3004ms
            </div>
          </div>
        );
        break;
      }

      case 'sudo': {
        const sub = args.join(' ');
        if (sub.includes('rm -rf') || sub.includes('rm')) {
          showHUDNotification('⚠️ ALERT: Pokus o neoprávněné smazání kořenového adresáře!', 'error');
          outputContent = (
            <span style={{ color: '#ff3366', fontWeight: 700 }}>
              CRITICAL: /dev/null: Nice try, cowboy! Systém je chráněn neprostupným firewallem. Pokus byl zaznamenán. 🛡️
            </span>
          );
          outputType = 'error';
        } else {
          outputContent = `arbyy is not in the sudoers file. Tento incident byl nahlášen IT oddělení VALBEK-EU, a.s. 🚨`;
          outputType = 'error';
        }
        break;
      }

      case 'whoami':
        outputContent = 'arbyy (Adam Macků - Aplikační specialista - Junior | Vývoj webových aplikací @ VALBEK-EU, a.s.)';
        break;

      case 'date':
      case 'time':
        outputContent = new Date().toLocaleString(isCs ? 'cs-CZ' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        break;

      case 'echo':
        outputContent = args.join(' ');
        break;

      case 'fortune':
      case 'quote':
        outputContent = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
        break;

      case 'history':
        outputContent = (
          <div className="term-history-list">
            {history.map((h, i) => (
              <div key={i}>
                {i + 1}  {h}
              </div>
            ))}
          </div>
        );
        break;

      case 'clear':
      case 'cls':
        setLines([]);
        setInputVal('');
        return;

      default:
        outputContent = isCs
          ? `arbyy-sh: Příkaz nenalezen: "${cmd}". Napište "help" pro zobrazení dostupných příkazů.`
          : `arbyy-sh: Command not found: "${cmd}". Type "help" to view available commands.`;
        outputType = 'error';
        break;
    }

    const outputLine: TerminalLine = {
      id: `out-${Date.now()}-${Math.random()}`,
      type: outputType,
      content: outputContent,
    };

    setLines((prev) => [...prev, inputLine, outputLine]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < history.length) {
          setHistoryIndex(nextIdx);
          setInputVal(history[nextIdx] || '');
        } else {
          setHistoryIndex(-1);
          setInputVal('');
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete basic commands
      const cmds = [
        'help',
        'neofetch',
        'about',
        'skills',
        'projects',
        'work',
        'experience',
        'contact',
        'cv',
        'theme',
        'matrix',
        'ping',
        'goto',
        'clear',
        'sound',
        'lang',
        'whoami',
      ];
      const match = cmds.find((c) => c.startsWith(inputVal.toLowerCase().trim()));
      if (match) {
        setInputVal(match);
      }
    } else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      setLines([]);
    }
  };

  const quickCommands = [
    'neofetch',
    'help',
    'skills',
    'projects',
    'work',
    'cv',
    'matrix',
    'clear',
  ];

  return (
    <div id="terminal-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <section id="terminal" className="container reveal active">
        <h3 className="reveal-stagger" style={{ '--stagger-delay': 1 } as React.CSSProperties}>
          {t.terminal?.title || 'Cyber Terminál'}
        </h3>
        <p
          className="container-text reveal-stagger"
          style={{ '--stagger-delay': 2 } as React.CSSProperties}
        >
          {t.terminal?.subtitle ||
            'Interaktivní příkazová řádka arbyy-sh v2.4. Zadejte "help" pro seznam příkazů nebo použijte rychlá tlačítka.'}
        </p>

        {/* Quick action chips */}
        <div className="terminal-quick-bar reveal-stagger" style={{ '--stagger-delay': 3 } as React.CSSProperties}>
          <span className="quick-title">{t.terminal?.quickTitle || 'Rychlé příkazy:'}</span>
          <div className="quick-chips">
            {quickCommands.map((qCmd) => (
              <button
                key={qCmd}
                className="term-chip-btn"
                onClick={() => handleCommand(qCmd)}
                title={`Spustit příkaz "${qCmd}"`}
              >
                ${qCmd}
              </button>
            ))}
          </div>
        </div>

        {/* Main Terminal Window */}
        <div
          className="cyber-terminal-window reveal-card active"
          style={{ '--stagger-delay': 4 } as React.CSSProperties}
          onClick={handleContainerClick}
        >
          <div className="terminal-titlebar">
            <div className="terminal-buttons">
              <span className="term-btn term-close" onClick={() => setLines([])} title="Zavřít buffer" />
              <span className="term-btn term-minimize" title="Minimalizovat" />
              <span className="term-btn term-maximize" title="Maximalizovat" />
            </div>
            <div className="terminal-title-text">
              <i className="fa-solid fa-terminal" /> arbyy@valbek: ~ (arbyy-sh v2.4.0)
            </div>
            <div className="terminal-badge">
              <span className="term-online-dot" /> LIVE
            </div>
          </div>

          <div className="terminal-screen" ref={terminalBodyRef}>
            {lines.map((line) => (
              <div key={line.id} className={`term-line term-line-${line.type}`}>
                {line.type === 'input' && (
                  <span className="term-prompt">
                    <span className="term-user">arbyy@valbek</span>
                    <span className="term-colon">:</span>
                    <span className="term-path">~</span>
                    <span className="term-dollar">$ </span>
                    <span className="term-input-text">{line.content}</span>
                  </span>
                )}
                {line.type === 'banner' && (
                  <pre className="term-banner-text">{line.content}</pre>
                )}
                {line.type !== 'input' && line.type !== 'banner' && (
                  <div className="term-output-body">{line.content}</div>
                )}
              </div>
            ))}

            {/* Active Input Line */}
            <div className="term-active-line">
              <span className="term-prompt">
                <span className="term-user">arbyy@valbek</span>
                <span className="term-colon">:</span>
                <span className="term-path">~</span>
                <span className="term-dollar">$ </span>
              </span>
              <input
                ref={inputRef}
                type="text"
                className="term-cli-input"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.terminal?.placeholder || 'Zadejte příkaz...'}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
