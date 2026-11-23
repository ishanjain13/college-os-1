// COLLEGE OS - App: Personal Journal & Nightly Review

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

export const journalApp = {
  id: 'journal',
  title: 'Personal Journal',
  icon: 'feather',
  searchQuery: '',

  render() {
    const state = store.get();
    const entries = (state.journal || []).filter(j => {
      if (!this.searchQuery) return true;
      const q = this.searchQuery.toLowerCase();
      return (j.title || '').toLowerCase().includes(q) || (j.content || '').toLowerCase().includes(q) || (j.mood || '').toLowerCase().includes(q);
    });

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

        <!-- Prompt of the Day Card & Search -->
        <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
          <div style="flex: 1; min-width: 280px; background: linear-gradient(135deg, rgba(168,85,247,0.15) 0%, var(--os-bg-card) 100%); border: 1px solid rgba(168,85,247,0.3); border-radius: var(--radius-xl); padding: var(--space-4);">
            <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: #c084fc; font-weight: 700; text-transform: uppercase;">
              Nightly Reflection Prompt
            </div>
            <p style="font-size: 0.875rem; font-style: italic; color: #ffffff; margin-top: 4px;">
              "What was the single highest-friction thing you confronted today that moved your future forward?"
            </p>
          </div>
          <div class="input-wrapper" style="width: 220px; align-self: center;">
            <input type="text" id="journal-search-input" class="form-input" placeholder="Search reflections..." value="${escapeHtml(this.searchQuery)}" style="padding: 6px 10px; font-size: 0.75rem;" />
          </div>
        </div>

        <!-- Journal Entries List -->
        <div class="app-body">
          ${entries.length === 0 ? ui.emptyState({
            icon: 'feather',
            title: 'No reflections found',
            description: 'Write daily reflections to process insights, track mindset shifts, and earn XP.',
            actionText: 'Write First Entry',
            actionId: 'btn-empty-add-journal'
          }) : `
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${entries.map(entry => `
                <div class="card" style="border-left: 3px solid var(--os-accent);">
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
          `}
        </div>
      </div>
    `;
  },

  init(container) {
    const searchInput = container.querySelector('#journal-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      container.innerHTML = this.render();
      this.init(container);
      const newSearch = container.querySelector('#journal-search-input');
      if (newSearch) {
        newSearch.focus();
        newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
      }
    });

    const openEntryModal = () => {
      const moods = ['Focused', 'Energized', 'Grateful', 'Reflective', 'Overcoming Friction', 'Tired'];
      ui.modal({
        title: 'New Journal Reflection',
        width: '460px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Reflection Title *</label>
            <input type="text" id="modal-journal-title" class="form-input" placeholder="e.g. Compounding Daily Grit" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Current Mindset / Mood</label>
              <select id="modal-journal-mood" class="form-select">
                ${moods.map(m => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Date</label>
              <input type="date" id="modal-journal-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Reflection Notes</label>
            <textarea id="modal-journal-content" class="form-textarea" placeholder="What happened today? What did you learn? What will you execute tomorrow?" style="min-height: 120px;"></textarea>
          </div>
        `,
        confirmText: 'Record Reflection (+40 XP)',
        onConfirm: (modalEl) => {
          const title = modalEl.querySelector('#modal-journal-title')?.value.trim();
          const content = modalEl.querySelector('#modal-journal-content')?.value.trim();

          if (!title || !content) {
            ui.toast({ title: 'Validation Error', message: 'Title and content are required.', type: 'error' });
            return false;
          }

          const mood = modalEl.querySelector('#modal-journal-mood')?.value;
          const date = modalEl.querySelector('#modal-journal-date')?.value || new Date().toISOString().split('T')[0];

          const newEntry = {
            id: `j-${Date.now()}`,
            date,
            mood,
            title,
            content
          };

          store.setJournal(prev => [newEntry, ...prev]);
          logActivity({
            appId: 'journal',
            action: 'entry_written',
            title: `Journal Reflection: ${title}`,
            details: `Mood: ${mood}`,
            xpEarned: 40
          });

          ui.toast({ title: 'Reflection Recorded! ✍️', message: `+40 XP awarded for personal documentation!`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    };

    container.querySelector('#btn-add-journal')?.addEventListener('click', openEntryModal);
    container.querySelector('#btn-empty-add-journal')?.addEventListener('click', openEntryModal);

    container.querySelectorAll('[data-delete-journal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-journal');
        ui.confirm({
          title: 'Delete Reflection?',
          message: 'Are you sure you want to remove this journal entry?',
          confirmText: 'Delete',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            store.setJournal(prev => prev.filter(j => j.id !== id));
            ui.toast({ title: 'Entry Removed', message: 'Journal updated.', type: 'info' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });
  },

  destroy() {}
};

export default journalApp;
