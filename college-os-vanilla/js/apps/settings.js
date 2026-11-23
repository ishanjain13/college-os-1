// COLLEGE OS - App: Settings, Themes, Audio & Data Backup/Restore

import store, { STORAGE_KEY } from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import { THEMES, ACCENTS, applyTheme, applyAccent } from '../theme.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

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

    // Compute storage metrics
    let storageSizeKb = '0.0';
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || '';
      storageSizeKb = (new Blob([raw]).size / 1024).toFixed(1);
    } catch (e) {}

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
            <button class="tab-btn ${currentTab === 'ai' ? 'active' : ''}" data-settings-tab="ai">
              ${getIcon('bot', 'w-3.5 h-3.5')} AI Copilot
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
                <input type="text" id="prof-course" class="form-input" value="${escapeHtml(state.profile.course || '')}" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Academic Year</label>
                  <input type="text" id="prof-year" class="form-input" value="${escapeHtml(state.profile.year || 'Sophomore (Year 2)')}" />
                </div>
                <div class="form-group">
                  <label class="form-label">Min. Attendance Goal (%)</label>
                  <input type="number" id="prof-attendance-thresh" class="form-input" min="50" max="100" value="${state.profile.attendanceThreshold || 75}" />
                </div>
              </div>
              <div style="display: flex; gap: var(--space-2); margin-top: var(--space-4);">
                <button class="btn btn-primary btn-sm" id="btn-save-profile">
                  Save Changes
                </button>
                <button class="btn btn-secondary btn-sm" id="btn-relaunch-onboarding">
                  Run Setup Wizard ↻
                </button>
              </div>
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
          ` : currentTab === 'ai' ? `
            <div class="card" style="max-width: 580px;">
              <div class="card-header">
                <span class="card-title">Google Gemini AI Integration</span>
                <span class="badge ${state.aiSettings?.apiKey ? 'badge-success' : 'badge-secondary'}">
                  ${state.aiSettings?.apiKey ? 'Configured' : 'Offline / Local'}
                </span>
              </div>
              <p style="font-size: 0.8125rem; color: var(--os-text-muted); line-height: 1.5; margin-bottom: var(--space-4);">
                Connect your personal Google Gemini API key to power live cognitive tutoring, algorithm analysis, and coursework assistance in the AI Study Buddy app.
              </p>
              <div class="form-group">
                <label class="form-label">Gemini API Key</label>
                <input type="password" id="input-settings-gemini-key" class="form-input" placeholder="AIzaSy..." value="${escapeHtml(state.aiSettings?.apiKey || '')}" autocomplete="off" />
                <div style="font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: 4px;">
                  Get your free API key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style="color: var(--os-accent); text-decoration: underline;">Google AI Studio</a>. Keys are stored strictly on-device in localStorage and excluded from JSON backups.
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Default Model</label>
                <select id="select-settings-gemini-model" class="form-select">
                  <option value="gemini-1.5-flash" ${(state.aiSettings?.model || '') === 'gemini-1.5-flash' ? 'selected' : ''}>gemini-1.5-flash (Fast &amp; Responsive, Recommended)</option>
                  <option value="gemini-1.5-pro" ${(state.aiSettings?.model || '') === 'gemini-1.5-pro' ? 'selected' : ''}>gemini-1.5-pro (Advanced Reasoning &amp; Long-Form Analysis)</option>
                </select>
              </div>
              <div style="display: flex; gap: var(--space-2); margin-top: var(--space-4);">
                <button class="btn btn-primary btn-sm" id="btn-save-ai-settings">
                  Save AI Settings
                </button>
                ${state.aiSettings?.apiKey ? `
                  <button class="btn btn-secondary btn-sm" id="btn-clear-ai-key" style="color: var(--os-error);">
                    Remove Key
                  </button>
                ` : ''}
              </div>
            </div>
          ` : `
            <!-- Data & Backup -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 620px;">
              <!-- Storage Metrics -->
              <div class="card">
                <div class="card-header">
                  <span class="card-title">Storage &amp; Data Metrics</span>
                  <span class="badge badge-primary">Schema v${state.schemaVersion || 2}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: var(--space-3); margin-bottom: var(--space-3);">
                  <div style="background: var(--os-bg-subtle); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--os-border);">
                    <div style="font-size: 0.6875rem; color: var(--os-text-muted);">Storage Used</div>
                    <div style="font-size: 1.125rem; font-weight: 700; font-family: var(--font-mono); color: var(--os-accent);">${storageSizeKb} KB</div>
                  </div>
                  <div style="background: var(--os-bg-subtle); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--os-border);">
                    <div style="font-size: 0.6875rem; color: var(--os-text-muted);">Habits &amp; Goals</div>
                    <div style="font-size: 1.125rem; font-weight: 700; font-family: var(--font-mono);">${(state.habits?.length || 0)} / ${(state.goals?.length || 0)}</div>
                  </div>
                  <div style="background: var(--os-bg-subtle); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--os-border);">
                    <div style="font-size: 0.6875rem; color: var(--os-text-muted);">Tasks &amp; Notes</div>
                    <div style="font-size: 1.125rem; font-weight: 700; font-family: var(--font-mono);">${(state.kanbanCards?.length || 0)} / ${(state.notes?.length || 0)}</div>
                  </div>
                  <div style="background: var(--os-bg-subtle); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--os-border);">
                    <div style="font-size: 0.6875rem; color: var(--os-text-muted);">Activity Logs</div>
                    <div style="font-size: 1.125rem; font-weight: 700; font-family: var(--font-mono);">${state.activityLog?.length || 0}</div>
                  </div>
                </div>
              </div>

              <!-- Backup & Restore -->
              <div class="card">
                <div class="card-header">
                  <span class="card-title">Data Backup (JSON Export / Import)</span>
                </div>
                <p style="font-size: 0.8125rem; color: var(--os-text-muted); margin-bottom: var(--space-4);">
                  Export a portable JSON backup file of all 18 applications, habits, assignments, and notes to store locally or restore anytime.
                </p>
                <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
                  <button class="btn btn-primary btn-sm" id="btn-export-backup">
                    ${getIcon('download', 'w-3.5 h-3.5')} Export Backup (JSON)
                  </button>
                  <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                    ${getIcon('upload', 'w-3.5 h-3.5')} Import Backup
                    <input type="file" id="input-import-backup" accept=".json" style="display: none;" />
                  </label>
                </div>
              </div>

              <!-- Danger Zone: Clean Slate & Reset -->
              <div class="card" style="border-color: rgba(239, 68, 68, 0.3);">
                <div class="card-header">
                  <span class="card-title" style="color: var(--os-error);">Danger Zone</span>
                </div>
                <p style="font-size: 0.8125rem; color: var(--os-text-muted); margin-bottom: var(--space-4);">
                  Manage demo data or reset College OS back to initial defaults.
                </p>
                <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
                  <button class="btn btn-danger btn-sm" id="btn-clear-demo">
                    ${getIcon('trash-2', 'w-3.5 h-3.5')} Clear Demo Data (Fresh Slate)
                  </button>
                  <button class="btn btn-secondary btn-sm" id="btn-reset-factory" style="color: var(--os-error); border-color: rgba(239, 68, 68, 0.4);">
                    ${getIcon('rotate-ccw', 'w-3.5 h-3.5')} Reset to Factory Defaults
                  </button>
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
      const year = container.querySelector('#prof-year')?.value;
      const thresh = Number(container.querySelector('#prof-attendance-thresh')?.value) || 75;

      store.updateProfile({ name, college, course, year, attendanceThreshold: thresh });
      logActivity({
        appId: 'settings',
        action: 'profile_updated',
        title: 'Updated Student Profile',
        details: `${name} (${college})`
      });
      soundService.playComplete();
      ui.toast({ title: 'Profile Updated', message: 'Your student profile has been saved successfully.', type: 'success' });
    });

    const relaunchBtn = container.querySelector('#btn-relaunch-onboarding');
    relaunchBtn?.addEventListener('click', () => {
      if (window.openOnboardingModal) {
        window.openOnboardingModal();
      }
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

    // Save AI settings
    const saveAiBtn = container.querySelector('#btn-save-ai-settings');
    saveAiBtn?.addEventListener('click', () => {
      const key = container.querySelector('#input-settings-gemini-key')?.value.trim() || '';
      const model = container.querySelector('#select-settings-gemini-model')?.value || 'gemini-1.5-flash';
      store.setAiSettings({ apiKey: key, model, enabled: Boolean(key) });
      soundService.playComplete();
      ui.toast({
        title: 'AI Settings Saved',
        message: key ? `Gemini API key updated (${model}).` : 'API key cleared. Running in local coach mode.',
        type: 'success'
      });
      container.innerHTML = this.render();
      this.init(container);
    });

    const clearAiKeyBtn = container.querySelector('#btn-clear-ai-key');
    clearAiKeyBtn?.addEventListener('click', () => {
      soundService.playClick();
      store.setAiSettings({ apiKey: '', enabled: false });
      ui.toast({ title: 'API Key Removed', message: 'Local coach mode active.', type: 'info' });
      container.innerHTML = this.render();
      this.init(container);
    });

    // Export backup
    const exportBtn = container.querySelector('#btn-export-backup');
    exportBtn?.addEventListener('click', () => {
      soundService.playClick();
      store.exportBackup();
      ui.toast({ title: 'Backup Exported', message: 'JSON backup downloaded to your computer.', type: 'success' });
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
            ui.toast({ title: 'Backup Restored', message: 'All 18 apps synced successfully. Refreshing...', type: 'success' });
            setTimeout(() => window.location.reload(), 1200);
          } else {
            ui.toast({ title: 'Restore Failed', message: 'The uploaded file is not a valid College OS backup.', type: 'error' });
          }
        }
      };
      reader.readAsText(file);
    });

    // Clear Demo Data
    const clearDemoBtn = container.querySelector('#btn-clear-demo');
    clearDemoBtn?.addEventListener('click', () => {
      soundService.playClick();
      ui.confirm({
        title: 'Clear All Demo Data?',
        message: 'This will wipe all sample habits, goals, timetable classes, notes, and activity logs so you can enter your own real college information. Your profile, themes, and XP level will NOT be deleted.',
        confirmText: 'Clear Demo Data',
        confirmClass: 'btn-danger',
        onConfirm: () => {
          store.clearDemoData();
          soundService.playComplete();
          ui.toast({ title: 'Demo Data Cleared', message: 'College OS is now a blank canvas ready for your real data.', type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    // Reset to Factory Defaults
    const resetFactoryBtn = container.querySelector('#btn-reset-factory');
    resetFactoryBtn?.addEventListener('click', () => {
      soundService.playClick();
      ui.confirm({
        title: 'Reset to Factory Defaults?',
        message: 'This will erase all saved college data, habits, settings, and profile information, restoring College OS back to its original factory state.',
        confirmText: 'Reset Everything',
        confirmClass: 'btn-danger',
        onConfirm: () => {
          store.resetToFactory();
          ui.toast({ title: 'Factory Reset Complete', message: 'Reloading College OS...', type: 'info' });
          setTimeout(() => window.location.reload(), 1000);
        }
      });
    });
  },

  destroy() {}
};

export default settingsApp;
