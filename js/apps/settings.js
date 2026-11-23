// COLLEGE OS - App: Settings, Themes, Audio & Data Backup/Restore

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import { THEMES, ACCENTS, applyTheme, applyAccent } from '../theme.js';
import soundService from '../sound.js';

export const settingsApp = {
  id: 'settings',
  title: 'Settings & Themes',
  icon: 'settings',
  activeTab: 'appearance',

  render() {
    const state = store.get();
    const currentTab = this.activeTab;
    const appearance = state.appearance;

    const wallpapers = [
      { id: 'aurora', label: 'Aurora Glow' },
      { id: 'cyber_grid', label: 'Cyber Grid' },
      { id: 'lofi_room', label: 'Lo-Fi Ambient' },
      { id: 'deep_space', label: 'Deep Space' },
      { id: 'matrix', label: 'Matrix Code' },
      { id: 'minimal_gradient', label: 'Minimal Slate' }
    ];

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Settings &amp; Personalization</h2>
            <p>Themes, appearance tokens, system audio, and cloud backup management.</p>
          </div>
          <div class="tab-list">
            <button class="tab-btn ${currentTab === 'appearance' ? 'active' : ''}" data-settings-tab="appearance">
              ${getIcon('palette', 'w-3.5 h-3.5')} Appearance
            </button>
            <button class="tab-btn ${currentTab === 'profile' ? 'active' : ''}" data-settings-tab="profile">
              ${getIcon('users', 'w-3.5 h-3.5')} Profile
            </button>
            <button class="tab-btn ${currentTab === 'sound' ? 'active' : ''}" data-settings-tab="sound">
              ${getIcon('volume-2', 'w-3.5 h-3.5')} Audio
            </button>
            <button class="tab-btn ${currentTab === 'data' ? 'active' : ''}" data-settings-tab="data">
              ${getIcon('download', 'w-3.5 h-3.5')} Backup &amp; Data
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="app-body">
          ${currentTab === 'appearance' ? `
            <div style="display: flex; flex-direction: column; gap: var(--space-5);">
              <!-- Themes -->
              <div class="card">
                <div class="card-header">
                  <span class="card-title">Color Themes</span>
                </div>
                <div class="theme-picker-grid">
                  ${THEMES.map(t => `
                    <div class="theme-pill-card ${appearance.theme === t.id ? 'selected' : ''}" data-select-theme="${t.id}">
                      <span style="font-weight: 700; font-size: 0.8125rem;">${t.label}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Accent Colors -->
              <div class="card">
                <div class="card-header">
                  <span class="card-title">Material 3 Accent Colors</span>
                </div>
                <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
                  ${ACCENTS.map(acc => `
                    <button class="btn btn-secondary btn-sm" data-select-accent="${acc.id}" style="display: flex; align-items: center; gap: var(--space-2); border-color: ${appearance.accentColor === acc.id ? acc.color : 'var(--os-border)'};">
                      <span style="width: 14px; height: 14px; border-radius: var(--radius-full); background: ${acc.color};"></span>
                      <span>${acc.label}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Wallpaper -->
              <div class="card">
                <div class="card-header">
                  <span class="card-title">Wallpaper Preset</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--space-2);">
                  ${wallpapers.map(w => `
                    <button class="btn ${appearance.wallpaper === w.id ? 'btn-primary' : 'btn-secondary'} btn-sm" data-select-wp="${w.id}">
                      ${w.label}
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : currentTab === 'profile' ? `
            <div class="card" style="max-width: 540px;">
              <div class="card-header">
                <span class="card-title">Student Profile</span>
              </div>
              <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" id="prof-name" class="form-input" value="${escapeHtml(state.profile.name)}" />
              </div>
              <div class="form-group">
                <label class="form-label">College / University</label>
                <input type="text" id="prof-college" class="form-input" value="${escapeHtml(state.profile.college)}" />
              </div>
              <div class="form-group">
                <label class="form-label">Degree Course</label>
                <input type="text" id="prof-course" class="form-input" value="${escapeHtml(state.profile.course)}" />
              </div>
              <button class="btn btn-primary btn-sm" id="btn-save-profile" style="margin-top: var(--space-3);">
                Save Changes
              </button>
            </div>
          ` : currentTab === 'sound' ? `
            <div class="card" style="max-width: 540px;">
              <div class="card-header">
                <span class="card-title">Audio Synthesizer Settings</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3) 0; border-bottom: 1px solid var(--os-border);">
                <div>
                  <div style="font-weight: 700; font-size: 0.8125rem;">Sound Effects</div>
                  <div style="font-size: 0.6875rem; color: var(--os-text-muted);">UI clicks, level up fanfares, achievements</div>
                </div>
                <button class="btn ${state.profile.soundEnabled ? 'btn-primary' : 'btn-secondary'} btn-xs" id="btn-toggle-sound">
                  ${state.profile.soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>
            </div>
          ` : `
            <!-- Data & Backup -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 580px;">
              <div class="card">
                <div class="card-header">
                  <span class="card-title">Data Backup (JSON Export / Import)</span>
                </div>
                <p style="font-size: 0.8125rem; color: var(--os-text-muted); margin-bottom: var(--space-4);">
                  Export a portable JSON backup file of all 18 applications, habits, assignments, and notes to store locally or restore anytime.
                </p>
                <div style="display: flex; gap: var(--space-3);">
                  <button class="btn btn-primary btn-sm" id="btn-export-backup">
                    ${getIcon('download', 'w-3.5 h-3.5')} Export Backup (JSON)
                  </button>
                  <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                    ${getIcon('upload', 'w-3.5 h-3.5')} Import Backup
                    <input type="file" id="input-import-backup" accept=".json" style="display: none;" />
                  </label>
                </div>
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  },

  init(container) {
    // Tab switching
    container.querySelectorAll('[data-settings-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        this.activeTab = btn.getAttribute('data-settings-tab');
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Theme selector
    container.querySelectorAll('[data-select-theme]').forEach(pill => {
      pill.addEventListener('click', () => {
        soundService.playClick();
        const theme = pill.getAttribute('data-select-theme');
        applyTheme(theme);
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Accent selector
    container.querySelectorAll('[data-select-accent]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        const acc = btn.getAttribute('data-select-accent');
        applyAccent(acc);
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Wallpaper selector
    container.querySelectorAll('[data-select-wp]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        const wp = btn.getAttribute('data-select-wp');
        store.updateAppearance({ wallpaper: wp });
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Save profile
    const saveProfBtn = container.querySelector('#btn-save-profile');
    saveProfBtn?.addEventListener('click', () => {
      const name = container.querySelector('#prof-name')?.value;
      const college = container.querySelector('#prof-college')?.value;
      const course = container.querySelector('#prof-course')?.value;
      store.updateProfile({ name, college, course });
      soundService.playComplete();
      alert("Profile updated successfully!");
    });

    // Toggle sound
    const soundBtn = container.querySelector('#btn-toggle-sound');
    soundBtn?.addEventListener('click', () => {
      const current = store.get().profile.soundEnabled;
      store.updateProfile({ soundEnabled: !current });
      soundService.setEnabled(!current);
      container.innerHTML = this.render();
      this.init(container);
    });

    // Export backup
    const exportBtn = container.querySelector('#btn-export-backup');
    exportBtn?.addEventListener('click', () => {
      soundService.playClick();
      store.exportBackup();
    });

    // Import backup
    const importInput = container.querySelector('#input-import-backup');
    importInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (content && typeof content === 'string') {
          const success = store.importBackup(content);
          if (success) {
            const newState = store.get();
            if (newState.appearance?.theme) applyTheme(newState.appearance.theme);
            if (newState.appearance?.accentColor) applyAccent(newState.appearance.accentColor);
            soundService.playLevelUp();
            alert("✓ Backup successfully restored! All 18 apps synced.");
            window.location.reload();
          } else {
            alert("Failed to restore backup: Invalid file format.");
          }
        }
      };
      reader.readAsText(file);
    });
  },

  destroy() {}
};

export default settingsApp;
