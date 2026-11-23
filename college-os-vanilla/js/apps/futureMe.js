// COLLEGE OS - App: Future Me Time-Capsule Letters

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml, getDaysLeft } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

export const futureMeApp = {
  id: 'future_me',
  title: 'Future Me Letters',
  icon: 'hourglass',

  render() {
    const state = store.get();
    const letters = state.futureLetters || [];

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Letters to Future Self</h2>
            <p>Sealed time-capsules. Document your current struggles and unlock when the time arrives.</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-write-letter">
            ${getIcon('plus', 'w-3.5 h-3.5')} Seal New Letter (+50 XP)
          </button>
        </div>

        <!-- Letters List -->
        <div class="app-body">
          ${letters.length === 0 ? ui.emptyState({
            icon: 'hourglass',
            title: 'No time capsule letters sealed',
            description: 'Write a letter to your future self at graduation or next semester. It stays locked until that date.',
            actionText: 'Seal Your First Letter',
            actionId: 'btn-empty-add-letter'
          }) : `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-4);">
              ${letters.map(letter => {
                const days = getDaysLeft(letter.unlockDate);
                const isLocked = days !== null && days > 0;

                return `
                  <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-4); border-left: 3px solid ${isLocked ? 'var(--os-warning)' : 'var(--os-success)'};">
                    <div>
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                        <span class="badge ${isLocked ? 'badge-warning' : 'badge-success'}">
                          ${isLocked ? `🔒 Locked (${days}d left)` : '🔓 Sealed Letter Unlocked!'}
                        </span>
                        <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle);">Written ${letter.writeDate}</span>
                      </div>

                      <h3 style="font-size: 1.125rem; font-family: var(--font-display);">${escapeHtml(letter.title)}</h3>

                      ${!isLocked ? `
                        <p style="font-size: 0.8125rem; line-height: 1.6; color: var(--os-text); white-space: pre-wrap; margin-top: var(--space-3); border-top: 1px solid var(--os-border); padding-top: var(--space-3);">
                          ${escapeHtml(letter.letter)}
                        </p>
                      ` : `
                        <div style="padding: var(--space-6) 0; text-align: center; color: var(--os-text-muted); font-size: 0.8125rem; background: var(--os-bg-subtle); border-radius: var(--radius-md); margin-top: var(--space-3);">
                          ${getIcon('lock', 'w-6 h-6')}
                          <div style="margin-top: var(--space-2);">
                            Locked until <strong>${letter.unlockDate}</strong> (${days} days remaining).
                          </div>
                        </div>
                      `}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--os-border); padding-top: var(--space-3); font-size: 0.6875rem; color: var(--os-text-subtle);">
                      <span>Unlocks on ${letter.unlockDate}</span>
                      <button class="btn btn-ghost btn-xs" data-delete-letter="${letter.id}">×</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  init(container) {
    const openLetterModal = () => {
      const defaultDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      ui.modal({
        title: 'Seal Letter to Future Self',
        width: '460px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Letter Title *</label>
            <input type="text" id="modal-letter-title" class="form-input" placeholder="e.g. End of Sophomore Year Reflection" />
          </div>
          <div class="form-group">
            <label class="form-label">Unlock Date *</label>
            <input type="date" id="modal-letter-date" class="form-input" value="${defaultDate}" />
            <span class="form-help">This letter will remain cryptographically sealed until this date arrives.</span>
          </div>
          <div class="form-group">
            <label class="form-label">Letter Content</label>
            <textarea id="modal-letter-body" class="form-textarea" placeholder="Dear Future Me, Remember what we fought for today..." style="min-height: 140px;"></textarea>
          </div>
        `,
        confirmText: 'Seal in Capsule (+50 XP)',
        onConfirm: (modalEl) => {
          const title = modalEl.querySelector('#modal-letter-title')?.value.trim();
          const unlockDate = modalEl.querySelector('#modal-letter-date')?.value;
          const letter = modalEl.querySelector('#modal-letter-body')?.value.trim();

          if (!title || !letter) {
            ui.toast({ title: 'Validation Error', message: 'Title and letter content required.', type: 'error' });
            return false;
          }

          const newLetter = {
            id: `fl-${Date.now()}`,
            title,
            writeDate: new Date().toISOString().split('T')[0],
            unlockDate: unlockDate || defaultDate,
            letter,
            unlocked: false
          };

          store.setFutureLetters(prev => [newLetter, ...(prev || [])]);
          logActivity({
            appId: 'future_me',
            action: 'letter_sealed',
            title: `Sealed Time Capsule: ${title}`,
            details: `Unlocks on: ${unlockDate}`,
            xpEarned: 50
          });

          ui.toast({ title: 'Letter Sealed! ⏳', message: `+50 XP! Your letter is locked until ${unlockDate}.`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    };

    container.querySelector('#btn-write-letter')?.addEventListener('click', openLetterModal);
    container.querySelector('#btn-empty-add-letter')?.addEventListener('click', openLetterModal);

    container.querySelectorAll('[data-delete-letter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-letter');
        ui.confirm({
          title: 'Delete Sealed Letter?',
          message: 'Are you sure you want to delete this future letter?',
          confirmText: 'Delete',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            store.setFutureLetters(prev => (prev || []).filter(l => l.id !== id));
            ui.toast({ title: 'Letter Deleted', message: 'Time capsule updated.', type: 'info' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });
  },

  destroy() {}
};

export default futureMeApp;
