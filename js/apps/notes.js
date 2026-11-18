// COLLEGE OS - App: Notes & Spaced Repetition Flashcards

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';

export const notesApp = {
  id: 'notes',
  title: 'Notes & Flashcards',
  icon: 'book-open',
  activeTab: 'notes',
  selectedNoteId: 'n-1',

  render() {
    const state = store.get();
    const notes = state.notes || [];
    const flashcards = state.flashcards || [];
    const activeNote = notes.find(n => n.id === this.selectedNoteId) || notes[0];

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Notes &amp; Flashcards Hub</h2>
            <p>Knowledge repository and active recall retention system.</p>
          </div>
          <div class="tab-list">
            <button class="tab-btn ${this.activeTab === 'notes' ? 'active' : ''}" data-notes-tab="notes">
              ${getIcon('book-open', 'w-3.5 h-3.5')} Markdown Notes
            </button>
            <button class="tab-btn ${this.activeTab === 'flashcards' ? 'active' : ''}" data-notes-tab="flashcards">
              ${getIcon('sparkles', 'w-3.5 h-3.5')} Flashcards Quiz
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="app-body">
          ${this.activeTab === 'notes' ? `
            <div class="notes-layout">
              <!-- Left Sidebar: Note List -->
              <div class="notes-sidebar">
                <button class="btn btn-primary btn-sm" id="btn-create-note" style="width: 100%; margin-bottom: var(--space-2);">
                  ${getIcon('plus', 'w-3.5 h-3.5')} New Note
                </button>
                <div style="display: flex; flex-direction: column; gap: var(--space-1-5); overflow-y: auto;">
                  ${notes.map(n => `
                    <div style="padding: var(--space-2-5) var(--space-3); border-radius: var(--radius-md); background: ${n.id === this.selectedNoteId ? 'var(--os-bg-card-hover)' : 'var(--os-bg-subtle)'}; border: 1px solid ${n.id === this.selectedNoteId ? 'var(--os-accent)' : 'var(--os-border)'}; cursor: pointer;" data-select-note="${n.id}">
                      <div style="font-weight: 700; font-size: 0.8125rem; color: var(--os-text);" class="truncate">${escapeHtml(n.title)}</div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: 4px;">
                        <span>${escapeHtml(n.subject || 'General')}</span>
                        <span>${(n.tags || []).join(', ')}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Right: Active Note Editor -->
              ${activeNote ? `
                <div class="note-editor-card">
                  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--os-border); padding-bottom: var(--space-2);">
                    <input type="text" id="note-title-input" value="${escapeHtml(activeNote.title)}" style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-display); width: 80%;" />
                    <button class="btn btn-danger btn-xs" data-delete-note="${activeNote.id}">Delete</button>
                  </div>
                  <textarea class="note-content-area" id="note-body-textarea">${escapeHtml(activeNote.content)}</textarea>
                </div>
              ` : `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--os-text-muted);">
                  Select or create a note to start editing.
                </div>
              `}
            </div>
          ` : `
            <!-- Flashcards Mode -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-6); max-width: 640px; margin: 0 auto; width: 100%;">
              <div style="font-size: 0.8125rem; color: var(--os-text-muted);">Click card to reveal answer:</div>
              ${flashcards.map((fc, i) => `
                <div class="flashcard" data-fc-index="${i}" style="width: 100%;">
                  <div class="flashcard-inner">
                    <div class="flashcard-front">
                      <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-accent); text-transform: uppercase; margin-bottom: var(--space-2);">${escapeHtml(fc.deck)}</div>
                      <h3 style="font-size: 1.125rem; line-height: 1.4;">${escapeHtml(fc.front)}</h3>
                      <div style="font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: var(--space-4);">Click to flip ↻</div>
                    </div>
                    <div class="flashcard-back">
                      <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-success); text-transform: uppercase; margin-bottom: var(--space-2);">Answer &amp; Breakdown</div>
                      <p style="font-size: 0.9375rem; line-height: 1.5; color: var(--os-text);">${escapeHtml(fc.back)}</p>
                      <div style="display: flex; gap: var(--space-2); margin-top: var(--space-4);">
                        <button class="btn btn-secondary btn-xs" data-review-fc="hard">Hard (+20 XP)</button>
                        <button class="btn btn-primary btn-xs" data-review-fc="good">Good (+40 XP)</button>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  init(container) {
    // Mode switcher
    container.querySelectorAll('[data-notes-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        this.activeTab = btn.getAttribute('data-notes-tab');
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Note selection
    container.querySelectorAll('[data-select-note]').forEach(item => {
      item.addEventListener('click', () => {
        soundService.playClick();
        this.selectedNoteId = item.getAttribute('data-select-note');
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // New Note
    const createBtn = container.querySelector('#btn-create-note');
    createBtn?.addEventListener('click', () => {
      const title = prompt("Enter note title:");
      if (title && title.trim()) {
        const newNote = {
          id: `n-${Date.now()}`,
          title: title.trim(),
          subject: 'General',
          pinned: false,
          tags: ['Study'],
          content: `# ${title.trim()}\n\nWrite your thoughts, key formulas, or active recall prompts here.`,
          updatedAt: new Date().toISOString()
        };
        store.setNotes(prev => [newNote, ...prev]);
        this.selectedNoteId = newNote.id;
        awardXP(20, `Created note: ${title}`);
        container.innerHTML = this.render();
        this.init(container);
      }
    });

    // Note input editing
    const titleInput = container.querySelector('#note-title-input');
    const bodyArea = container.querySelector('#note-body-textarea');

    if (titleInput && bodyArea) {
      titleInput.addEventListener('input', () => {
        store.setNotes(prev => prev.map(n => n.id === this.selectedNoteId ? { ...n, title: titleInput.value } : n));
      });
      bodyArea.addEventListener('input', () => {
        store.setNotes(prev => prev.map(n => n.id === this.selectedNoteId ? { ...n, content: bodyArea.value } : n));
      });
    }

    // Delete note
    container.querySelectorAll('[data-delete-note]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-note');
        if (confirm("Delete this note?")) {
          soundService.playClick();
          store.setNotes(prev => prev.filter(n => n.id !== id));
          this.selectedNoteId = null;
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    // Flashcard flip
    container.querySelectorAll('.flashcard').forEach(fc => {
      fc.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          fc.classList.toggle('flipped');
        }
      });
    });

    // Flashcard review XP
    container.querySelectorAll('[data-review-fc]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.getAttribute('data-review-fc');
        const xp = type === 'good' ? 40 : 20;
        awardXP(xp, "Flashcard recall session", e.clientX, e.clientY);
        const card = btn.closest('.flashcard');
        card.classList.remove('flipped');
      });
    });
  },

  destroy() {}
};

export default notesApp;
