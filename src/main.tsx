import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AudioProvider } from './context/AudioContext';
import { NotificationProvider } from './context/NotificationContext';
import { EasterEggProvider } from './context/EasterEggContext';
import '../style.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <AudioProvider>
          <NotificationProvider>
            <EasterEggProvider>
              <App />
            </EasterEggProvider>
          </NotificationProvider>
        </AudioProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
);
