import { Language } from '../types';
import { i18n } from '../data/translations';

export function generateCV(lang: Language, onError?: (msg: string) => void) {
  const cvWindow = window.open('', '_blank');
  if (!cvWindow) {
    if (onError) {
      onError((i18n[lang] as unknown as { hud?: { cvBlocked?: string } })?.hud?.cvBlocked || 'Popup blocked');
    }
    return;
  }

  const isCs = lang === 'cs';
  const title = isCs ? 'Životopis - Adam Macků' : 'Resume - Adam Macků';

  const data = {
    name: 'Adam Macků',
    role: isCs ? 'Aplikační specialista - Junior (Vývoj webových aplikací)' : 'Application Specialist - Junior (Web Development)',
    email: 'mackuadam37@gmail.com',
    phone: '+420 776 739 054',
    location: isCs ? 'Liberec, Česká republika' : 'Liberec, Czech Republic',
    github: 'github.com/gitArby',

    profileTitle: isCs ? 'Osobní profil' : 'Professional Profile',
    profileText: isCs
      ? 'Absolvent oboru Informační technologie v současné době působící jako Aplikační specialista - Junior ve společnosti VALBEK-EU, a.s., kde se věnuji vývoji webových aplikací. Mám silné technické zázemí a hluboký zájem o moderní webové technologie, vývoj aplikací, hardware i síťovou infrastrukturu. Jsem proaktivní, flexibilní a rychle se učím novým systémům i technologiím. Mám zkušenosti s týmovou spoluprací a tvorbou funkčních webových řešení.'
      : 'IT graduate currently working as an Application Specialist - Junior at VALBEK-EU, a.s., focusing on web application development. Possessing a solid technical foundation with a strong focus on modern web technologies, application development, hardware, and networking. Proactive, highly flexible, fast at adopting new systems, and experienced in teamwork and delivering practical web solutions.',

    experienceTitle: isCs ? 'Pracovní zkušenosti & praxe' : 'Work Experience',
    exp0Title: 'VALBEK-EU, a.s.',
    exp0Date: isCs ? '2026 – současnost' : '2026 – Present',
    exp0Role: isCs ? 'Aplikační specialista - Junior (Vývoj webových aplikací)' : 'Application Specialist - Junior (Web Development)',
    exp0Desc: isCs
      ? 'Vývoj a správa webových aplikací, implementace nových funkcionalit, práce s moderními webovými technologiemi, řešení technických požadavků a optimalizace aplikací.'
      : 'Development and maintenance of web applications, implementation of new features, working with modern web technologies, technical requirements, and application optimization.',

    exp1Title: 'IT servis Turnov',
    exp1Date: isCs ? 'Odborná stáž (2 týdny)' : 'Internship (2 weeks)',
    exp1Role: isCs ? 'Servisní technik' : 'Service Technician',
    exp1Desc: isCs
      ? 'Diagnostika a opravy hardwaru, instalace a konfigurace OS a softwaru, údržba IT techniky.'
      : 'Hardware diagnostics and repair, OS and software installation, IT equipment maintenance.',

    exp2Title: isCs ? 'Spolupráce na webových projektech (u Tomáše Hubičky)' : 'Web Projects (with Tomáš Hubička)',
    exp2Date: isCs ? 'Odborná stáž (2 týdny)' : 'Internship (2 weeks)',
    exp2Role: isCs ? 'Webový vývojář' : 'Web Developer',
    exp2Desc: isCs
      ? 'Tvorba a správa webových stránek, práce s kódem (HTML, CSS, JS) v rámci reálných projektů.'
      : 'Website development and maintenance, hands-on code work on commercial projects.',

    educationTitle: isCs ? 'Vzdělání' : 'Education',
    schoolName: 'Střední průmyslová škola a Střední odborná škola, Varnsdorf',
    schoolField: isCs
      ? 'Informační technologie (2022–2026)'
      : 'Information Technology (2022–2026)',
    schoolDesc: isCs
      ? 'Středoškolské vzdělání zakončené maturitní zkouškou. Zaměření na správu systémů, základy programování, síťové technologie a hardware.'
      : 'Secondary education with Maturita exam. Focused on system administration, programming basics, networking, and computer hardware.',

    skillsTitle: isCs ? 'Dovednosti' : 'Technical Skills',
    skillsWebTitle: isCs ? 'Vývoj & Web' : 'Development & Web',
    skillsWebList: [
      'Python',
      'HTML / CSS / SASS',
      'JavaScript / TypeScript',
      'React',
      'Django',
      'SQL',
      isCs ? 'OOP & Návrhové vzory' : 'OOP & Patterns',
      'Git / GitHub',
      isCs ? 'AI nástroje (Claude, Gemini)' : 'AI tools (Claude, Gemini)',
    ],
    skillsNetTitle: isCs ? 'Sítě & Systémy' : 'Networks & Systems',
    skillsNetList: ['Cisco CCNA 1 & 2', 'TCP/IP & DNS', 'Packet Tracer', isCs ? 'Správa OS' : 'OS Admin', isCs ? 'Diagnostika HW' : 'HW Diagnostics', isCs ? 'IT podpora' : 'IT Support'],

    certsTitle: isCs ? 'Certifikace' : 'Certifications',
    certsList: [
      {
        name: 'CCNA 1: Introduction to Networks',
        issuer: 'Cisco Networking Academy',
        desc: isCs
          ? 'Základy počítačových sítí, IP adresace (IPv4/IPv6), síťové protokoly, Ethernet a konfigurace prvků.'
          : 'Network fundamentals, IPv4/IPv6 addressing, protocols, Ethernet, and basic device configuration.',
      },
      {
        name: 'CCNA 2: Switching, Routing, and Wireless Essentials',
        issuer: 'Cisco Networking Academy',
        desc: isCs
          ? 'Směrovací protokoly (OSPF), konfigurace VLAN, redundantní sítě (STP/EtherChannel) a bezpečnost.'
          : 'Routing protocols (OSPF), VLANs, redundant networks (STP/EtherChannel), and network security.',
      },
      {
        name: isCs ? 'Certifikáty programovacích jazyků' : 'Programming Languages Certificates',
        issuer: 'SoloLearn',
        desc: isCs
          ? 'Absolvované kurzy a certifikáty pro programovací jazyky.'
          : 'Completed courses and certificates across programming technologies.',
      },
    ],

    langTitle: isCs ? 'Jazyky' : 'Languages',
    langCs: isCs ? 'Čeština: Rodilý mluvčí' : 'Czech: Native speaker',
    langEn: isCs ? 'Angličtina: Úroveň B2 - C1' : 'English: B2 - C1 level',

    printNote: isCs
      ? 'Generováno z online portfolia arbyy.tech • Adam Macků'
      : 'Generated from arbyy.tech portfolio • Adam Macků',
  };

  const htmlContent = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            box-sizing: border-box;
        }
        @page {
            size: A4 portrait;
            margin: 6mm 10mm 6mm 10mm;
        }
        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif;
            color: #1a202c;
            margin: 0;
            padding: 0;
            line-height: 1.35;
            background: #f0f2f5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .cv-top-bar {
            background: #1a202c;
            color: white;
            padding: 10px 24px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 12px;
            position: sticky;
            top: 0;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .cv-btn {
            font-family: inherit;
            font-size: 0.85rem;
            font-weight: 600;
            padding: 7px 16px;
            border-radius: 6px;
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
            background: #0096c7;
        }
        .cv-btn-close {
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .cv-btn-close:hover {
            background: rgba(255,255,255,0.2);
        }

        .cv-page-container {
            padding: 20px 0;
            display: flex;
            justify-content: center;
        }

        /* Strict A4 Container Dimensions */
        .cv-page {
            width: 210mm;
            min-height: 297mm;
            max-height: 297mm;
            height: 297mm;
            background: #fff;
            margin: 0 auto;
            padding: 12mm 14mm 10mm 14mm;
            box-sizing: border-box;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            page-break-inside: avoid;
            page-break-after: avoid;
        }

        .header {
            border-bottom: 2.5px solid #00b4d8;
            padding-bottom: 0.5rem;
            margin-bottom: 0.7rem;
        }
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }
        .name {
            font-size: 1.85rem;
            font-weight: 800;
            color: #0b132b;
            margin: 0;
            letter-spacing: -0.5px;
            line-height: 1.1;
        }
        .role {
            font-size: 0.95rem;
            font-weight: 700;
            color: #00b4d8;
            margin: 0.15rem 0 0.4rem 0;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        .contact-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 1.2rem;
            font-size: 0.78rem;
            color: #4a5568;
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }
        .contact-item i {
            color: #00b4d8;
            font-size: 0.85rem;
        }
        .contact-item a {
            color: inherit;
            text-decoration: none;
        }

        .content-grid {
            display: grid;
            grid-template-columns: 1.55fr 1fr;
            gap: 1.5rem;
            flex-grow: 1;
        }
        .column-left, .column-right {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .section-title {
            font-size: 0.85rem;
            font-weight: 800;
            color: #0b132b;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 0.2rem;
            margin-top: 0;
            margin-bottom: 0.4rem;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }

        .profile-text {
            font-size: 0.77rem;
            color: #2d3748;
            margin: 0;
            text-align: justify;
            line-height: 1.35;
        }

        .timeline-item {
            margin-bottom: 0.45rem;
            position: relative;
        }
        .timeline-item:last-child {
            margin-bottom: 0;
        }
        .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.1rem;
        }
        .timeline-title {
            font-size: 0.82rem;
            font-weight: 700;
            color: #0b132b;
            margin: 0;
        }
        .timeline-date {
            font-size: 0.72rem;
            font-weight: 700;
            color: #00b4d8;
            white-space: nowrap;
        }
        .timeline-subtitle {
            font-size: 0.75rem;
            color: #4a5568;
            font-weight: 600;
            margin: 0 0 0.15rem 0;
        }
        .timeline-desc {
            font-size: 0.74rem;
            color: #4a5568;
            margin: 0;
            line-height: 1.3;
            text-align: justify;
        }

        .skills-group {
            margin-bottom: 0.45rem;
        }
        .skills-group:last-child {
            margin-bottom: 0;
        }
        .skills-group-title {
            font-size: 0.75rem;
            font-weight: 700;
            color: #4a5568;
            margin-top: 0;
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        .skill-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem;
        }
        .skill-badge {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            padding: 0.15rem 0.4rem;
            border-radius: 4px;
            font-size: 0.7rem;
            color: #2d3748;
            font-weight: 600;
        }

        .cert-item {
            margin-bottom: 0.4rem;
            border-left: 2.5px solid #00b4d8;
            padding-left: 0.45rem;
        }
        .cert-item:last-child {
            margin-bottom: 0;
        }
        .cert-issuer {
            font-size: 0.65rem;
            font-weight: 700;
            color: #00b4d8;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            display: block;
        }
        .cert-name {
            font-size: 0.78rem;
            font-weight: 700;
            color: #0b132b;
            margin: 0.05rem 0;
        }
        .cert-desc {
            font-size: 0.7rem;
            color: #4a5568;
            margin: 0;
            line-height: 1.25;
        }

        .lang-list {
            list-style: none;
            padding: 0;
            margin: 0;
            font-size: 0.74rem;
            color: #2d3748;
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
        }
        .lang-list li {
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }
        .lang-list i {
            color: #00b4d8;
            font-size: 0.75rem;
        }

        .footer-note {
            margin-top: 0.4rem;
            border-top: 1px dashed #cbd5e0;
            padding-top: 0.3rem;
            font-size: 0.65rem;
            color: #a0aec0;
            text-align: center;
        }

        /* GUARANTEE EXACT 1 PAGE IN PRINT */
        @media print {
            @page {
                size: A4 portrait;
                margin: 0;
            }
            html, body {
                width: 210mm !important;
                height: 297mm !important;
                max-height: 297mm !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                background: #fff !important;
            }
            .cv-top-bar {
                display: none !important;
            }
            .cv-page-container {
                padding: 0 !important;
                margin: 0 !important;
                display: block !important;
                width: 210mm !important;
                height: 297mm !important;
            }
            .cv-page {
                width: 210mm !important;
                height: 297mm !important;
                max-height: 297mm !important;
                min-height: 297mm !important;
                padding: 10mm 12mm 8mm 12mm !important;
                margin: 0 !important;
                box-sizing: border-box !important;
                box-shadow: none !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
                break-inside: avoid !important;
                break-after: avoid !important;
                overflow: hidden !important;
            }
        }
    </style>
</head>
<body>
    <div class="cv-top-bar">
        <button onclick="window.print()" class="cv-btn cv-btn-print">
            <i class="fa-solid fa-download"></i> ${isCs ? 'Stáhnout / Tisk (1x A4)' : 'Download / Print (1x A4)'}
        </button>
        <button onclick="window.close()" class="cv-btn cv-btn-close">
            <i class="fa-solid fa-xmark"></i> ${isCs ? 'Zavřít' : 'Close'}
        </button>
    </div>

    <div class="cv-page-container">
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
                        <i class="fa-solid fa-phone"></i>
                        <a href="tel:${data.phone.replace(/\s+/g, '')}">${data.phone}</a>
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
                        
                        <!-- 1. VALBEK-EU, a.s. -->
                        <div class="timeline-item">
                            <div class="timeline-header">
                                <h3 class="timeline-title">${data.exp0Title}</h3>
                                <span class="timeline-date">${data.exp0Date}</span>
                            </div>
                            <div class="timeline-subtitle">${data.exp0Role}</div>
                            <p class="timeline-desc">${data.exp0Desc}</p>
                        </div>

                        <!-- 2. IT servis Turnov -->
                        <div class="timeline-item">
                            <div class="timeline-header">
                                <h3 class="timeline-title">${data.exp1Title}</h3>
                                <span class="timeline-date">${data.exp1Date}</span>
                            </div>
                            <div class="timeline-subtitle">${data.exp1Role}</div>
                            <p class="timeline-desc">${data.exp1Desc}</p>
                        </div>

                        <!-- 3. Tomáš Hubička -->
                        <div class="timeline-item">
                            <div class="timeline-header">
                                <h3 class="timeline-title">${data.exp2Title}</h3>
                                <span class="timeline-date">${data.exp2Date}</span>
                            </div>
                            <div class="timeline-subtitle">${data.exp2Role}</div>
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
                                ${data.skillsWebList.map((s) => `<span class="skill-badge">${s}</span>`).join('')}
                            </div>
                        </div>

                        <div class="skills-group">
                            <h3 class="skills-group-title">${data.skillsNetTitle}</h3>
                            <div class="skill-badges">
                                ${data.skillsNetList.map((s) => `<span class="skill-badge">${s}</span>`).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2 class="section-title">${data.certsTitle}</h2>
                        ${data.certsList
                          .map(
                            (c) => `
                            <div class="cert-item">
                                <span class="cert-issuer">${c.issuer}</span>
                                <h3 class="cert-name">${c.name}</h3>
                                <p class="cert-desc">${c.desc}</p>
                            </div>
                        `
                          )
                          .join('')}
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
    </div>
</body>
</html>
  `;

  cvWindow.document.open();
  cvWindow.document.write(htmlContent);
  cvWindow.document.close();
}
