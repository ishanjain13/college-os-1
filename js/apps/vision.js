// COLLEGE OS - App: Vision Board & Visual Affirmations

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

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
          ${items.length === 0 ? ui.emptyState({
            icon: 'sparkles',
            title: 'No vision tiles defined',
            description: 'Define visual standards, dream projects, and mindset quotes to keep your compass pointed true.',
            actionText: 'Add First Vision Tile',
            actionId: 'btn-empty-add-vision'
          }) : `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-4);">
              ${items.map(item => `
                <div class="card" style="border-top: 4px solid ${item.color || 'var(--os-accent)'}; display: flex; flex-direction: column; justify-content: space-between; min-height: 160px;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                      <span style="font-size: 1.75rem;">${item.emoji || '✨'}</span>
                      <button class="btn btn-ghost btn-xs" data-delete-vision="${item.id}">×</button>
                    </div>
                    <h3 style="font-size: 1.0625rem; font-family: var(--font-display); line-height: 1.4; color: var(--os-text);">
                      ${escapeHtml(item.text)}
                    </h3>
                  </div>
                  <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; margin-top: var(--space-3); border-top: 1px solid var(--os-border-subtle); padding-top: var(--space-2);">
                    ${escapeHtml(item.type || 'Standard')}
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
    const openVisionModal = () => {
      const emojis = ['🎙️', '🌿', '🚀', '⚡', '🏆', '🧠', '💻', '🌍', '🏔️', '📚'];
      ui.modal({
        title: 'Add Vision Statement or Affirmation',
        width: '420px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Vision Statement *</label>
            <textarea id="modal-vision-text" class="form-textarea" placeholder="e.g. Lead an autonomous robotics lab and author top papers" style="min-height: 80px;"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select id="modal-vision-type" class="form-select">
                <option value="North Star Goal">North Star Goal</option>
                <option value="Affirmation">Affirmation</option>
                <option value="Core Quote">Core Quote</option>
                <option value="Lifestyle">Lifestyle Standard</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Icon Emoji</label>
              <select id="modal-vision-emoji" class="form-select">
                ${emojis.map(e => `<option value="${e}">${e}</option>`).join('')}
              </select>
            </div>
          </div>
        `,
        confirmText: 'Add to Board (+30 XP)',
        onConfirm: (modalEl) => {
          const text = modalEl.querySelector('#modal-vision-text')?.value.trim();
          if (!text) return false;
          const type = modalEl.querySelector('#modal-vision-type')?.value;
          const emoji = modalEl.querySelector('#modal-vision-emoji')?.value;

          const newItem = {
            id: `vi-${Date.now()}`,
            text,
            type,
            emoji,
            color: type === 'North Star Goal' ? '#6366f1' : type === 'Affirmation' ? '#10b981' : type === 'Core Quote' ? '#f59e0b' : '#ec4899'
          };

          store.setVisionItems(prev => [newItem, ...(prev || [])]);
          logActivity({
            appId: 'vision',
            action: 'tile_added',
            title: `Added Vision Tile: ${text.slice(0, 32)}...`,
            details: `Type: ${type}`,
            xpEarned: 30
          });

          ui.toast({ title: 'Vision Set', message: `+30 XP for defining your aspirations!`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    };

    container.querySelector('#btn-add-vision')?.addEventListener('click', openVisionModal);
    container.querySelector('#btn-empty-add-vision')?.addEventListener('click', openVisionModal);

    container.querySelectorAll('[data-delete-vision]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-vision');
        store.setVisionItems(prev => (prev || []).filter(v => v.id !== id));
        container.innerHTML = this.render();
        this.init(container);
      });
    });
  },

  destroy() {}
};

export default visionApp;
