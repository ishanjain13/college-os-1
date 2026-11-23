// COLLEGE OS - App: Notes & Spaced Repetition Flashcards (Markdown Engine, SM-2 Recall & Export/Import)

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

/**
 * Lightweight, zero-dependency Markdown to HTML parser
 */
function renderMarkdown(md) {
  if (!md) return '';
  let html = escapeHtml(md);

  // Code blocks: ```code```
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="markdown-pre"><code class="language-${lang}">${code}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-code">$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>');

  // Blockquotes: > quote
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="markdown-quote">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li class="markdown-li">$1</li>');
  html = html.replace(/(<li class="markdown-li">.*<\/li>)/gim, '<ul class="markdown-ul">$1</ul>');

  // Paragraph linebreaks
  html = html.replace(/\n\n/g, '<br><br>');

  return html;
}

export const notesApp = {
  id: 'notes',
  title: 'Notes & Flashcards',
  icon: 'book-open',
  activeTab: 'notes',
  selectedNoteId: null,
  searchQuery: '',
  previewMode: false,
  selectedDeck: 'All',

  render() {
    const state = store.get();
    const notes = (state.notes || []).filter(n => {
      if (!this.searchQuery) return true;
      const q = this.searchQuery.toLowerCase();
      return (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q) || (n.subject || '').toLowerCase().includes(q);
    });

    const activeNote = notes.find(n => n.id === this.selectedNoteId) || notes[0];
    if (activeNote && this.selectedNoteId !== activeNote.id) {
      this.selectedNoteId = activeNote.id;
    }

    const flashcards = state.flashcards || [];
    const decks = ['All', ...new Set(flashcards.map(fc => fc.deck).filter(Boolean))];
    const todayStr = new Date().toISOString().split('T')[0];

    const filteredCards = flashcards.filter(fc => {
      if (this.selectedDeck !== 'All' && fc.deck !== this.selectedDeck) return false;
      return true;
    });

    const dueTodayCount = flashcards.filter(fc => !fc.nextReview || fc.nextReview <= todayStr).length;

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Notes &amp; Flashcards Hub</h2>
            <p>Markdown knowledge repository and active recall retention system with SM-2 spaced repetition.</p>
          </div>
          <div class="tab-list">
            <button class="tab-btn ${this.activeTab === 'notes' ? 'active' : ''}" data-notes-tab="notes">
              ${getIcon('book-open', 'w-3.5 h-3.5')} Markdown Notes (${notes.length})
            </button>
            <button class="tab-btn ${this.activeTab === 'flashcards' ? 'active' : ''}" data-notes-tab="flashcards">
              ${getIcon('sparkles', 'w-3.5 h-3.5')} Spaced Flashcards (${dueTodayCount} Due)
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="app-body" style="flex: 1; overflow: hidden;">
          ${this.activeTab === 'notes' ? `
            <div class="notes-layout" style="display: grid; grid-template-columns: 280px 1fr; gap: var(--space-4); height: 100%;">
              <!-- Left Sidebar: Note List -->
              <div class="notes-sidebar" style="display: flex; flex-direction: column; gap: var(--space-2); height: 100%; border-right: 1px solid var(--os-border); padding-right: var(--space-3);">
                <div style="display: flex; gap: var(--space-2);">
                  <button class="btn btn-primary btn-sm" id="btn-create-note" style="flex: 1;">
                    ${getIcon('plus', 'w-3.5 h-3.5')} New Note
                  </button>
                  <label class="btn btn-secondary btn-sm" title="Import Markdown File" style="cursor: pointer; padding: 6px 10px;">
                    ${getIcon('upload', 'w-3.5 h-3.5')}
                    <input type="file" id="input-import-md" accept=".md,.txt" style="display: none;" />
                  </label>
                </div>

                <div class="input-wrapper" style="width: 100%; margin: var(--space-1) 0;">
                  <input type="text" id="note-search-input" class="form-input" placeholder="Search notes..." value="${escapeHtml(this.searchQuery)}" style="padding: 4px 8px; font-size: 0.75rem;" />
                </div>

                <div style="display: flex; flex-direction: column; gap: var(--space-1-5); overflow-y: auto; flex: 1;">
                  ${notes.map(n => `
                    <div style="padding: var(--space-2-5) var(--space-3); border-radius: var(--radius-md); background: ${n.id === this.selectedNoteId ? 'var(--os-bg-card-hover)' : 'var(--os-bg-subtle)'}; border: 1px solid ${n.id === this.selectedNoteId ? 'var(--os-accent)' : 'var(--os-border)'}; cursor: pointer; transition: all 0.15s;" data-select-note="${n.id}">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; font-size: 0.8125rem; color: var(--os-text);" class="truncate">${escapeHtml(n.title)}</span>
                        ${n.pinned ? `<span style="color: #f59e0b; font-size: 0.75rem;">★</span>` : ''}
                      </div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: 4px;">
                        <span>${escapeHtml(n.subject || 'General')}</span>
                        <span>${(n.tags || []).join(', ')}</span>
                      </div>
                    </div>
                  `).join('')}

                  ${notes.length === 0 ? `
                    <div style="color: var(--os-text-muted); font-size: 0.75rem; text-align: center; padding: 24px 0;">
                      No notes found.
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Right: Active Note Editor & Preview -->
              ${activeNote ? `
                <div class="note-editor-card" style="display: flex; flex-direction: column; gap: var(--space-3); height: 100%;">
                  <!-- Toolbar -->
                  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--os-border); padding-bottom: var(--space-2); gap: var(--space-3); flex-wrap: wrap;">
                    <input type="text" id="note-title-input" value="${escapeHtml(activeNote.title)}" style="font-size: 1.125rem; font-weight: 700; font-family: var(--font-display); flex: 1; min-width: 180px; background: transparent; border: none; color: var(--os-text);" placeholder="Note Title..." />
                    <div style="display: flex; gap: var(--space-2); align-items: center;">
                      <button class="btn btn-secondary btn-xs" id="btn-toggle-preview">
                        ${this.previewMode ? getIcon('edit-2', 'w-3 h-3') : getIcon('eye', 'w-3 h-3')} ${this.previewMode ? 'Edit' : 'Preview'}
                      </button>
                      <button class="btn btn-secondary btn-xs" id="btn-toggle-pin" title="${activeNote.pinned ? 'Unpin note' : 'Pin note'}">
                        ${activeNote.pinned ? '★ Pinned' : '☆ Pin'}
                      </button>
                      <button class="btn btn-secondary btn-xs" id="btn-export-md" title="Export .md file">
                        ${getIcon('download', 'w-3 h-3')} Export
                      </button>
                      <button class="btn btn-danger btn-xs" id="btn-delete-active-note" title="Delete Note">
                        ${getIcon('trash-2', 'w-3 h-3')}
                      </button>
                    </div>
                  </div>

                  <!-- Editor / Preview Surface -->
                  <div style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                    ${this.previewMode ? `
                      <div class="markdown-preview" style="flex: 1; overflow-y: auto; padding: var(--space-3); background: var(--os-bg-card); border-radius: var(--radius-md); border: 1px solid var(--os-border); line-height: 1.6; font-size: 0.875rem;">
                        ${renderMarkdown(activeNote.content)}
                      </div>
                    ` : `
                      <textarea class="form-textarea note-content-area" id="note-body-textarea" style="flex: 1; resize: none; font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.6; padding: var(--space-3); background: var(--os-bg-input); border-radius: var(--radius-md);" placeholder="Write markdown notes here... Use # for headings, **bold**, - lists, code blocks, etc.">${escapeHtml(activeNote.content || '')}</textarea>
                    `}
                  </div>
                </div>
              ` : `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--os-text-muted);">
                  Select or create a note to start editing.
                </div>
              `}
            </div>
          ` : `
            <!-- Flashcards Mode -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 680px; margin: 0 auto; width: 100%; height: 100%; overflow-y: auto;">
              <!-- Flashcards Toolbar -->
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
                <div style="display: flex; gap: var(--space-2); align-items: center;">
                  <span style="font-size: 0.75rem; color: var(--os-text-muted);">Deck:</span>
                  <select id="flashcard-deck-select" class="form-select" style="width: auto; padding: 4px 8px; font-size: 0.75rem;">
                    ${decks.map(d => `<option value="${escapeHtml(d)}" ${this.selectedDeck === d ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
                  </select>
                </div>
                <button class="btn btn-primary btn-sm" id="btn-add-flashcard">
                  ${getIcon('plus', 'w-3.5 h-3.5')} New Flashcard
                </button>
              </div>

              <!-- Flashcard Cards Stack -->
              ${filteredCards.length === 0 ? ui.emptyState({
                icon: 'sparkles',
                title: 'No flashcards in deck',
                description: 'Create active recall flashcards to test your formulas, definitions, and concepts with SM-2 spaced repetition.',
                actionText: 'Create First Flashcard',
                actionId: 'btn-empty-add-fc'
              }) : `
                <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                  ${filteredCards.map((fc, i) => {
                    const isDue = !fc.nextReview || fc.nextReview <= todayStr;
                    return `
                      <div class="card flashcard-interactive" data-fc-id="${fc.id}" style="padding: var(--space-4); border-left: 3px solid ${isDue ? 'var(--os-accent)' : 'var(--os-border)'};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                          <div style="display: flex; align-items: center; gap: var(--space-2);">
                            <span class="badge badge-primary">${escapeHtml(fc.deck || 'General')}</span>
                            ${isDue ? '<span class="badge badge-warning">Due for Review</span>' : `<span style="font-size: 0.6875rem; color: var(--os-text-subtle);">Next review: ${fc.nextReview}</span>`}
                          </div>
                          <div style="display: flex; gap: 4px;">
                            <button class="btn btn-ghost btn-xs" data-edit-fc="${fc.id}">${getIcon('edit-2', 'w-3 h-3')}</button>
                            <button class="btn btn-ghost btn-xs" data-del-fc="${fc.id}">×</button>
                          </div>
                        </div>

                        <!-- Prompt / Question -->
                        <div style="font-size: 1rem; font-weight: 600; color: var(--os-text); line-height: 1.4; margin-bottom: var(--space-3);">
                          ${escapeHtml(fc.front)}
                        </div>

                        <!-- Revealable Answer -->
                        <div class="fc-answer-container" id="fc-ans-${fc.id}" style="display: none; background: var(--os-bg-subtle); border-radius: var(--radius-md); padding: var(--space-3); border: 1px solid var(--os-border); margin-bottom: var(--space-3);">
                          <div style="font-size: 0.6875rem; font-family: var(--font-mono); color: var(--os-success); font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Answer &amp; Breakdown</div>
                          <div style="font-size: 0.875rem; color: var(--os-text); line-height: 1.5;">${renderMarkdown(fc.back)}</div>
                        </div>

                        <!-- Controls -->
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2);">
                          <button class="btn btn-secondary btn-xs" data-reveal-ans="${fc.id}">
                            ${getIcon('eye', 'w-3 h-3')} Reveal Answer
                          </button>
                          <div class="sm2-buttons" style="display: none; gap: 4px;" id="fc-rating-${fc.id}">
                            <button class="btn btn-danger btn-xs" data-rate-fc="${fc.id}:again" title="Forgot (Interval 1d)">Again (+20 XP)</button>
                            <button class="btn btn-secondary btn-xs" data-rate-fc="${fc.id}:hard" title="Hard recall">Hard (+30 XP)</button>
                            <button class="btn btn-primary btn-xs" data-rate-fc="${fc.id}:good" title="Good recall">Good (+50 XP)</button>
                            <button class="btn btn-secondary btn-xs" style="color: var(--os-success); border-color: rgba(16, 185, 129, 0.4);" data-rate-fc="${fc.id}:easy" title="Perfect recall">Easy (+75 XP)</button>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
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

    // Search input
    const searchInput = container.querySelector('#note-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      container.innerHTML = this.render();
      this.init(container);
      const newSearch = container.querySelector('#note-search-input');
      if (newSearch) {
        newSearch.focus();
        newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
      }
    });

    // New Note
    const createBtn = container.querySelector('#btn-create-note');
    createBtn?.addEventListener('click', () => {
      ui.modal({
        title: 'Create Markdown Note',
        width: '420px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Note Title *</label>
            <input type="text" id="modal-note-title" class="form-input" placeholder="e.g. Dynamic Programming Framework" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Course / Subject</label>
              <input type="text" id="modal-note-subj" class="form-input" placeholder="e.g. CS 161" value="CS 161" />
            </div>
            <div class="form-group">
              <label class="form-label">Tags (comma separated)</label>
              <input type="text" id="modal-note-tags" class="form-input" placeholder="e.g. Algorithms, LeetCode" />
            </div>
          </div>
        `,
        confirmText: 'Create Note',
        onConfirm: (modalEl) => {
          const title = modalEl.querySelector('#modal-note-title')?.value.trim();
          if (!title) {
            ui.toast({ title: 'Validation Error', message: 'Note title is required.', type: 'error' });
            return false;
          }
          const subject = modalEl.querySelector('#modal-note-subj')?.value.trim() || 'General';
          const rawTags = modalEl.querySelector('#modal-note-tags')?.value || '';
          const tags = rawTags.split(',').map(t => t.trim()).filter(Boolean);

          const newNote = {
            id: `n-${Date.now()}`,
            title,
            subject,
            pinned: false,
            tags: tags.length > 0 ? tags : ['Study'],
            content: `# ${title}\n\nWrite your markdown notes here.`,
            updatedAt: new Date().toISOString()
          };

          store.setNotes(prev => [newNote, ...prev]);
          this.selectedNoteId = newNote.id;

          logActivity({
            appId: 'notes',
            action: 'note_created',
            title: `Created Note: ${title}`,
            details: `Subject: ${subject}`,
            xpEarned: 25
          });

          ui.toast({ title: 'Note Created', message: `+25 XP for documenting "${title}"`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    // Note input editing
    const titleInput = container.querySelector('#note-title-input');
    const bodyArea = container.querySelector('#note-body-textarea');

    if (titleInput) {
      titleInput.addEventListener('input', () => {
        store.setNotes(prev => prev.map(n => n.id === this.selectedNoteId ? { ...n, title: titleInput.value } : n));
      });
    }

    if (bodyArea) {
      bodyArea.addEventListener('input', () => {
        store.setNotes(prev => prev.map(n => n.id === this.selectedNoteId ? { ...n, content: bodyArea.value, updatedAt: new Date().toISOString() } : n));
      });
    }

    // Toggle Preview Mode
    const previewBtn = container.querySelector('#btn-toggle-preview');
    previewBtn?.addEventListener('click', () => {
      this.previewMode = !this.previewMode;
      container.innerHTML = this.render();
      this.init(container);
    });

    // Toggle Pin
    const pinBtn = container.querySelector('#btn-toggle-pin');
    pinBtn?.addEventListener('click', () => {
      store.setNotes(prev => prev.map(n => {
        if (n.id === this.selectedNoteId) {
          return { ...n, pinned: !n.pinned };
        }
        return n;
      }));
      container.innerHTML = this.render();
      this.init(container);
    });

    // Export .md file
    const exportBtn = container.querySelector('#btn-export-md');
    exportBtn?.addEventListener('click', () => {
      const active = store.get().notes.find(n => n.id === this.selectedNoteId);
      if (!active) return;
      const blob = new Blob([active.content || ''], { type: 'text/markdown;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(active.title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      a.click();
      ui.toast({ title: 'Note Exported', message: `Downloaded ${a.download}`, type: 'success' });
    });

    // Import .md file
    const importInput = container.querySelector('#input-import-md');
    importInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          const title = file.name.replace(/\.[^/.]+$/, "");
          const newNote = {
            id: `n-${Date.now()}`,
            title,
            subject: 'Imported',
            pinned: false,
            tags: ['Markdown'],
            content: text,
            updatedAt: new Date().toISOString()
          };
          store.setNotes(prev => [newNote, ...prev]);
          this.selectedNoteId = newNote.id;
          ui.toast({ title: 'Markdown Imported', message: `Created note from ${file.name}`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      };
      reader.readAsText(file);
    });

    // Delete note
    const deleteBtn = container.querySelector('#btn-delete-active-note');
    deleteBtn?.addEventListener('click', () => {
      const active = store.get().notes.find(n => n.id === this.selectedNoteId);
      ui.confirm({
        title: 'Delete Note?',
        message: `Are you sure you want to delete "${active?.title || 'this note'}"?`,
        confirmText: 'Delete Note',
        confirmClass: 'btn-danger',
        onConfirm: () => {
          store.setNotes(prev => prev.filter(n => n.id !== this.selectedNoteId));
          this.selectedNoteId = null;
          ui.toast({ title: 'Note Deleted', message: 'Note permanently removed.', type: 'info' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    // --- FLASHCARD HANDLERS ---
    const deckSelect = container.querySelector('#flashcard-deck-select');
    deckSelect?.addEventListener('change', (e) => {
      this.selectedDeck = e.target.value;
      container.innerHTML = this.render();
      this.init(container);
    });

    container.querySelector('#btn-add-flashcard')?.addEventListener('click', () => this.openFlashcardModal(null, container));
    container.querySelector('#btn-empty-add-fc')?.addEventListener('click', () => this.openFlashcardModal(null, container));

    // Reveal answer
    container.querySelectorAll('[data-reveal-ans]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-reveal-ans');
        const ans = container.querySelector(`#fc-ans-${id}`);
        const rating = container.querySelector(`#fc-rating-${id}`);
        if (ans) ans.style.display = 'block';
        if (rating) rating.style.display = 'flex';
        btn.style.display = 'none';
      });
    });

    // SM-2 Spaced Repetition Rating
    container.querySelectorAll('[data-rate-fc]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const [id, ratingKey] = btn.getAttribute('data-rate-fc').split(':');
        this.processSM2Review(id, ratingKey, e.clientX, e.clientY, container);
      });
    });

    // Edit flashcard
    container.querySelectorAll('[data-edit-fc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-fc');
        const fc = store.get().flashcards.find(f => f.id === id);
        if (fc) this.openFlashcardModal(fc, container);
      });
    });

    // Delete flashcard
    container.querySelectorAll('[data-del-fc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-fc');
        ui.confirm({
          title: 'Delete Flashcard?',
          message: 'Remove this flashcard from your deck?',
          confirmText: 'Delete',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            store.setFlashcards(prev => prev.filter(f => f.id !== id));
            ui.toast({ title: 'Flashcard Deleted', message: 'Card removed.', type: 'info' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });
  },

  processSM2Review(id, ratingKey, x, y, container) {
    const qMap = { again: 1, hard: 2, good: 4, easy: 5 };
    const q = qMap[ratingKey] || 4;
    const xpMap = { again: 20, hard: 30, good: 50, easy: 75 };
    const xp = xpMap[ratingKey] || 40;

    store.setFlashcards(prev => prev.map(fc => {
      if (fc.id === id) {
        let repetitions = Number(fc.repetitions) || 0;
        let interval = Number(fc.interval) || 1;
        let easeFactor = Number(fc.easeFactor) || 2.5;

        if (q < 3) {
          repetitions = 0;
          interval = 1;
        } else {
          if (repetitions === 0) {
            interval = 1;
          } else if (repetitions === 1) {
            interval = 6;
          } else {
            interval = Math.round(interval * easeFactor);
          }
          repetitions++;
        }

        // Calculate new ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + interval);
        const nextReview = nextDate.toISOString().split('T')[0];

        logActivity({
          appId: 'notes',
          action: 'flashcard_reviewed',
          title: `Flashcard Recalled: ${fc.front.slice(0, 32)}...`,
          details: `Rating: ${ratingKey.toUpperCase()} • Next in ${interval} day${interval === 1 ? '' : 's'}`,
          xpEarned: xp,
          metadata: { cardId: id, interval }
        });

        ui.toast({
          title: `Recall Logged: ${ratingKey.toUpperCase()}`,
          message: `+${xp} XP! Next review in ${interval} day${interval === 1 ? '' : 's'}.`,
          type: 'success'
        });

        return {
          ...fc,
          repetitions,
          interval,
          easeFactor: Number(easeFactor.toFixed(2)),
          nextReview
        };
      }
      return fc;
    }));

    container.innerHTML = this.render();
    this.init(container);
  },

  openFlashcardModal(existing, container) {
    const isEdit = Boolean(existing);
    const fc = existing || {
      deck: this.selectedDeck !== 'All' ? this.selectedDeck : 'CS 229 Machine Learning',
      front: '',
      back: '',
      difficulty: 'medium'
    };

    ui.modal({
      title: isEdit ? 'Edit Flashcard' : 'Create Spaced Recall Flashcard',
      width: '460px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Subject Deck *</label>
          <input type="text" id="fc-deck-input" class="form-input" placeholder="e.g. Algorithms & Data Structures" value="${escapeHtml(fc.deck)}" />
        </div>
        <div class="form-group">
          <label class="form-label">Front (Question / Prompt / Concept) *</label>
          <textarea id="fc-front-input" class="form-textarea" placeholder="e.g. Master Theorem recurrence relation cases" style="min-height: 70px;">${escapeHtml(fc.front)}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Back (Answer / Formula / Proof) *</label>
          <textarea id="fc-back-input" class="form-textarea" placeholder="Detailed breakdown and recall key..." style="min-height: 90px;">${escapeHtml(fc.back)}</textarea>
        </div>
      `,
      confirmText: isEdit ? 'Save Changes' : 'Create Card',
      onConfirm: (modalEl) => {
        const deck = modalEl.querySelector('#fc-deck-input')?.value.trim() || 'General';
        const front = modalEl.querySelector('#fc-front-input')?.value.trim();
        const back = modalEl.querySelector('#fc-back-input')?.value.trim();

        if (!front || !back) {
          ui.toast({ title: 'Validation Error', message: 'Front and Back are required.', type: 'error' });
          return false;
        }

        if (isEdit) {
          store.setFlashcards(prev => prev.map(f => f.id === fc.id ? { ...f, deck, front, back } : f));
          ui.toast({ title: 'Flashcard Updated', message: 'Saved changes.', type: 'success' });
        } else {
          const newCard = {
            id: `fc-${Date.now()}`,
            deck,
            front,
            back,
            difficulty: 'medium',
            repetitions: 0,
            interval: 1,
            easeFactor: 2.5,
            nextReview: new Date().toISOString().split('T')[0]
          };
          store.setFlashcards(prev => [newCard, ...prev]);
          ui.toast({ title: 'Card Created', message: `Added to deck ${deck}`, type: 'success' });
        }

        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  destroy() {}
};

export default notesApp;
