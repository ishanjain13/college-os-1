// COLLEGE OS - Theme & Accent Color Manager

import store from './state.js';

export const THEMES = [
  { id: 'dark', label: 'Dark Charcoal' },
  { id: 'light', label: 'Clean Light' },
  { id: 'cyber', label: 'Cyberpunk Neon' },
  { id: 'lofi', label: 'Warm Lo-Fi' },
  { id: 'anime', label: 'Neon Blossom' },
  { id: 'amoled', label: 'Pure AMOLED' },
  { id: 'study', label: 'Emerald Study' },
  { id: 'minimalist', label: 'Minimalist Slate' }
];

export const ACCENTS = [
  { id: 'indigo', label: 'Indigo', color: '#6366f1' },
  { id: 'violet', label: 'Violet', color: '#8b5cf6' },
  { id: 'cyan', label: 'Cyan Ocean', color: '#06b6d4' },
  { id: 'emerald', label: 'Emerald Mint', color: '#10b981' },
  { id: 'rose', label: 'Rose Pink', color: '#f43f5e' },
  { id: 'amber', label: 'Warm Amber', color: '#f59e0b' }
];

export function initTheme() {
  const state = store.get();
  const theme = state.appearance.theme || 'dark';
  const accent = state.appearance.accentColor || 'indigo';

  applyTheme(theme);
  applyAccent(accent);

  // Watch for prefers-color-scheme if user hasn't explicitly set theme
  if (!localStorage.getItem('COLLEGE_OS_THEME_EXPLICIT')) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    mediaQuery.addEventListener('change', (e) => {
      applyTheme(e.matches ? 'light' : 'dark');
    });
  }
}

export function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  if (themeName === 'light') {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }
  store.updateAppearance({ theme: themeName });
  localStorage.setItem('COLLEGE_OS_THEME_EXPLICIT', 'true');
}

export function applyAccent(accentName) {
  document.documentElement.setAttribute('data-accent', accentName);
  store.updateAppearance({ accentColor: accentName });
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
}
