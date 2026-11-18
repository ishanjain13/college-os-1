// COLLEGE OS - App: Vision Board & Visual Affirmations

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';

export const visionApp = {
  id: 'vision',
  title: 'Vision Board',
  icon: 'sparkles',

  render() {
    const state = store.get();
    const items = state.visionItems || [];

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Vision Board &amp; North Star Affirmations</h2>
            <p>Clarify your aspirational trajectory. Visualize the reality you are actively building.</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-add-vision">
            ${getIcon('plus', 'w-3.5 h-3.5')} Add Vision Tile
          </button>
        </div>

        <!-- Vision Tiles Grid -->
        <div class="app-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-4);">
            ${items.map(item => `
              <div class="card" style="border-top: 4px solid ${item.color || 'var(--os-accent)'}; display: flex; flex-direction: column; justify-content: space-between; min-height: 160px;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <span style="font-size: 1.5rem;">${item.emoji || '✨'}</span>
                    <button class="btn btn-ghost btn-xs" data-delete-vision="${item.id}">×</button>
                  </div>
                  <h3 style="font-size: 1.0625rem; font-family: var(--font-display); line-height: 1.4;">${escapeHtml(item.text)}</h3>
                </div>
                <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase;">
                  ${escapeHtml(item.type || 'Standard')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  init(container) {
    const addBtn = container.querySelector('#btn-add-vision');
    addBtn?.addEventListener('click', () => {
      const text = prompt("Enter vision statement or goal affirmation:");
      if (text && text.trim()) {
        const newItem = {
          id: `vi-${Date.now()}`,
          text: text.trim(),
          type: "goal",
          emoji: "🚀",
          color: "#6366f1"
        };
        store.state.visionItems = [newItem, ...(store.state.visionItems || [])];
        store.save();
        awardXP(30, `Vision item added: ${text}`);
        container.innerHTML = this.render();
        this.init(container);
      }
    });

    container.querySelectorAll('[data-delete-vision]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-vision');
        soundService.playClick();
        store.state.visionItems = (store.state.visionItems || []).filter(v => v.id !== id);
        store.save();
        container.innerHTML = this.render();
        this.init(container);
      });
    });
  },

  destroy() {}
};

export default visionApp;
