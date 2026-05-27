document.addEventListener('DOMContentLoaded', () => {
    let activeTopoNode = null;
    let currentLang = localStorage.getItem('lang');
    if (currentLang !== 'cs' && currentLang !== 'en') {
        currentLang = 'cs';
    }

    // Add glitch-hover class to all h3 headers
    document.querySelectorAll('h3').forEach(h3 => {
        h3.classList.add('glitch-hover');
    });

    // --- Boot screen ---
    const bootLines = document.querySelectorAll('.terminal-text p');
    const bootScreen = document.getElementById('boot-screen');
    if (bootScreen && bootLines.length > 0) {
        let delay = 300;
        bootLines.forEach(line => {
            setTimeout(() => {
                line.style.opacity = '1';
            }, delay);
            delay += 600;
        });
        setTimeout(() => {
            bootScreen.classList.add('hidden');
            setTimeout(() => {
                bootScreen.style.display = 'none';
                const mainNav = document.getElementById('main-nav');
                if (mainNav) mainNav.classList.add('visible');
            }, 800);
        }, delay + 800);
    } else {
        const mainNav = document.getElementById('main-nav');
        if (mainNav) mainNav.classList.add('visible');
    }

    // --- Copy email ---
    const copyEmailBtn = document.getElementById('copy-email');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('mackuadam37@gmail.com');
            const toast = document.getElementById('copy-toast');
            if (toast) {
                toast.classList.add('visible');
                setTimeout(() => toast.classList.remove('visible'), 2000);
            }
        });
    }

    // --- Year ---
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // --- Scroll progress ---
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            scrollProgress.style.width = `${pct * 100}%`;
        });
    }

    // --- Navigation ---
    const mainNav = document.getElementById('main-nav');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mainNav) {
        window.addEventListener('scroll', () => {
            mainNav.classList.toggle('scrolled', window.scrollY > 80);
        });
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            navToggle.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('open');
            });
        });
    }

    // --- Typewriter ---
    const twEl = document.getElementById('typewriter');
    const phrases = ['Tech nadšenec', 'hráč her', 'PC builder', 'web developer'];
    let pIdx = 0, cIdx = 0, deleting = false;

    function type() {
        if (!twEl) return;
        const phrase = phrases[pIdx];
        twEl.textContent = deleting ? phrase.slice(0, cIdx - 1) : phrase.slice(0, cIdx + 1);
        deleting ? cIdx-- : cIdx++;
        let delay = deleting ? 60 : 100;
        if (!deleting && cIdx === phrase.length) {
            delay = 2000;
            deleting = true;
        } else if (deleting && cIdx === 0) {
            deleting = false;
            pIdx = (pIdx + 1) % phrases.length;
            delay = 400;
        }
        setTimeout(type, delay);
    }
    if (twEl) {
        setTimeout(type, 2800);
    }

    // --- Scroll reveal ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.2 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // --- Animated counters ---
    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.querySelectorAll('.counter-number').forEach(el => {
                const target = parseInt(el.getAttribute('data-target'));
                const duration = 1800;
                const steps = duration / 16;
                let current = 0;
                const tick = () => {
                    current = Math.min(current + target / steps, target);
                    el.textContent = Math.floor(current).toLocaleString(currentLang === 'cs' ? 'cs-CZ' : 'en-US');
                    if (current < target) {
                        requestAnimationFrame(tick);
                    }
                };
                tick();
            });
            counterObs.unobserve(entry.target);
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counters-grid').forEach(el => counterObs.observe(el));

    // --- Custom cursor ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', e => {
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
            cursorOutline.animate({
                left: `${e.clientX}px`,
                top: `${e.clientY}px`
            }, { duration: 300, fill: 'forwards' });
        });

        document.querySelectorAll('a, button, .discord-badge, #mega-trigger, .topo-node').forEach(el => {
            el.addEventListener('mouseover', () => {
                cursorDot.classList.add('active');
                cursorOutline.classList.add('active');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('active');
                cursorOutline.classList.remove('active');
            });
        });
    }

    // --- Cursor trail ---
    const TRAIL = 10;
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (!isMobile) {
        const trailEls = Array.from({ length: TRAIL }, () => {
            const d = document.createElement('div');
            d.className = 'cursor-trail';
            document.body.appendChild(d);
            return { el: d, x: 0, y: 0 };
        });

        let mx = 0, my = 0;
        window.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
        });

        (function trailLoop() {
            let x = mx, y = my;
            trailEls.forEach((dot, i) => {
                const px = dot.x, py = dot.y;
                dot.x += (x - dot.x) * 0.35;
                dot.y += (y - dot.y) * 0.35;
                dot.el.style.left = `${dot.x}px`;
                dot.el.style.top = `${dot.y}px`;
                const scale = (TRAIL - i) / TRAIL;
                dot.el.style.opacity = scale * 0.45;
                dot.el.style.transform = `translate(-50%, -50%) scale(${scale * 0.8})`;
                x = px;
                y = py;
            });
            requestAnimationFrame(trailLoop);
        })();
    }

    // --- Easter egg ---
    let clickCount = 0, lastClickTime = 0;
    const trigger = document.getElementById('mega-trigger');
    const canvas = document.getElementById('easter-egg-canvas');
    let animationInterval;

    if (trigger && canvas) {
        const ctx = canvas.getContext('2d');

        trigger.addEventListener('click', () => {
            const now = Date.now();
            clickCount = now - lastClickTime < 500 ? clickCount + 1 : 1;
            lastClickTime = now;
            if (clickCount === 6) {
                startEasterEgg();
                clickCount = 0;
            }
        });

        function startEasterEgg() {
            canvas.style.display = 'block';
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            const drops = Array.from({ length: Math.floor(canvas.width / 20) }, () => 1);
            const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZPENTAKILLlol🏆";

            animationInterval = setInterval(() => {
                ctx.fillStyle = "rgba(10,10,10,0.05)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#00ff66";
                ctx.font = "20px var(--font-main)";
                drops.forEach((y, i) => {
                    ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 20, y * 20);
                    if (y * 20 > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                });
            }, 35);

            setTimeout(() => {
                clearInterval(animationInterval);
                canvas.style.display = 'none';
                window.removeEventListener('resize', resizeCanvas);
            }, 5000);
        }

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    // --- Scroll spy ---
    const spySections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');

    if (spySections.length > 0 && navAnchors.length > 0) {
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navAnchors.forEach(a => {
                        a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
                    });
                }
            });
        }, { threshold: 0.35, rootMargin: '-80px 0px -45% 0px' });
        spySections.forEach(s => spyObserver.observe(s));
    }

    // --- 3D tilt na kartách ---
    document.querySelectorAll('.project-card, .cert-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
            card.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-5px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = '';
            card.style.transform = '';
        });
    });

    // --- i18n ---
    const i18n = {
        cs: {
            nav: ['O mně', 'Dovednosti', 'Certifikáty', 'Nástroje', 'Praxe', 'LoL', 'Projekty', 'Kontakt'],
            subtitle: ['Tech nadšenec', 'hráč her', 'PC builder', 'web developer'],
            hero: {
                contactBtn: 'Kontakt',
                cvBtn: 'Zobrazit CV'
            },
            about: {
                title: 'O mně',
                text: 'Ahoj! Jsem Adam a věnuji se technologiím. Jsem čerstvý absolvent oboru Informační technologie se silným technickým zázemím a hlubokým zájmem o IT, hardware a síťové technologie. Jsem proaktivní, rychle se učím novým systémům a baví mě skládání PC i konfigurace sítí. Hledám příležitost, kde uplatním své znalosti a budu se dále profesně rozvíjet.',
                locationLabel: 'Lokalita:',
                locationValue: 'Liberec, Česká republika',
                languagesLabel: 'Jazyky:',
                languagesValue: 'Čeština (rodilý mluvčí), Angličtina (B2 - C1)'
            },
            skills: {
                title: 'Dovednosti & Zájmy',
                text: 'Kromě softwaru a vývoje se zajímám o počítačové sítě a hardware. Zde je strukturovaný přehled mých dovedností:',
                catWeb: 'Vývoj & Web',
                catNet: 'Počítačové sítě',
                catSys: 'Hardware & OS',
                diag: 'Diagnostika',
                os: 'Správa OS',
                support: 'IT Podpora',
                office: 'MS Office',
                photoshop: 'Photoshop (základy)'
            },
            certs: {
                title: 'Certifikace',
                subtitle: 'Oficiální osvědčení, která potvrzují mé teoretické i praktické znalosti v oblasti síťových technologií.',
                status: 'Dokončeno',
                ccna1: {
                    title: 'CCNA 1: Introduction to Networks',
                    desc: 'Základy počítačových sítí, IP adresace (IPv4/IPv6), síťové protokoly, Ethernet a základní konfigurace přepínačů a směrovačů.'
                },
                ccna2: {
                    title: 'CCNA 2: Switching, Routing, and Wireless Essentials',
                    desc: 'Směrovací protokoly (OSPF), konfigurace VLAN, redundantní sítě (STP/EtherChannel), bezpečnost sítě (ACL/DHCP Snooping) a základy WLAN.'
                }
            },
            calculator: {
                title: 'Nástroje & Kalkulačky',
                subtitle: 'Rychlé výpočty podsítí pro síťaře a standardní/vědecká kalkulačka pro každodenní úkoly.',
                tabSubnet: 'Subnet kalkulačka',
                tabMath: 'Matematická kalkulačka',
                subnetIp: 'IP adresa:',
                subnetCidr: 'Maska / CIDR:',
                resMask: 'Maska sítě:',
                resNet: 'Adresa sítě (Network):',
                resBroadcast: 'Broadcast adresa:',
                resRange: 'Rozsah použitelných IP:',
                resHosts: 'Počet použitelných hostů:',
                resWildcard: 'Wildcard maska:',
                binHdr: 'Binární vizualizace',
                mathMode: 'Režim:',
                mathModeStd: 'Standardní',
                mathModeSci: 'Vědecká'
            },
            timeline: {
                title: 'Vzdělání & Zkušenosti',
                subtitle: 'Přehled mého studia a odborných praxí v IT oblasti.',
                edu1: {
                    title: 'Střední průmyslová škola a Střední odborná škola, Varnsdorf',
                    sub: 'Obor: Informační technologie',
                    desc: 'Absolvent studia zakončeného maturitní zkouškou. Zaměření na správu systémů, základy programování, síťové technologie a hardware.'
                },
                exp1: {
                    date: 'Odborná stáž (2 týdny)',
                    title: 'IT servis Turnov',
                    sub: 'Servisní technik',
                    desc: 'Diagnostika, čištění a hardware opravy stolních počítačů a notebooků. Instalace operačních systémů, softwaru a údržba IT vybavení.'
                },
                exp2: {
                    date: 'Odborná stáž (2 týdny)',
                    title: 'Spolupráce na webových projektech (u Tomáše Hubičky)',
                    sub: 'Webový vývojář',
                    desc: 'Praktické seznámení s vývojovým procesem, tvorba a správa webových stránek. Práce s HTML, CSS a ladění kódu na reálných projektech.'
                }
            },
            lol: { title: 'League of Legends', btn: 'Zobrazit na u.gg' },
            projects: {
                title: 'Projekty',
                text: 'Stále se posouvám dál. Tady je malá ukázka toho, na čem momentálně pracuji a co se teprve klube na svět:',
                c1t: 'Funny weby pro přítelkyni',
                c1d: 'Pracuji na vtipných webech s love nebo detektivní tématikou.',
                c1badge: 'Ve vývoji',
                c2t: 'ScrapScrap',
                c2d: 'Steampunková webová hra, kterou jsem vyvinul. Obsahuje herní obchod, žebříčky a vlastní herní mechaniky.',
                c2badge: 'Spuštěno',
                c2hint: 'Hrát ScrapScrap'
            },
            contact: {
                title: 'Kontakt',
                text: 'Máš zájem o spolupráci, nebo si chceš jen zahrát? Napiš mi!',
                placeholderName: 'Jméno / Name',
                placeholderEmail: 'E-mail',
                placeholderMessage: 'Zpráva / Message',
                submit: 'Odeslat zprávu',
                formAlert: 'Vaše zpráva byla připravena! Otevírám poštovního klienta...'
            },
            counters: ['hodin v LoL', 'sestavených PC', 'roky v tech', 'projektů'],
            nowListening: 'Teď poslouchám', nowPlaying: 'Teď hraju', copyToast: 'Zkopírováno!',
            hud: {
                cvBlocked: 'Pro vygenerování CV prosím povolte vyskakovací okna (pop-ups).',
                formSuccess: 'Zpráva byla úspěšně připravena! Otevírám poštovního klienta...'
            },
            ciscoLab: {
                title: 'Cisco CCNA Interaktivní Laboratoř',
                subtitle: 'Kliknutím na síťová zařízení v topologii spustíte simulaci IOS konzole a diagnostických logů.',
                placeholder: '<div class="console-placeholder"><p class="blink-fast">> KONEKTIVITA: SMĚROVÁNÍ AKTIVNÍ [OSPFv2]</p><p>> Kliknutím na jakékoli zařízení na topologické mapě spustíte konzoli a vyvoláte stav konfigurace.</p></div>',
                devices: {
                    router: [
                        'Edge_Router# show ip interface brief',
                        'Interface              IP-Address      OK? Method Status                Protocol',
                        'GigabitEthernet0/0/0   82.114.79.46    YES NVRAM  up                    up      (WAN)',
                        'GigabitEthernet0/0/1   192.168.10.1    YES NVRAM  up                    up      (LAN Gateway)',
                        'Loopback0              1.1.1.1         YES NVRAM  up                    up      (Router ID)',
                        'Edge_Router# show ip route ospf',
                        'Codes: O - OSPF network, IA - OSPF inter area, N1 - OSPF NSSA external 1',
                        'Gateway of last resort is 82.114.79.45 to interface GigabitEthernet0/0/0',
                        '      192.168.20.0/24 [110/2] via 192.168.10.2, 04:12:33, GigabitEthernet0/0/1',
                        '      192.168.30.0/24 [110/2] via 192.168.10.2, 04:12:33, GigabitEthernet0/0/1',
                        'Edge_Router# _'
                    ],
                    switch: [
                        'Core_Switch# show vlan brief',
                        'VLAN Name                             Status    Ports',
                        '---- -------------------------------- --------- -------------------------------',
                        '1    default                          active    Gi0/2, Gi0/3, Gi0/4',
                        '10   Management                       active    Fa0/1, Fa0/2',
                        '20   Workstations                     active    Fa0/5, Fa0/6, Fa0/7, Fa0/8',
                        '30   Servers                          active    Fa0/10, Fa0/11',
                        'Core_Switch# show spanning-tree vlan 10',
                        'VLAN0010',
                        '  Spanning tree enabled protocol rstp',
                        '  Root ID    Priority    32778',
                        '             Address     000A.41F2.A780',
                        '             This bridge is the root',
                        'Core_Switch# _'
                    ],
                    pc: [
                        'Workstation:\u007e$ ipconfig /all',
                        'Ethernet adapter Local Area Connection:',
                        '   Connection-specific DNS Suffix  . : arbyy.tech',
                        '   IPv4 Address. . . . . . . . . . . : 192.168.20.105 (DHCP Active)',
                        '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
                        '   Default Gateway . . . . . . . . . : 192.168.20.1',
                        '   DNS Servers . . . . . . . . . . . : 192.168.30.10 (Local_Server)',
                        'Workstation:\u007e$ ping 192.168.30.10',
                        'Pinging 192.168.30.10 with 32 bytes of data:',
                        'Reply from 192.168.30.10: bytes=32 time<1ms TTL=63',
                        'Reply from 192.168.30.10: bytes=32 time<1ms TTL=63',
                        'Reply from 192.168.30.10: bytes=32 time<1ms TTL=63',
                        'Reply from 192.168.30.10: bytes=32 time<1ms TTL=63',
                        'Ping statistics for 192.168.30.10:',
                        '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)',
                        'Workstation:\u007e$ _'
                    ],
                    server: [
                        'Local_Server:\u007e$ show system-status',
                        'OS: Ubuntu Server 24.04 LTS',
                        'Kernel: 6.8.0-generic',
                        'IP Address: 192.168.30.10 (Static)',
                        'Active Services:',
                        '  - BIND9 DNS Service (Port 53) -> [RUNNING]',
                        '  - Kea DHCP Daemon   (Port 67) -> [RUNNING]',
                        '  - NGINX Web Server  (Port 80) -> [RUNNING]',
                        'Network Stats:',
                        '  Uptime: 247 days, 14 hours, 2 minutes',
                        '  Total Received: 1.42 TiB | Total Transmitted: 8.94 TiB',
                        'Local_Server:\u007e$ _'
                    ]
                }
            }
        },
        en: {
            nav: ['About', 'Skills', 'Certificates', 'Tools', 'Experience', 'LoL', 'Projects', 'Contact'],
            subtitle: ['Tech enthusiast', 'gamer', 'PC builder', 'web developer'],
            hero: {
                contactBtn: 'Contact',
                cvBtn: 'View CV'
            },
            about: {
                title: 'About me',
                text: 'Hey! I\'m Adam and I\'m passionate about tech. I\'m a fresh IT graduate with a strong technical background and a deep interest in IT, computer hardware, and network technologies. I am proactive, a fast learner, and I enjoy building PCs and configuring networks. I am looking for opportunities to apply my knowledge and grow professionally.',
                locationLabel: 'Location:',
                locationValue: 'Liberec, Czech Republic',
                languagesLabel: 'Languages:',
                languagesValue: 'Czech (Native), English (B2 - C1)'
            },
            skills: {
                title: 'Skills & Interests',
                text: 'Besides software and coding, I am passionate about computer networking and hardware. Here is a structured overview of my skills:',
                catWeb: 'Development & Web',
                catNet: 'Computer Networks',
                catSys: 'Hardware & OS',
                diag: 'Diagnostics',
                os: 'OS Admin',
                support: 'IT Support',
                office: 'MS Office',
                photoshop: 'Photoshop (basics)'
            },
            certs: {
                title: 'Certifications',
                subtitle: 'Official credentials validating my theoretical and practical knowledge in network technologies.',
                status: 'Completed',
                ccna1: {
                    title: 'CCNA 1: Introduction to Networks',
                    desc: 'Introduction to network architectures, IP addressing (IPv4/IPv6), network protocols, Ethernet concepts, and basic switch/router configurations.'
                },
                ccna2: {
                    title: 'CCNA 2: Switching, Routing, and Wireless Essentials',
                    desc: 'Routing protocols (OSPF), VLAN configuration, redundant network topologies (STP/EtherChannel), network security (ACLs/DHCP Snooping), and WLAN basics.'
                }
            },
            calculator: {
                title: 'Tools & Calculators',
                subtitle: 'Quick subnet calculations for networkers and standard/scientific calculator for daily tasks.',
                tabSubnet: 'Subnet Calculator',
                tabMath: 'Math Calculator',
                subnetIp: 'IP Address:',
                subnetCidr: 'Mask / CIDR:',
                resMask: 'Subnet Mask:',
                resNet: 'Network Address:',
                resBroadcast: 'Broadcast Address:',
                resRange: 'Usable IP Range:',
                resHosts: 'Usable Hosts:',
                resWildcard: 'Wildcard Mask:',
                binHdr: 'Binary Visualization',
                mathMode: 'Mode:',
                mathModeStd: 'Standard',
                mathModeSci: 'Scientific'
            },
            timeline: {
                title: 'Education & Experience',
                subtitle: 'Overview of my academic background and professional internships in IT.',
                edu1: {
                    title: 'Secondary Technical and Vocational School, Varnsdorf',
                    sub: 'Field of Study: Information Technology',
                    desc: 'Graduate of a study program completed with the school-leaving exam (Maturita). Focused on systems administration, programming basics, networking, and hardware.'
                },
                exp1: {
                    date: 'Internship (2 weeks)',
                    title: 'IT service Turnov',
                    sub: 'Service Technician',
                    desc: 'Diagnostics, cleaning, and hardware repairs of desktop computers and laptops. Installation of operating systems, software, and general maintenance of IT equipment.'
                },
                exp2: {
                    date: 'Internship (2 weeks)',
                    title: 'Web Projects Collaboration (with Tomáš Hubička)',
                    sub: 'Web Developer',
                    desc: 'Practical hands-on experience with web development workflows, creating and managing websites. Writing HTML, CSS, and debugging code on real-world projects.'
                }
            },
            lol: { title: 'League of Legends', btn: 'View on u.gg' },
            projects: {
                title: 'Projects',
                text: 'Still pushing forward. Here\'s a small preview of what I\'m currently working on and what\'s coming soon:',
                c1t: 'Funny websites for my girlfriend',
                c1d: 'Working on fun websites with love or detective themes.',
                c1badge: 'In progress',
                c2t: 'ScrapScrap',
                c2d: 'A steampunk-themed web clicker game that I developed. Features an in-game shop, leaderboards, and custom game mechanics.',
                c2badge: 'Live',
                c2hint: 'Play ScrapScrap'
            },
            contact: {
                title: 'Contact',
                text: 'Interested in collaboration, or just want to play? Hit me up!',
                placeholderName: 'Jméno / Name',
                placeholderEmail: 'E-mail',
                placeholderMessage: 'Zpráva / Message',
                submit: 'Send Message',
                formAlert: 'Message prepared! Launching email client...'
            },
            counters: ['hours in LoL', 'built PCs', 'years in tech', 'projects'],
            nowListening: 'Now listening', nowPlaying: 'Now playing', copyToast: 'Copied!',
            hud: {
                cvBlocked: 'Please enable pop-ups to generate your CV.',
                formSuccess: 'Message successfully prepared! Opening email client...'
            },

            ciscoLab: {
                title: 'Cisco CCNA Interactive Lab',
                subtitle: 'Click on network devices in the topology map to start the simulated IOS console and diagnostic logs.',
                placeholder: '<div class="console-placeholder"><p class="blink-fast">> CONNECTIVITY: ROUTING ACTIVE [OSPFv2]</p><p>> Click on any device on the topology map to start the console and retrieve configuration status.</p></div>',
                devices: {
                    router: [
                        'Edge_Router# show ip interface brief',
                        'Interface              IP-Address      OK? Method Status                Protocol',
                        'GigabitEthernet0/0/0   82.114.79.46    YES NVRAM  up                    up      (WAN)',
                        'GigabitEthernet0/0/1   192.168.10.1    YES NVRAM  up                    up      (LAN Gateway)',
                        'Loopback0              1.1.1.1         YES NVRAM  up                    up      (Router ID)',
                        'Edge_Router# show ip route ospf',
                        'Codes: O - OSPF network, IA - OSPF inter area, N1 - OSPF NSSA external 1',
                        'Gateway of last resort is 82.114.79.45 to interface GigabitEthernet0/0/0',
                        '      192.168.20.0/24 [110/2] via 192.168.10.2, 04:12:33, GigabitEthernet0/0/1',
                        '      192.168.30.0/24 [110/2] via 192.168.10.2, 04:12:33, GigabitEthernet0/0/1',
                        'Edge_Router# _'
                    ],
                    switch: [
                        'Core_Switch# show vlan brief',
                        'VLAN Name                             Status    Ports',
                        '---- -------------------------------- --------- -------------------------------',
                        '1    default                          active    Gi0/2, Gi0/3, Gi0/4',
                        '10   Management                       active    Fa0/1, Fa0/2',
                        '20   Workstations                     active    Fa0/5, Fa0/6, Fa0/7, Fa0/8',
                        '30   Servers                          active    Fa0/10, Fa0/11',
                        'Core_Switch# show spanning-tree vlan 10',
                        'VLAN0010',
                        '  Spanning tree enabled protocol rstp',
                        '  Root ID    Priority    32778',
                        '             Address     000A.41F2.A780',
                        '             This bridge is the root',
                        'Core_Switch# _'
                    ],
                    pc: [
                        'Workstation:\u007e$ ipconfig /all',
                        'Ethernet adapter Local Area Connection:',
                        '   Connection-specific DNS Suffix  . : arbyy.tech',
                        '   IPv4 Address. . . . . . . . . . . : 192.168.20.105 (DHCP Active)',
                        '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
                        '   Default Gateway . . . . . . . . . : 192.168.20.1',
                        '   DNS Servers . . . . . . . . . . . : 192.168.30.10 (Local_Server)',
                        'Workstation:\u007e$ ping 192.168.30.10',
                        'Pinging 192.168.30.10 with 32 bytes of data:',
                        'Reply from 192.168.30.10: bytes=32 time<1ms TTL=63',
                        'Reply from 192.168.30.10: bytes=32 time<1ms TTL=63',
                        'Reply from 192.168.30.10: bytes=32 time<1ms TTL=63',
                        'Reply from 192.168.30.10: bytes=32 time<1ms TTL=63',
                        'Ping statistics for 192.168.30.10:',
                        '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)',
                        'Workstation:\u007e$ _'
                    ],
                    server: [
                        'Local_Server:\u007e$ show system-status',
                        'OS: Ubuntu Server 24.04 LTS',
                        'Kernel: 6.8.0-generic',
                        'IP Address: 192.168.30.10 (Static)',
                        'Active Services:',
                        '  - BIND9 DNS Service (Port 53) -> [RUNNING]',
                        '  - Kea DHCP Daemon   (Port 67) -> [RUNNING]',
                        '  - NGINX Web Server  (Port 80) -> [RUNNING]',
                        'Network Stats:',
                        '  Uptime: 247 days, 14 hours, 2 minutes',
                        '  Total Received: 1.42 TiB | Total Transmitted: 8.94 TiB',
                        'Local_Server:\u007e$ _'
                    ]
                }
            }
        }
    };

    function applyLanguage(lang) {
        const t = i18n[lang];
        if (!t) return;

        document.querySelectorAll('.nav-links a').forEach((a, i) => {
            if (t.nav[i]) a.textContent = t.nav[i];
        });

        phrases.length = 0;
        t.subtitle.forEach(p => phrases.push(p));

        // Hero buttons
        const contactBtn = document.getElementById('btn-hero-contact');
        if (contactBtn) contactBtn.textContent = t.hero.contactBtn;

        const cvBtn = document.getElementById('btn-hero-cv');
        if (cvBtn) cvBtn.innerHTML = `<i class="fa-solid fa-file-pdf"></i> ${t.hero.cvBtn}`;

        // About
        const aboutH3 = document.querySelector('#about h3');
        if (aboutH3) aboutH3.textContent = t.about.title;

        const aboutP = document.querySelector('#about p');
        if (aboutP) aboutP.innerHTML = t.about.text;

        const locLabel = document.querySelector('.about-meta .meta-item:nth-child(1) .meta-label');
        if (locLabel) locLabel.textContent = t.about.locationLabel;
        const locVal = document.querySelector('.about-meta .meta-item:nth-child(1) .meta-value');
        if (locVal) locVal.textContent = t.about.locationValue;

        const langLabel = document.querySelector('.about-meta .meta-item:nth-child(2) .meta-label');
        if (langLabel) langLabel.textContent = t.about.languagesLabel;
        const langVal = document.querySelector('.about-meta .meta-item:nth-child(2) .meta-value');
        if (langVal) langVal.textContent = t.about.languagesValue;

        // Skills
        const skillsH3 = document.querySelector('#skills h3');
        if (skillsH3) skillsH3.textContent = t.skills.title;

        const skillsText = document.querySelector('#skills .container-text');
        if (skillsText) skillsText.innerHTML = t.skills.text;

        const catTitles = document.querySelectorAll('.skills-category-card .category-title');
        if (catTitles[0]) catTitles[0].textContent = t.skills.catWeb;
        if (catTitles[1]) catTitles[1].textContent = t.skills.catNet;
        if (catTitles[2]) catTitles[2].textContent = t.skills.catSys;

        const skillDiag = document.getElementById('skill-diag');
        if (skillDiag) skillDiag.textContent = t.skills.diag;
        const skillOs = document.getElementById('skill-os');
        if (skillOs) skillOs.textContent = t.skills.os;
        const skillSupport = document.getElementById('skill-support');
        if (skillSupport) skillSupport.textContent = t.skills.support;
        const skillOffice = document.getElementById('skill-office');
        if (skillOffice) skillOffice.textContent = t.skills.office;
        const skillPhotoshop = document.getElementById('skill-photoshop');
        if (skillPhotoshop) skillPhotoshop.textContent = t.skills.photoshop;


        // Certificates
        const certsH3 = document.querySelector('#certificates h3');
        if (certsH3) certsH3.textContent = t.certs.title;
        const certsText = document.querySelector('#certificates .container-text');
        if (certsText) certsText.textContent = t.certs.subtitle;

        const certCards = document.querySelectorAll('.cert-card');
        if (certCards[0]) {
            const h4 = certCards[0].querySelector('.cert-name');
            const p = certCards[0].querySelector('.cert-desc');
            const status = certCards[0].querySelector('.status-label');
            if (h4) h4.textContent = t.certs.ccna1.title;
            if (p) p.textContent = t.certs.ccna1.desc;
            if (status) status.innerHTML = `<i class="fa-solid fa-check-double"></i> ${t.certs.status}`;
        }
        if (certCards[1]) {
            const h4 = certCards[1].querySelector('.cert-name');
            const p = certCards[1].querySelector('.cert-desc');
            const status = certCards[1].querySelector('.status-label');
            if (h4) h4.textContent = t.certs.ccna2.title;
            if (p) p.textContent = t.certs.ccna2.desc;
            if (status) status.innerHTML = `<i class="fa-solid fa-check-double"></i> ${t.certs.status}`;
        }

        // Cisco Lab
        const topoTitle = document.getElementById('topo-title');
        if (topoTitle) topoTitle.textContent = t.ciscoLab.title;
        const topoSubtitle = document.getElementById('topo-subtitle');
        if (topoSubtitle) topoSubtitle.textContent = t.ciscoLab.subtitle;

        if (activeTopoNode) {
            runSimulatedConsole(activeTopoNode);
        } else {
            const consolePlaceholder = document.getElementById('console-placeholder');
            if (consolePlaceholder) {
                consolePlaceholder.innerHTML = t.ciscoLab.placeholder;
            }
        }

        // Timeline
        const expH3 = document.querySelector('#experience h3');
        if (expH3) expH3.textContent = t.timeline.title;
        const expText = document.querySelector('#experience .container-text');
        if (expText) expText.textContent = t.timeline.subtitle;

        const timelineItems = document.querySelectorAll('.timeline-item');
        if (timelineItems[0]) {
            const h4 = timelineItems[0].querySelector('.timeline-title');
            const sub = timelineItems[0].querySelector('.timeline-subtitle');
            const desc = timelineItems[0].querySelector('.timeline-desc');
            if (h4) h4.textContent = t.timeline.edu1.title;
            if (sub) sub.textContent = t.timeline.edu1.sub;
            if (desc) desc.textContent = t.timeline.edu1.desc;
        }
        if (timelineItems[1]) {
            const date = timelineItems[1].querySelector('.timeline-date');
            const h4 = timelineItems[1].querySelector('.timeline-title');
            const sub = timelineItems[1].querySelector('.timeline-subtitle');
            const desc = timelineItems[1].querySelector('.timeline-desc');
            if (date) date.textContent = t.timeline.exp1.date;
            if (h4) h4.textContent = t.timeline.exp1.title;
            if (sub) sub.textContent = t.timeline.exp1.sub;
            if (desc) desc.textContent = t.timeline.exp1.desc;
        }
        if (timelineItems[2]) {
            const date = timelineItems[2].querySelector('.timeline-date');
            const h4 = timelineItems[2].querySelector('.timeline-title');
            const sub = timelineItems[2].querySelector('.timeline-subtitle');
            const desc = timelineItems[2].querySelector('.timeline-desc');
            if (date) date.textContent = t.timeline.exp2.date;
            if (h4) h4.textContent = t.timeline.exp2.title;
            if (sub) sub.textContent = t.timeline.exp2.sub;
            if (desc) desc.textContent = t.timeline.exp2.desc;
        }

        // LoL
        const lolH3 = document.querySelector('#lol-stats h3');
        if (lolH3) lolH3.textContent = t.lol.title;

        const lolBtn = document.querySelector('#lol-stats .btn');
        if (lolBtn) lolBtn.textContent = t.lol.btn;

        // Projects
        const projH3 = document.querySelector('#projects h3');
        if (projH3) projH3.textContent = t.projects.title;

        const projText = document.querySelector('#projects .proj-text');
        if (projText) projText.innerHTML = t.projects.text;

        const cards = document.querySelectorAll('.project-card');
        if (cards[0]) {
            const h4 = cards[0].querySelector('h4');
            const p = cards[0].querySelector('p');
            const badge = cards[0].querySelector('.wip-badge');
            if (h4) h4.textContent = t.projects.c1t;
            if (p) p.textContent = t.projects.c1d;
            if (badge) badge.textContent = t.projects.c1badge;
        }
        if (cards[1]) {
            const h4 = cards[1].querySelector('h4');
            const p = cards[1].querySelector('p');
            const badge = cards[1].querySelector('.wip-badge');
            const hint = cards[1].querySelector('.project-link-hint');
            if (h4) h4.textContent = t.projects.c2t;
            if (p) p.textContent = t.projects.c2d;
            if (badge) badge.textContent = t.projects.c2badge;
            if (hint) hint.innerHTML = `${t.projects.c2hint} <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
        }

        // Contact
        const contactH3 = document.querySelector('#contact h3');
        if (contactH3) contactH3.textContent = t.contact.title;

        const contactText = document.querySelector('#contact .contact-text');
        if (contactText) contactText.textContent = t.contact.text;

        document.querySelectorAll('.counter-label').forEach((el, i) => {
            if (t.counters[i]) el.textContent = t.counters[i];
        });

        const optCs = document.getElementById('opt-cs');
        const optEn = document.getElementById('opt-en');
        if (optCs) optCs.classList.toggle('active', lang === 'cs');
        if (optEn) optEn.classList.toggle('active', lang === 'en');

        // Calculator localization
        const calcTitle = document.getElementById('calc-title');
        if (calcTitle) calcTitle.textContent = t.calculator.title;
        
        const calcSub = document.getElementById('calc-subtitle');
        if (calcSub) calcSub.textContent = t.calculator.subtitle;
        
        const tabSub = document.getElementById('tab-btn-subnet');
        if (tabSub) tabSub.textContent = t.calculator.tabSubnet;
        
        const tabMath = document.getElementById('tab-btn-math');
        if (tabMath) tabMath.textContent = t.calculator.tabMath;
        
        const lblIp = document.getElementById('lbl-subnet-ip');
        if (lblIp) lblIp.textContent = t.calculator.subnetIp;
        
        const lblCidr = document.getElementById('lbl-subnet-cidr');
        if (lblCidr) {
            const span = lblCidr.querySelector('span');
            lblCidr.innerHTML = `${t.calculator.subnetCidr} `;
            if (span) lblCidr.appendChild(span);
        }
        
        const resMask = document.getElementById('res-lbl-mask');
        if (resMask) resMask.textContent = t.calculator.resMask;
        
        const resNet = document.getElementById('res-lbl-net');
        if (resNet) resNet.textContent = t.calculator.resNet;
        
        const resBc = document.getElementById('res-lbl-broadcast');
        if (resBc) resBc.textContent = t.calculator.resBroadcast;
        
        const resRng = document.getElementById('res-lbl-range');
        if (resRng) resRng.textContent = t.calculator.resRange;
        
        const resHst = document.getElementById('res-lbl-hosts');
        if (resHst) resHst.textContent = t.calculator.resHosts;
        
        const resWld = document.getElementById('res-lbl-wildcard');
        if (resWld) resWld.textContent = t.calculator.resWildcard;
        
        const binHdr = document.getElementById('bin-hdr');
        if (binHdr) binHdr.textContent = t.calculator.binHdr;
        
        const mMode = document.getElementById('math-mode-label');
        if (mMode) mMode.textContent = t.calculator.mathMode;
        
        const mModeStd = document.getElementById('math-mode-std');
        if (mModeStd) mModeStd.textContent = t.calculator.mathModeStd;
        
        const mModeSci = document.getElementById('math-mode-sci');
        if (mModeSci) mModeSci.textContent = t.calculator.mathModeSci;

        // Contact Form localization
        const formName = document.getElementById('form-name');
        if (formName) formName.placeholder = t.contact.placeholderName;
        
        const formEmail = document.getElementById('form-email');
        if (formEmail) formEmail.placeholder = t.contact.placeholderEmail;
        
        const formMsg = document.getElementById('form-message');
        if (formMsg) formMsg.placeholder = t.contact.placeholderMessage;
        
        const formSub = document.getElementById('btn-submit-form');
        if (formSub) formSub.textContent = t.contact.submit;

        // Update data-text attributes for glitch hover effects
        document.querySelectorAll('.glitch-hover').forEach(el => {
            el.setAttribute('data-text', el.textContent.trim());
        });

        document.documentElement.lang = lang;
        currentLang = lang;
        localStorage.setItem('lang', lang);
    }

    const langToggleBtn = document.getElementById('lang-toggle');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            applyLanguage(currentLang === 'cs' ? 'en' : 'cs');
        });
    }

    applyLanguage(currentLang);

    // --- CV Dynamic Generator & Printer ---
    // --- HUD System Notifier ---
    function playNotificationSound(type) {
        if (!audioEnabled) return;
        try {
            const ctx = getCtx();
            ctx.resume().then(() => {
                const now = ctx.currentTime;
                const osc1 = ctx.createOscillator();
                const gain = ctx.createGain();
                
                if (type === 'error') {
                    // Two-tone warning beep
                    osc1.frequency.setValueAtTime(150, now);
                    osc1.frequency.setValueAtTime(100, now + 0.1);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                    osc1.connect(gain);
                    gain.connect(ctx.destination);
                    osc1.start(now);
                    osc1.stop(now + 0.25);
                } else if (type === 'success') {
                    // Success chime
                    osc1.frequency.setValueAtTime(600, now);
                    osc1.frequency.setValueAtTime(900, now + 0.08);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                    osc1.connect(gain);
                    gain.connect(ctx.destination);
                    osc1.start(now);
                    osc1.stop(now + 0.3);
                } else {
                    // Tech beep
                    osc1.frequency.setValueAtTime(800, now);
                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                    osc1.connect(gain);
                    gain.connect(ctx.destination);
                    osc1.start(now);
                    osc1.stop(now + 0.15);
                }
            });
        } catch (e) { }
    }

    function showHUDNotification(message, type = 'info') {
        const container = document.getElementById('hud-notifier-container');
        if (!container) return;

        const popup = document.createElement('div');
        popup.className = `hud-popup ${type}`;
        
        let iconClass = 'fa-solid fa-circle-info';
        if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';
        if (type === 'success') iconClass = 'fa-solid fa-circle-check';

        popup.innerHTML = `
            <i class="${iconClass} hud-icon"></i>
            <div class="hud-message">${message}</div>
            <button class="hud-close"><i class="fa-solid fa-xmark"></i></button>
        `;

        container.appendChild(popup);
        playNotificationSound(type);

        const closeBtn = popup.querySelector('.hud-close');
        const dismiss = () => {
            if (popup.classList.contains('dismissing')) return;
            popup.classList.add('dismissing');
            popup.addEventListener('animationend', () => {
                popup.remove();
            });
        };
        
        closeBtn.addEventListener('click', dismiss);
        setTimeout(dismiss, 5000);
    }

    const cvBtn = document.getElementById('btn-hero-cv');
    if (cvBtn) {
        cvBtn.addEventListener('click', (e) => {
            e.preventDefault();
            generateCV(currentLang);
        });
    }

    function generateCV(lang) {
        const cvWindow = window.open('', '_blank');
        if (!cvWindow) {
            showHUDNotification(i18n[lang].hud.cvBlocked, 'error');
            return;
        }

        const isCs = lang === 'cs';
        const title = isCs ? 'Životopis - Adam Macků' : 'Resume - Adam Macků';
        
        const data = {
            name: 'Adam Macků',
            role: isCs ? 'IT Specialista / Síťový Technik' : 'IT Specialist / Network Technician',
            email: 'mackuadam37@gmail.com',
            location: isCs ? 'Liberec, Česká republika' : 'Liberec, Czech Republic',
            github: 'github.com/gitArby',
            
            profileTitle: isCs ? 'Osobní profil' : 'Professional Profile',
            profileText: isCs 
                ? 'Čerstvý absolvent oboru Informační technologie se silným technickým zázemím a zájmem o IT, hardware a síťové technologie. Jsem proaktivní, rychle se učím novým systémům a baví mě práce s technologiemi. Hledám příležitost, kde uplatním své znalosti a budu se dále profesně rozvíjet.'
                : 'Fresh IT graduate with a strong technical background and a deep interest in IT, computer hardware, and network technologies. I am proactive, a fast learner, and I enjoy working with technology. Seeking an opportunity to apply my knowledge and grow professionally.',
                
            educationTitle: isCs ? 'Vzdělání' : 'Education',
            schoolName: 'Střední průmyslová škola a Střední odborná škola, Varnsdorf',
            schoolField: isCs ? 'Obor: Informační technologie (2022–2026)' : 'Field: Information Technology (2022–2026)',
            schoolDesc: isCs 
                ? 'Střední vzdělání s maturitní zkouškou. Zaměření na správu systémů, základy programování, síťové technologie a hardware.'
                : 'Secondary education with the school-leaving exam (Maturita). Focused on systems administration, programming basics, networking, and hardware.',
                
            experienceTitle: isCs ? 'Pracovní praxe & stáže' : 'Work Experience & Internships',
            exp1Title: 'IT servis Turnov',
            exp1Role: isCs ? 'Odborná stáž (2 týdny)' : 'Internship (2 weeks)',
            exp1Desc: isCs
                ? 'Diagnostika a opravy hardwaru, instalace softwaru a základní údržba IT vybavení.'
                : 'Diagnostics and hardware repairs, software installation, and basic IT maintenance.',
            exp2Title: isCs ? 'Spolupráce na webových projektech (u Tomáše Hubičky)' : 'Web Projects Collaboration (with Tomáš Hubička)',
            exp2Role: isCs ? 'Odborná stáž (2 týdny)' : 'Internship (2 weeks)',
            exp2Desc: isCs
                ? 'Praktická zkušenost s tvorbou a správou webových stránek, práce s kódem v rámci reálných projektů.'
                : 'Practical experience with creation and administration of websites, working with code on real projects.',
                
            skillsTitle: isCs ? 'Technické dovednosti' : 'Technical Skills',
            skillsWebTitle: isCs ? 'Vývoj & Web' : 'Development & Web',
            skillsWebList: ['Python', 'HTML', 'CSS', 'SQL basics'],
            skillsNetTitle: isCs ? 'Počítačové sítě' : 'Computer Networks',
            skillsNetList: ['Cisco CCNA 1', 'Cisco CCNA 2', 'Cisco Packet Tracer', 'TCP/IP & DNS'],
            skillsSysTitle: isCs ? 'Hardware & OS' : 'Hardware & OS',
            skillsSysList: [
                isCs ? 'Diagnostika HW' : 'HW Diagnostics',
                isCs ? 'Správa OS' : 'OS Administration',
                isCs ? 'IT podpora' : 'IT Support',
                isCs ? 'Microsoft Office' : 'MS Office',
                isCs ? 'Photoshop (základy)' : 'Photoshop (basics)',
                'Git & GitHub'
            ],
            
            certsTitle: isCs ? 'Certifikace' : 'Certifications',
            certsList: [
                {
                    name: 'CCNA 1: Introduction to Networks',
                    issuer: 'Cisco Networking Academy',
                    desc: isCs
                        ? 'Základy počítačových sítí, IP adresace (IPv4/IPv6), síťové protokoly, Ethernet a konfigurace prvků.'
                        : 'Introduction to network architecture, IP addressing (IPv4/IPv6), network protocols, Ethernet, and basic device configuration.'
                },
                {
                    name: 'CCNA 2: Switching, Routing, and Wireless Essentials',
                    issuer: 'Cisco Networking Academy',
                    desc: isCs
                        ? 'Směrovací protokoly (OSPF), konfigurace VLAN, redundantní sítě (STP/EtherChannel), bezpečnost sítě a základy WLAN.'
                        : 'Routing protocols (OSPF), VLANs, redundant networks (STP/EtherChannel), network security, and WLAN essentials.'
                }
            ],
            
            langTitle: isCs ? 'Jazykové znalosti' : 'Languages',
            langCs: isCs ? 'Čeština: Mateřský jazyk' : 'Czech: Native speaker',
            langEn: isCs ? 'Angličtina: Úroveň B2 - C1' : 'English: B2 - C1 level',
            
            printNote: isCs ? 'Tento dokument byl vygenerován z online portfolia arbyy.tech' : 'This document was generated from arbyy.tech online portfolio'
        };

        const htmlContent = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            line-height: 1.5;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .cv-page {
            max-width: 820px;
            margin: 0 auto;
            padding: 2.5rem;
            box-sizing: border-box;
        }
        .header {
            border-bottom: 3px solid #00b4d8;
            padding-bottom: 1.2rem;
            margin-bottom: 1.5rem;
        }
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }
        .name {
            font-size: 2.4rem;
            font-weight: 800;
            color: #0b132b;
            margin: 0;
            letter-spacing: -0.5px;
        }
        .role {
            font-size: 1.15rem;
            font-weight: 600;
            color: #00b4d8;
            margin: 0.2rem 0 0.8rem 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .contact-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            font-size: 0.85rem;
            color: #4a5568;
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .contact-item i {
            color: #00b4d8;
            font-size: 0.95rem;
        }
        .contact-item a {
            color: inherit;
            text-decoration: none;
        }
        .content-grid {
            display: grid;
            grid-template-columns: 1.7fr 1fr;
            gap: 2.5rem;
        }
        .column-left {
            display: flex;
            flex-direction: column;
            gap: 1.8rem;
        }
        .column-right {
            display: flex;
            flex-direction: column;
            gap: 1.8rem;
        }
        .section {
            margin: 0;
        }
        .section-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #0b132b;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 0.4rem;
            margin-top: 0;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .profile-text {
            font-size: 0.9rem;
            color: #2d3748;
            margin: 0;
            text-align: justify;
        }
        .timeline-item {
            margin-bottom: 1.2rem;
            position: relative;
        }
        .timeline-item:last-child {
            margin-bottom: 0;
        }
        .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.25rem;
        }
        .timeline-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: #0b132b;
            margin: 0;
            max-width: 75%;
        }
        .timeline-date {
            font-size: 0.78rem;
            font-weight: 700;
            color: #00b4d8;
            white-space: nowrap;
        }
        .timeline-subtitle {
            font-size: 0.82rem;
            color: #4a5568;
            font-weight: 600;
            margin: 0 0 0.4rem 0;
        }
        .timeline-desc {
            font-size: 0.85rem;
            color: #4a5568;
            margin: 0;
            text-align: justify;
        }
        .skills-group {
            margin-bottom: 1rem;
        }
        .skills-group:last-child {
            margin-bottom: 0;
        }
        .skills-group-title {
            font-size: 0.85rem;
            font-weight: 700;
            color: #4a5568;
            margin-top: 0;
            margin-bottom: 0.4rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .skill-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;
        }
        .skill-badge {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.78rem;
            color: #2d3748;
            font-weight: 500;
        }
        .cert-item {
            margin-bottom: 1rem;
            border-left: 2px solid #00b4d8;
            padding-left: 0.6rem;
        }
        .cert-item:last-child {
            margin-bottom: 0;
        }
        .cert-issuer {
            font-size: 0.7rem;
            font-weight: 700;
            color: #00b4d8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: block;
        }
        .cert-name {
            font-size: 0.9rem;
            font-weight: 700;
            color: #0b132b;
            margin: 0.1rem 0;
        }
        .cert-desc {
            font-size: 0.78rem;
            color: #4a5568;
            margin: 0;
        }
        .lang-list {
            list-style: none;
            padding: 0;
            margin: 0;
            font-size: 0.85rem;
            color: #2d3748;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }
        .lang-list li {
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .lang-list i {
            color: #00b4d8;
            font-size: 0.8rem;
        }
        .footer-note {
            margin-top: 3rem;
            border-top: 1px dashed #cbd5e0;
            padding-top: 0.6rem;
            font-size: 0.72rem;
            color: #a0aec0;
            text-align: center;
        }
        @media print {
            body {
                width: 100%;
                font-size: 9.5pt !important;
                line-height: 1.3 !important;
            }
            .cv-page {
                padding: 1rem 1.5rem !important;
            }
            .header {
                padding-bottom: 0.5rem !important;
                margin-bottom: 0.8rem !important;
            }
            .name {
                font-size: 1.8rem !important;
            }
            .role {
                font-size: 0.95rem !important;
                margin-bottom: 0.4rem !important;
            }
            .contact-grid {
                gap: 1rem !important;
                font-size: 0.8rem !important;
            }
            .content-grid {
                gap: 1.5rem !important;
            }
            .column-left, .column-right {
                gap: 1rem !important;
            }
            .section-title {
                margin-bottom: 0.4rem !important;
                font-size: 0.95rem !important;
                padding-bottom: 0.2rem !important;
            }
            .profile-text {
                font-size: 0.82rem !important;
            }
            .timeline-item {
                margin-bottom: 0.6rem !important;
            }
            .timeline-title {
                font-size: 0.85rem !important;
            }
            .timeline-subtitle {
                font-size: 0.78rem !important;
                margin-bottom: 0.2rem !important;
            }
            .timeline-desc {
                font-size: 0.78rem !important;
            }
            .skills-group {
                margin-bottom: 0.5rem !important;
            }
            .skills-group-title {
                font-size: 0.78rem !important;
                margin-bottom: 0.2rem !important;
            }
            .skill-badge {
                font-size: 0.72rem !important;
                padding: 0.15rem 0.35rem !important;
            }
            .cert-item {
                margin-bottom: 0.5rem !important;
            }
            .cert-name {
                font-size: 0.82rem !important;
            }
            .cert-desc {
                font-size: 0.72rem !important;
            }
            .lang-list {
                font-size: 0.78rem !important;
                gap: 0.2rem !important;
            }
            .footer-note {
                margin-top: 1rem !important;
                padding-top: 0.4rem !important;
            }
            .cv-top-bar {
                display: none !important;
            }
        }
        .cv-top-bar {
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            padding: 10px 20px;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            position: sticky;
            top: 0;
            z-index: 9999;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .cv-btn {
            font-family: inherit;
            font-size: 0.85rem;
            font-weight: 600;
            padding: 6px 14px;
            border-radius: 4px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
            text-decoration: none;
        }
        .cv-btn-print {
            background: #00b4d8;
            color: white;
            border: none;
        }
        .cv-btn-print:hover {
            background: #0077b6;
        }
        .cv-btn-close {
            background: white;
            color: #495057;
            border: 1px solid #ced4da;
        }
        .cv-btn-close:hover {
            background: #f8f9fa;
            color: #212529;
        }
    </style>
</head>
<body>
    <div class="cv-top-bar">
        <button onclick="window.print()" class="cv-btn cv-btn-print"><i class="fa-solid fa-download"></i> ${isCs ? 'Stáhnout / Tisk' : 'Download / Print'}</button>
        <button onclick="window.close()" class="cv-btn cv-btn-close"><i class="fa-solid fa-xmark"></i> ${isCs ? 'Zavřít' : 'Close'}</button>
    </div>
    <div class="cv-page">
        <div class="header">
            <div class="header-top">
                <h1 class="name">${data.name}</h1>
            </div>
            <div class="role">${data.role}</div>
            <ul class="contact-grid">
                <li class="contact-item">
                    <i class="fa-solid fa-envelope"></i>
                    <a href="mailto:${data.email}">${data.email}</a>
                </li>
                <li class="contact-item">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${data.location}</span>
                </li>
                <li class="contact-item">
                    <i class="fa-brands fa-github"></i>
                    <a href="https://github.com/gitArby" target="_blank">${data.github}</a>
                </li>
            </ul>
        </div>

        <div class="content-grid">
            <div class="column-left">
                <div class="section">
                    <h2 class="section-title">${data.profileTitle}</h2>
                    <p class="profile-text">${data.profileText}</p>
                </div>

                <div class="section">
                    <h2 class="section-title">${data.experienceTitle}</h2>
                    
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${data.exp1Title}</h3>
                            <span class="timeline-date">${data.exp1Role}</span>
                        </div>
                        <div class="timeline-subtitle">${isCs ? 'Odborná stáž' : 'Vocational Internship'}</div>
                        <p class="timeline-desc">${data.exp1Desc}</p>
                    </div>

                    <div class="timeline-item">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${data.exp2Title}</h3>
                            <span class="timeline-date">${data.exp2Role}</span>
                        </div>
                        <div class="timeline-subtitle">${isCs ? 'Odborná stáž' : 'Vocational Internship'}</div>
                        <p class="timeline-desc">${data.exp2Desc}</p>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">${data.educationTitle}</h2>
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${data.schoolName}</h3>
                            <span class="timeline-date">2022 – 2026</span>
                        </div>
                        <div class="timeline-subtitle">${data.schoolField}</div>
                        <p class="timeline-desc">${data.schoolDesc}</p>
                    </div>
                </div>
            </div>

            <div class="column-right">
                <div class="section">
                    <h2 class="section-title">${data.skillsTitle}</h2>
                    
                    <div class="skills-group">
                        <h3 class="skills-group-title">${data.skillsWebTitle}</h3>
                        <div class="skill-badges">
                            ${data.skillsWebList.map(s => `<span class="skill-badge">${s}</span>`).join('')}
                        </div>
                    </div>

                    <div class="skills-group">
                        <h3 class="skills-group-title">${data.skillsNetTitle}</h3>
                        <div class="skill-badges">
                            ${data.skillsNetList.map(s => `<span class="skill-badge">${s}</span>`).join('')}
                        </div>
                    </div>

                    <div class="skills-group">
                        <h3 class="skills-group-title">${data.skillsSysTitle}</h3>
                        <div class="skill-badges">
                            ${data.skillsSysList.map(s => `<span class="skill-badge">${s}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">${data.certsTitle}</h2>
                    ${data.certsList.map(c => `
                        <div class="cert-item">
                            <span class="cert-issuer">${c.issuer}</span>
                            <h3 class="cert-name">${c.name}</h3>
                            <p class="cert-desc">${c.desc}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="section">
                    <h2 class="section-title">${data.langTitle}</h2>
                    <ul class="lang-list">
                        <li><i class="fa-solid fa-circle-check"></i> <span>${data.langCs}</span></li>
                        <li><i class="fa-solid fa-circle-check"></i> <span>${data.langEn}</span></li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="footer-note">
            <span>${data.printNote}</span>
        </div>
    </div>


</body>
</html>
        `;

        cvWindow.document.open();
        cvWindow.document.write(htmlContent);
        cvWindow.document.close();
    }

    applyLanguage(currentLang);

    // --- Lanyard (Discord status + Now Playing) ---
    const DISCORD_ID = '938119246196666378';
    function connectLanyard() {
        const ws = new WebSocket('wss://api.lanyard.rest/socket');
        let hb;
        ws.onmessage = e => {
            const { op, d } = JSON.parse(e.data);
            if (op === 1) {
                hb = setInterval(() => ws.send(JSON.stringify({ op: 3 })), d.heartbeat_interval);
                ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));
            }
            if (op === 0) updatePresence(d);
        };
        ws.onclose = () => {
            clearInterval(hb);
            setTimeout(connectLanyard, 5000);
        };
    }

    function updatePresence(data) {
        const dot = document.getElementById('discord-status');
        if (dot) {
            const colors = { online: '#43b581', idle: '#faa61a', dnd: '#f04747', offline: '#747f8d' };
            dot.style.background = colors[data.discord_status] || colors.offline;
            dot.setAttribute('title', data.discord_status);
        }

        const npEl = document.getElementById('now-playing');
        const npContent = document.getElementById('np-content');
        if (npEl && npContent) {
            if (data.listening_to_spotify && data.spotify) {
                const sp = data.spotify;
                npEl.style.display = 'flex';
                npContent.innerHTML = `
                    <img src="${sp.album_art_url}" alt="cover" class="np-art">
                    <div class="np-text">
                        <span class="np-label"><i class="fa-brands fa-spotify"></i> Teď poslouchám</span>
                        <span class="np-song">${sp.song}</span>
                        <span class="np-artist">${sp.artist}</span>
                    </div>`;
            } else {
                const game = data.activities?.find(a => a.type === 0);
                if (game) {
                    npEl.style.display = 'flex';
                    npContent.innerHTML = `
                        <div class="np-game-icon"><i class="fa-solid fa-gamepad"></i></div>
                        <div class="np-text">
                            <span class="np-label">Teď hraju</span>
                            <span class="np-song">${game.name}</span>
                        </div>`;
                } else {
                    npEl.style.display = 'none';
                }
            }
        }
    }
    connectLanyard();

    // --- Hardware Monitor ---
    (function initMonitor() {
        const timeEl = document.getElementById('hw-time');
        const batteryEl = document.getElementById('hw-battery');
        const netEl = document.getElementById('hw-net');

        function updateTime() {
            if (!timeEl) return;
            const n = new Date();
            timeEl.textContent = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}:${String(n.getSeconds()).padStart(2, '0')}`;
        }
        setInterval(updateTime, 1000);
        updateTime();

        if (batteryEl) {
            if ('getBattery' in navigator) {
                navigator.getBattery().then(b => {
                    const update = () => {
                        const pct = Math.round(b.level * 100);
                        batteryEl.textContent = `${b.charging ? '⚡' : ''}${pct}%`;
                    };
                    update();
                    b.addEventListener('levelchange', update);
                    b.addEventListener('chargingchange', update);
                });
            } else {
                batteryEl.textContent = 'N/A';
            }
        }

        if (netEl) {
            function updateNet() {
                const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                if (c) {
                    const type = (c.effectiveType || c.type || '?').toUpperCase();
                    const dl = c.downlink ? ` ${c.downlink}Mb/s` : '';
                    netEl.textContent = type + dl;
                } else {
                    netEl.textContent = navigator.onLine ? 'ONLINE' : 'OFFLINE';
                }
            }
            updateNet();
            window.addEventListener('online', updateNet);
            window.addEventListener('offline', updateNet);
            if (navigator.connection) {
                navigator.connection.addEventListener('change', updateNet);
            }
        }
    })();

    // --- Audio Feedback ---
    let audioEnabled = localStorage.getItem('audio') !== 'false';
    let audioCtx = null;

    function getCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    function playClick() {
        if (!audioEnabled) return;
        try {
            const ctx = getCtx();
            ctx.resume().then(() => {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.04);
            });
        } catch (e) { }
    }

    function playHover() {
        if (!audioEnabled) return;
        try {
            const ctx = getCtx();
            ctx.resume().then(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.frequency.value = 1200;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.08);
            });
        } catch (e) { }
    }

    const audioToggleBtn = document.getElementById('audio-toggle');
    function updateAudioIcon() {
        if (!audioToggleBtn) return;
        const icon = document.getElementById('audio-icon');
        if (icon) {
            icon.className = audioEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        }
        audioToggleBtn.classList.toggle('audio-on', audioEnabled);
    }

    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', () => {
            audioEnabled = !audioEnabled;
            localStorage.setItem('audio', audioEnabled);
            updateAudioIcon();
            if (audioEnabled) {
                setTimeout(playClick, 50);
            }
        });
    }

    // Connect sound elements dynamically to all hoverable elements, including new ones
    function bindAudioFeedback() {
        document.querySelectorAll('a, button, .discord-badge, .project-card, .tech-icon, .cert-card, .timeline-item, .topo-node').forEach(el => {
            // Remove existing to avoid double bindings
            el.removeEventListener('click', playClick);
            el.removeEventListener('mouseenter', playHover);

            el.addEventListener('click', playClick);
            el.addEventListener('mouseenter', playHover);
        });
    }

    // Initial binding
    bindAudioFeedback();

    // Bind after dynamic changes if any
    const observerAudio = new MutationObserver(bindAudioFeedback);
    observerAudio.observe(document.body, { childList: true, subtree: true });

    updateAudioIcon();

    // --- LoL Stats ---
    (async function fetchLoLStats() {
        const card = document.getElementById('lol-card');
        if (!card) return;

        const NAME = 'arby';
        const TAG = 'him';
        const REGION = 'eune';
        try {
            const [sumRes, rankRes] = await Promise.all([
                fetch(`https://api.henrikdev.xyz/lol/v2/summoner/${REGION}/${encodeURIComponent(NAME)}/${TAG}`),
                fetch(`https://api.henrikdev.xyz/lol/v2/ranked/${REGION}/${encodeURIComponent(NAME)}/${TAG}`)
            ]);
            if (!sumRes.ok || !rankRes.ok) throw new Error();
            const { data: sum } = await sumRes.json();
            const { data: ranks } = await rankRes.json();
            const solo = ranks?.find(r => r.queue_type === 'RANKED_SOLO_5x5') || null;
            const tier = solo?.tier || 'UNRANKED';
            const tierCap = tier[0] + tier.slice(1).toLowerCase();
            const winrate = solo ? Math.round(solo.wins / (solo.wins + solo.losses) * 100) : null;
            card.innerHTML = `
                <div class="lol-info">
                    <img class="lol-emblem" src="https://ddragon.leagueoflegends.com/cdn/img/ranked-emblems/Emblem_${tierCap}.webp" alt="${tierCap}" onerror="this.style.display='none'">
                    <div class="lol-details">
                        <div class="lol-name">${sum.name ?? NAME} <span class="lol-level">Lvl ${sum.account_level ?? sum.summoner_level}</span></div>
                        <div class="lol-rank">${solo ? `${tierCap} ${solo.rank} &mdash; ${solo.lp} LP` : 'Unranked'}</div>
                        ${winrate !== null ? `<div class="lol-winrate">${solo.wins}W / ${solo.losses}L &mdash; <span class="wr-${winrate >= 50 ? 'good' : 'bad'}">${winrate}% WR</span></div>` : ''}
                    </div>
                </div>`;
        } catch {
            card.innerHTML = `
                <div class="lol-info">
                    <img class="lol-emblem" src="https://ddragon.leagueoflegends.com/cdn/img/ranked-emblems/Emblem_Gold.webp" alt="LoL" onerror="this.style.display='none'">
                    <div class="lol-details">
                        <div class="lol-name">arby <span class="lol-server">#him</span></div>
                        <div class="lol-rank">Podívej se na u.gg pro aktuální stats</div>
                    </div>
                </div>`;
        }
    })();

    // ==========================================================================
    // TIMELINE FILTERS
    // ==========================================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (filterBtns.length > 0 && timelineItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filterVal = btn.getAttribute('data-filter');
                timelineItems.forEach(item => {
                    if (filterVal === 'all' || item.classList.contains(filterVal)) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

    // ==========================================================================
    // CONTACT FORM
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('form-name').value;
            const email = document.getElementById('form-email').value;
            const message = document.getElementById('form-message').value;
            
            const isCs = currentLang === 'cs';
            const alertMsg = isCs 
                ? 'Zpráva byla připravena! Otevírám poštovního klienta...' 
                : 'Message prepared! Opening email client...';
                
            showHUDNotification(alertMsg, 'success');
            
            setTimeout(() => {
                const subject = encodeURIComponent(`Kontakt z portfolia od ${name}`);
                const body = encodeURIComponent(`Jméno: ${name}\nE-mail: ${email}\n\nZpráva:\n${message}`);
                window.location.href = `mailto:mackuadam37@gmail.com?subject=${subject}&body=${body}`;
                contactForm.reset();
            }, 600);
        });
    }

    // ==========================================================================
    // THEME SELECTOR LOGIC
    // ==========================================================================
    const themeDots = document.querySelectorAll('.theme-dot');
    
    function applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        themeDots.forEach(dot => {
            dot.classList.toggle('active', dot.getAttribute('data-theme') === themeName);
        });
        localStorage.setItem('theme', themeName);
    }

    themeDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const selectedTheme = dot.getAttribute('data-theme');
            applyTheme(selectedTheme);
        });
    });

    // Initialize theme from storage
    const savedTheme = localStorage.getItem('theme') || 'green';
    applyTheme(savedTheme);

    // ==========================================================================
    // CISCO TOPOLOGY LAB LOGIC
    // ==========================================================================
    const topoNodes = document.querySelectorAll('.topo-node');
    const consoleBody = document.getElementById('console-body');
    const consoleHeaderTitle = document.getElementById('console-header-title');
    let consoleTimeout = null;

    function runSimulatedConsole(deviceKey) {
        if (!consoleBody) return;
        
        if (consoleTimeout) {
            clearTimeout(consoleTimeout);
        }
        consoleBody.innerHTML = '';
        
        const langData = i18n[currentLang];
        if (!langData || !langData.ciscoLab || !langData.ciscoLab.devices) return;
        
        const logs = langData.ciscoLab.devices[deviceKey];
        if (!logs) return;

        if (consoleHeaderTitle) {
            consoleHeaderTitle.textContent = deviceKey.toUpperCase() + '_CONSOLE';
        }

        let lineIndex = 0;
        function printNextLine() {
            if (lineIndex < logs.length) {
                const line = document.createElement('div');
                line.className = 'console-line';
                line.textContent = logs[lineIndex];
                
                if (logs[lineIndex].includes('#') || logs[lineIndex].includes(':$')) {
                    line.style.color = 'var(--accent-color)';
                    line.style.fontWeight = 'bold';
                } else {
                    line.style.color = 'var(--text-light)';
                }
                
                consoleBody.appendChild(line);
                consoleBody.scrollTop = consoleBody.scrollHeight;
                
                lineIndex++;
                consoleTimeout = setTimeout(printNextLine, 120);
            }
        }
        printNextLine();
    }

    topoNodes.forEach(node => {
        node.addEventListener('click', () => {
            topoNodes.forEach(n => n.classList.remove('active'));
            node.classList.add('active');
            const device = node.getAttribute('data-device');
            activeTopoNode = device;
            runSimulatedConsole(device);
        });
    });

    // ==========================================================================
    // CALCULATOR HUB
    // ==========================================================================
    // Tab switching
    const tabBtns = document.querySelectorAll('.calc-tab-btn');
    const calcViews = document.querySelectorAll('.calc-view');
    if (tabBtns.length > 0 && calcViews.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                calcViews.forEach(v => v.classList.remove('active'));
                
                btn.classList.add('active');
                const viewId = `view-${btn.getAttribute('data-tab')}`;
                const activeView = document.getElementById(viewId);
                if (activeView) activeView.classList.add('active');
            });
        });
    }

    // --- Subnet Calculator ---
    const ipInput = document.getElementById('subnet-ip');
    const cidrSlider = document.getElementById('subnet-cidr');
    const cidrDisplay = document.getElementById('cidr-val');
    
    function calculateSubnet() {
        if (!ipInput || !cidrSlider) return;
        const ipVal = ipInput.value.trim();
        const cidr = parseInt(cidrSlider.value, 10);
        
        if (cidrDisplay) cidrDisplay.textContent = `/${cidr}`;
        
        // Simple IPv4 Regex Validation
        const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipPattern.test(ipVal)) {
            document.querySelectorAll('.subnet-results .result-val').forEach(el => el.textContent = 'Invalid IP');
            const binIp = document.getElementById('bin-val-ip');
            const binMask = document.getElementById('bin-val-mask');
            if (binIp) binIp.textContent = 'Invalid IP Address';
            if (binMask) binMask.textContent = 'N/A';
            return;
        }
        
        const ipNum = ipVal.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
        const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
        const wildcardNum = ~maskNum >>> 0;
        
        const netNum = (ipNum & maskNum) >>> 0;
        const bcNum = (netNum | wildcardNum) >>> 0;
        
        let hosts = 0;
        let firstIp = 'N/A';
        let lastIp = 'N/A';
        
        if (cidr < 31) {
            hosts = (1 << (32 - cidr)) - 2;
            firstIp = numToIp(netNum + 1);
            lastIp = numToIp(bcNum - 1);
        } else if (cidr === 31) {
            hosts = 2;
            firstIp = numToIp(netNum);
            lastIp = numToIp(bcNum);
        } else { // 32
            hosts = 1;
            firstIp = numToIp(netNum);
            lastIp = numToIp(netNum);
        }
        
        // Display values
        document.getElementById('res-val-mask').textContent = numToIp(maskNum);
        document.getElementById('res-val-net').textContent = numToIp(netNum);
        document.getElementById('res-val-broadcast').textContent = numToIp(bcNum);
        document.getElementById('res-val-range').textContent = `${firstIp} - ${lastIp}`;
        document.getElementById('res-val-hosts').textContent = hosts.toLocaleString(currentLang === 'cs' ? 'cs-CZ' : 'en-US');
        document.getElementById('res-val-wildcard').textContent = numToIp(wildcardNum);
        
        // Binary visualization
        const binIpVal = numToBinStr(ipNum);
        const binMaskVal = numToBinStr(maskNum);
        
        const binIpEl = document.getElementById('bin-val-ip');
        const binMaskEl = document.getElementById('bin-val-mask');
        if (binIpEl) binIpEl.textContent = binIpVal;
        if (binMaskEl) binMaskEl.textContent = binMaskVal;
    }
    
    function numToIp(num) {
        return [
            (num >>> 24) & 255,
            (num >>> 16) & 255,
            (num >>> 8) & 255,
            num & 255
        ].join('.');
    }
    
    function numToBinStr(num) {
        const s = (num >>> 0).toString(2).padStart(32, '0');
        return [
            s.slice(0, 8),
            s.slice(8, 16),
            s.slice(16, 24),
            s.slice(24, 32)
        ].join('.');
    }
    
    if (ipInput && cidrSlider) {
        ipInput.addEventListener('input', calculateSubnet);
        cidrSlider.addEventListener('input', calculateSubnet);
        calculateSubnet(); // initial calculation
    }

    // --- Math Calculator ---
    const mathDisplay = document.getElementById('math-display');
    const mathHistory = document.getElementById('math-history');
    const mathKeypad = document.getElementById('math-keypad');
    const stdToggle = document.getElementById('math-mode-std');
    const sciToggle = document.getElementById('math-mode-sci');
    const basesPanel = document.getElementById('math-bases');
    
    let mathExpr = '';
    let mathDisplayExpr = '';
    let isSciMode = false;
    
    if (stdToggle && sciToggle) {
        stdToggle.addEventListener('click', () => {
            stdToggle.classList.add('active');
            sciToggle.classList.remove('active');
            isSciMode = false;
            document.querySelectorAll('.calc-key.scientific').forEach(el => el.classList.add('hidden'));
            if (basesPanel) basesPanel.classList.add('hidden');
        });
        
        sciToggle.addEventListener('click', () => {
            sciToggle.classList.add('active');
            stdToggle.classList.remove('active');
            isSciMode = true;
            document.querySelectorAll('.calc-key.scientific').forEach(el => el.classList.remove('hidden'));
            if (basesPanel) basesPanel.classList.remove('hidden');
            updateBases();
        });
    }
    
    if (mathKeypad) {
        mathKeypad.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-val');
                const action = btn.getAttribute('data-action');
                
                if (val !== null) {
                    if (mathDisplayExpr === '0' && val !== '.') {
                        mathDisplayExpr = val;
                        mathExpr = val;
                    } else {
                        mathDisplayExpr += val;
                        mathExpr += val;
                    }
                } else if (action !== null) {
                    handleMathAction(action);
                }
                
                updateMathScreen();
            });
        });
    }
    
    function handleMathAction(action) {
        switch (action) {
            case 'clear':
                mathExpr = '';
                mathDisplayExpr = '0';
                if (mathHistory) mathHistory.textContent = '';
                break;
            case 'backspace':
                if (mathDisplayExpr.length > 1) {
                    mathDisplayExpr = mathDisplayExpr.slice(0, -1);
                    if (mathExpr.endsWith('Math.sin(')) mathExpr = mathExpr.slice(0, -9);
                    else if (mathExpr.endsWith('Math.cos(')) mathExpr = mathExpr.slice(0, -9);
                    else if (mathExpr.endsWith('Math.tan(')) mathExpr = mathExpr.slice(0, -9);
                    else if (mathExpr.endsWith('Math.log10(')) mathExpr = mathExpr.slice(0, -11);
                    else if (mathExpr.endsWith('Math.log(')) mathExpr = mathExpr.slice(0, -9);
                    else if (mathExpr.endsWith('Math.sqrt(')) mathExpr = mathExpr.slice(0, -10);
                    else if (mathExpr.endsWith('Math.PI')) mathExpr = mathExpr.slice(0, -7);
                    else if (mathExpr.endsWith('Math.E')) mathExpr = mathExpr.slice(0, -6);
                    else mathExpr = mathExpr.slice(0, -1);
                } else {
                    mathDisplayExpr = '0';
                    mathExpr = '';
                }
                break;
            case 'divide':
                mathDisplayExpr += ' ÷ ';
                mathExpr += '/';
                break;
            case 'multiply':
                mathDisplayExpr += ' × ';
                mathExpr += '*';
                break;
            case 'subtract':
                mathDisplayExpr += ' - ';
                mathExpr += '-';
                break;
            case 'add':
                mathDisplayExpr += ' + ';
                mathExpr += '+';
                break;
            case 'sin':
                mathDisplayExpr += 'sin(';
                mathExpr += 'Math.sin(';
                break;
            case 'cos':
                mathDisplayExpr += 'cos(';
                mathExpr += 'Math.cos(';
                break;
            case 'tan':
                mathDisplayExpr += 'tan(';
                mathExpr += 'Math.tan(';
                break;
            case 'log':
                mathDisplayExpr += 'log(';
                mathExpr += 'Math.log10(';
                break;
            case 'ln':
                mathDisplayExpr += 'ln(';
                mathExpr += 'Math.log(';
                break;
            case 'sqrt':
                mathDisplayExpr += '√(';
                mathExpr += 'Math.sqrt(';
                break;
            case 'pow':
                mathDisplayExpr += '^';
                mathExpr += '**';
                break;
            case 'pi':
                mathDisplayExpr += 'π';
                mathExpr += 'Math.PI';
                break;
            case 'e':
                mathDisplayExpr += 'e';
                mathExpr += 'Math.E';
                break;
            case 'open-paren':
                mathDisplayExpr += '(';
                mathExpr += '(';
                break;
            case 'close-paren':
                mathDisplayExpr += ')';
                mathExpr += ')';
                break;
            case 'mod':
                mathDisplayExpr += ' mod ';
                mathExpr += '%';
                break;
            case 'equals':
                evaluateMath();
                break;
        }
    }
    
    function updateMathScreen() {
        if (mathDisplay) mathDisplay.textContent = mathDisplayExpr === '' ? '0' : mathDisplayExpr;
    }
    
    function evaluateMath() {
        if (mathExpr === '') return;
        try {
            const sanitizedCheck = mathExpr
                .replace(/Math\.(sin|cos|tan|log10|log|sqrt|PI|E)/g, '')
                .replace(/[0-9+\-*/().\s%]/g, '')
                .replace(/\*\*/g, '');
                
            if (sanitizedCheck.trim() !== '') {
                throw new Error('Invalid Expression');
            }
            
            const evalFn = new Function(`return (${mathExpr})`);
            const resVal = evalFn();
            
            if (resVal === undefined || isNaN(resVal) || !isFinite(resVal)) {
                throw new Error('Math Error');
            }
            
            const roundedRes = parseFloat(resVal.toFixed(8));
            
            if (mathHistory) mathHistory.textContent = mathDisplayExpr + ' =';
            mathDisplayExpr = String(roundedRes);
            mathExpr = String(roundedRes);
            
            if (isSciMode) updateBases();
        } catch (e) {
            if (mathHistory) mathHistory.textContent = mathDisplayExpr;
            mathDisplayExpr = 'Error';
            mathExpr = '';
            clearBases();
        }
    }
    
    function updateBases() {
        const decVal = parseFloat(mathExpr);
        const decEl = document.getElementById('base-dec');
        const hexEl = document.getElementById('base-hex');
        const binEl = document.getElementById('base-bin');
        
        if (!isNaN(decVal) && isFinite(decVal) && Number.isInteger(decVal)) {
            const intVal = decVal >>> 0;
            if (decEl) decEl.textContent = decVal.toString(10);
            if (hexEl) hexEl.textContent = '0x' + intVal.toString(16).toUpperCase();
            if (binEl) binEl.textContent = intVal.toString(2).match(/.{1,8}/g)?.join(' ') || intVal.toString(2);
        } else {
            clearBases();
        }
    }
    
    function clearBases() {
        const decEl = document.getElementById('base-dec');
        const hexEl = document.getElementById('base-hex');
        const binEl = document.getElementById('base-bin');
        if (decEl) decEl.textContent = 'N/A';
        if (hexEl) hexEl.textContent = 'N/A';
        if (binEl) binEl.textContent = 'N/A';
    }
});
