import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAudio } from '../../context/AudioContext';

const arbyDictionary = [
  'RGB', 'vodní chlazení', 'airflow', 'teplovodivá pasta', 'mechanická klávesnice',
  'overclocking', 'ping', 'lagy', 'Valorant', 'headshot', 'League of Legends',
  'Cisco router', 'switch', 'bottleneck', 'základní deska', 'FPS drop',
  'cable management', 'cybersecurity', 'server', 'grafická karta', 'monitor',
  'refresh rate', 'BIOS', 'síťařina', 'Nexus', 'CS:GO', 'harddisk', 'SSD',
  'custom loop', 'mechovka', 'cherry mx', 'DPI'
];

function generateArbyIpsum(paragraphs: number): string {
  let text = '';
  for (let i = 0; i < paragraphs; i++) {
    let pText = '';
    const sentenceCount = Math.floor(Math.random() * 4) + 4;
    for (let s = 0; s < sentenceCount; s++) {
      const wordCount = Math.floor(Math.random() * 6) + 5;
      const sentence: string[] = [];
      for (let w = 0; w < wordCount; w++) {
        let word = arbyDictionary[Math.floor(Math.random() * arbyDictionary.length)];
        if (Math.random() > 0.85) word = `<span class="highlight">${word}</span>`;
        sentence.push(word);
      }
      let sentenceStr = sentence.join(' ');
      const cleanStr = sentenceStr.replace(/<[^>]*>?/gm, '');
      const firstChar = cleanStr.charAt(0);
      sentenceStr = sentenceStr.replace(firstChar, firstChar.toUpperCase()) + '.';
      pText += sentenceStr + ' ';
    }
    text += `<p>${pText.trim()}</p>`;
  }
  return text;
}

export const IpsumView: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { t } = useLanguage();
  const { playClick } = useAudio();
  const [paragraphs, setParagraphs] = useState<number>(3);
  const [outputHtml, setOutputHtml] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = () => {
    setOutputHtml(generateArbyIpsum(Math.min(Math.max(paragraphs, 1), 20)));
    playClick();
  };

  const handleCopy = () => {
    if (!outputHtml) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = outputHtml;
    const plain = tempDiv.innerText;

    navigator.clipboard.writeText(plain).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    playClick();
  };

  return (
    <div id="ipsum-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <section className="container reveal active">
        <h3 className="reveal-stagger" style={{ '--stagger-delay': 1 } as React.CSSProperties}>
          {t.ipsum?.title || 'Arby Ipsum Generator'}
        </h3>
        <p className="section-desc reveal-stagger" style={{ '--stagger-delay': 2 } as React.CSSProperties}>
          {t.ipsum?.subtitle ||
            'Proč používat nudnou latinu, když si můžeš vygenerovat pravý "Nerd" výplňový text plný RGB a síťařiny?'}
        </p>

        <div className="ipsum-controls reveal-stagger" style={{ '--stagger-delay': 3 } as React.CSSProperties}>
          <div className="ipsum-input-group">
            <label htmlFor="ipsum-paragraphs">{t.ipsum?.label || 'Počet odstavců:'}</label>
            <input
              type="number"
              id="ipsum-paragraphs"
              min={1}
              max={10}
              value={paragraphs}
              onChange={(e) => setParagraphs(parseInt(e.target.value, 10) || 1)}
            />
          </div>
          <button className="btn" id="btn-generate-ipsum" onClick={handleGenerate}>
            <i className="fa-solid fa-bolt" /> {t.ipsum?.btnGen || 'Generovat Arby Ipsum'}
          </button>
          <button className="btn btn-cv" id="btn-copy-ipsum" onClick={handleCopy}>
            <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'} />{' '}
            {copied ? 'Zkopírováno!' : t.ipsum?.btnCopy || 'Kopírovat'}
          </button>
        </div>

        <div className="ipsum-output-box reveal-stagger" style={{ '--stagger-delay': 4 } as React.CSSProperties}>
          <div
            id="ipsum-output"
            className="ipsum-text"
            dangerouslySetInnerHTML={{
              __html:
                outputHtml ||
                t.ipsum?.placeholder ||
                'Klikni na tlačítko "Generovat" pro vytvoření textu...',
            }}
          />
        </div>
      </section>
    </div>
  );
};
