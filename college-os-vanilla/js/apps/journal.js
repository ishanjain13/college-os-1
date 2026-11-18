// COLLEGE OS - App: Personal Journal & Nightly Reflection

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';

export const journalApp = {
  id: 'journal',
  title: 'Personal Journal',
  icon: 'feather',

  render() {
    const state = store.get();
    const entries = state.journal || [];

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Personal Journal &amp; Nightly Review</h2>
            <p>Clear cognitive debt, articulate insights, and document your personal evolution.</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-add-journal">
            ${getIcon('plus', 'w-3.5 h-3.5')} New Reflection (+40 XP)
          </button>
        </div>

        <!-- Prompt of the Day Card -->
        <div style="background: linear-gradient(135deg, rgba(168,85,247,0.15) 0%, var(--os-bg-card) 100%); border: 1px solid rgba(168,85,247,0.3); border-radius: var(--radius-xl); padding: var(--space-4);">
          <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: #c084fc; font-weight: 700; text-transform: uppercase;">Reflection Prompt of the Day</div>
          <p style="font-size: 0.875rem; font-style: italic; color: #ffffff; margin-top: 4px;">
            "What was the single highest-friction thing you did today that moved your future forward?"
          </p>
        </div>

        <!-- Journal Entries List -->
        <div class="app-body">
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${entries.map(entry => `
              <div class="card">
                <div class="card-header">
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <span class="badge badge-primary">${escapeHtml(entry.mood || 'Reflective')}</span>
                    <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle);">${entry.date}</span>
                  </div>
                  <button class="btn btn-ghost btn-xs" data-delete-journal="${entry.id}">×</button>
                </div>
                <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 6px;">${escapeHtml(entry.title)}</h3>
                <p style="font-size: 0.8125rem; line-height: 1.6; color: var(--os-text-muted); white-space: pre-wrap;">${escapeHtml(entry.content)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  init(container) {
    const addBtn = container.querySelector('#btn-add-journal');
    addBtn?.addEventListener('click', () => {
      const title = prompt("Reflection Title:");
      if (!title) return;
      const content = prompt("Journal Content:");
      if (!content) return;

      const newEntry = {
        id: `j-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        mood: "Focused",
        title: title.trim(),
        content: content.trim()
      };

      store.setJournal(prev => [newEntry, ...prev]);
      awardXP(40, `Journal entry: ${title}`);
      container.innerHTML = this.render();
      this.init(container);
    });

    container.querySelectorAll('[data-delete-journal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-journal');
        soundService.playClick();
        store.setJournal(prev => prev.filter(j => j.id !== id));
        container.innerHTML = this.render();
        this.init(container);
      });
    });
  },

  destroy() {}
};

export default journalApp;
