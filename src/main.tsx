import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted variable fonts: no third-party requests, only the Latin subsets load.
import '@fontsource-variable/fraunces/soft.css';
import '@fontsource-variable/fraunces/soft-italic.css';
import '@fontsource-variable/manrope/wght.css';
import './styles/globals.css';
import { valentineConfig } from './config/valentine';
import { App } from './App';

const THEME_VARIABLES: Record<keyof typeof valentineConfig.theme, string> = {
  midnightPlum: '--plum',
  burgundy: '--burgundy',
  crimson: '--crimson',
  bubblegum: '--pink',
  blush: '--blush',
  ivory: '--ivory',
  lavender: '--lavender',
  gold: '--gold',
};

for (const [key, variable] of Object.entries(THEME_VARIABLES)) {
  const value = valentineConfig.theme[key as keyof typeof valentineConfig.theme];
  if (value) document.documentElement.style.setProperty(variable, value);
}
document.title = valentineConfig.pageTitle;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
