import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { useEasterEgg } from '../../context/EasterEggContext';
import { useAudio } from '../../context/AudioContext';

export const ContactView: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { lang, t } = useLanguage();
  const { showHUDNotification } = useNotification();
  const { discoverEgg } = useEasterEgg();
  const { playClick } = useAudio();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCs = lang === 'cs';
    const alertMsg = isCs
      ? 'Zpráva byla připravena! Otevírám poštovního klienta...'
      : 'Message prepared! Opening email client...';

    showHUDNotification(alertMsg, 'success');

    setTimeout(() => {
      const subject = encodeURIComponent(`Kontakt z portfolia od ${name}`);
      const body = encodeURIComponent(`Jméno: ${name}\nE-mail: ${email}\n\nZpráva:\n${message}`);
      window.location.href = `mailto:mackuadam37@gmail.com?subject=${subject}&body=${body}`;
      setName('');
      setEmail('');
      setMessage('');
    }, 600);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('mackuadam37@gmail.com').then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
    playClick();
  };

  return (
    <div id="contact-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <section id="contact" className="container reveal active">
        <h3 className="reveal-stagger" style={{ '--stagger-delay': 1 } as React.CSSProperties}>
          {t.contact?.title || 'Kontakt'}
        </h3>
        <p className="contact-text reveal-stagger" style={{ '--stagger-delay': 2 } as React.CSSProperties}>
          {t.contact?.text || 'Máš zájem o spolupráci, nebo si chceš jen zahrát? Napiš mi!'}
        </p>

        <form
          id="contact-form"
          className="contact-form reveal-stagger"
          style={{ '--stagger-delay': 3 } as React.CSSProperties}
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <input
              type="text"
              id="form-name"
              required
              placeholder="Jméno / Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              id="form-email"
              required
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <textarea
              id="form-message"
              required
              placeholder="Zpráva / Message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-submit" id="btn-submit-form">
            {lang === 'cs' ? 'Odeslat zprávu' : 'Send Message'}
          </button>
        </form>

        <div className="contact-email reveal-stagger" style={{ '--stagger-delay': 4 } as React.CSSProperties}>
          <a href="mailto:mackuadam37@gmail.com" className="btn btn-copy-email">
            mackuadam37@gmail.com
          </a>
          <button
            className="btn-copy"
            id="copy-email"
            title="Zkopírovat"
            aria-label="Zkopírovat e-mail"
            onClick={handleCopyEmail}
          >
            <i className="fa-regular fa-copy" />
          </button>
        </div>

        <div
          className="contact-email reveal-stagger"
          style={{ '--stagger-delay': 4.5, marginTop: '1.5rem' } as React.CSSProperties}
        >
          <a href="tel:+420776739054" className="btn btn-copy-email">
            +420 776 739 054
          </a>
        </div>

        <div
          className="contact-discord reveal-stagger"
          style={{
            '--stagger-delay': 5,
            marginTop: '1.5rem',
            textAlign: 'center',
          } as React.CSSProperties}
        >
          <a
            href="https://discord.gg/6GJwv87JyX"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              backgroundColor: '#5865F2',
              borderColor: '#5865F2',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <i className="fa-brands fa-discord" style={{ fontSize: '1.2rem' }} /> Můj Discord Server: Arbyho Podsvětí
          </a>
        </div>

        <span className={`copy-toast ${showToast ? 'visible' : ''}`} id="copy-toast">
          {lang === 'cs' ? 'Zkopírováno!' : 'Copied!'}
        </span>
      </section>

      <footer>
        <div className="footer-links">
          <a href="https://github.com/gitArby" target="_blank" rel="noopener noreferrer" title="GitHub">
            <i className="fa-brands fa-github" />
          </a>
          <a
            href="https://www.instagram.com/adam.macku"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
          >
            <i className="fa-brands fa-instagram" />
          </a>
          <a
            href="https://steamcommunity.com/id/TadyArby"
            target="_blank"
            rel="noopener noreferrer"
            title="Steam"
          >
            <i className="fa-brands fa-steam" />
          </a>
          <a
            href="https://www.tiktok.com/@arbycek"
            target="_blank"
            rel="noopener noreferrer"
            title="TikTok"
          >
            <i className="fa-brands fa-tiktok" />
          </a>
          <a
            href="https://discord.com/users/938119246196666378"
            target="_blank"
            rel="noopener noreferrer"
            title="Discord"
          >
            <i className="fa-brands fa-discord" />
          </a>
          <a href="mailto:mackuadam37@gmail.com" title="E-mail">
            <i className="fa-solid fa-envelope" />
          </a>
        </div>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} arbyy.tech &mdash; made with{' '}
          <span className="footer-heart">&#10084;</span>, caffeine &{' '}
          <span
            id="egg-tatranka"
            title="Energie sbalená na cesty"
            onMouseEnter={() => discoverEgg('tatranka')}
            onClick={() => discoverEgg('tatranka')}
            style={{ cursor: 'pointer' }}
          >
            tatranka.zip
          </span>
        </p>
      </footer>
    </div>
  );
};
