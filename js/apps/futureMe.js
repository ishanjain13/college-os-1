// COLLEGE OS - App: Future Me Time-Capsule Letters

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml, getDaysLeft } from '../utils.js';
import soundService from '../sound.js';

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
            ${getIcon('plus', 'w-3.5 h-3.5')} Seal New Letter
          </button>
        </div>

        <!-- Letters List -->
        <div class="app-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-4);">
            ${letters.map(letter => {
              const days = getDaysLeft(letter.unlockDate);
              const isLocked = days > 0;

              return `
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-4);">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                      <span class="badge ${isLocked ? 'badge-warning' : 'badge-success'}">
                        ${isLocked ? `🔒 Locked for ${days} days` : '🔓 Sealed Letter Unlocked!'}
                      </span>
                      <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle);">Written ${letter.writeDate}</span>
                    </div>

                    <h3 style="font-size: 1.125rem; font-family: var(--font-display);">${escapeHtml(letter.title)}</h3>

                    ${!isLocked ? `
                      <p style="font-size: 0.8125rem; line-height: 1.6; color: var(--os-text); white-space: pre-wrap; margin-top: var(--space-3); border-top: 1px solid var(--os-border); padding-top: var(--space-3);">
                        ${escapeHtml(letter.letter)}
                      </p>
                    ` : `
                      <div style="padding: var(--space-6) 0; text-align: center; color: var(--os-text-muted); font-size: 0.8125rem;">
                        This letter is locked in the time capsule until <strong>${letter.unlockDate}</strong>.
                      </div>
                    `}
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--os-border); padding-top: var(--space-3); font-size: 0.6875rem; color: var(--os-text-subtle);">
                    <span>Unlocks on ${letter.unlockDate}</span>
                    <button class="btn btn-ghost btn-xs" data-delete-letter="${letter.id}">Delete</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  init(container) {
    const addBtn = container.querySelector('#btn-write-letter');
    addBtn?.addEventListener('click', () => {
      const title = prompt("Letter title (e.g. End of Semester Reflection):");
      if (!title) return;
      const letter = prompt("Write your letter to future you:");
      if (!letter) return;

      const unlockDate = prompt("Unlock Date (YYYY-MM-DD):", new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const newLetter = {
        id: `fl-${Date.now()}`,
        title: title.trim(),
        writeDate: new Date().toISOString().split('T')[0],
        unlockDate: unlockDate || "2027-01-01",
        letter: letter.trim(),
        unlocked: false
      };

      store.state.futureLetters = [newLetter, ...(store.state.futureLetters || [])];
      store.save();
      awardXP(50, `Sealed letter to future self: ${title}`);
      container.innerHTML = this.render();
      this.init(container);
    });

    container.querySelectorAll('[data-delete-letter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-letter');
        soundService.playClick();
        store.state.futureLetters = (store.state.futureLetters || []).filter(l => l.id !== id);
        store.save();
        container.innerHTML = this.render();
        this.init(container);
      });
    });
  },

  destroy() {}
};

export default futureMeApp;
