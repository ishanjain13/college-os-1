// COLLEGE OS - App: Daily Planner & Kanban Board

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';

export const plannerApp = {
  id: 'planner',
  title: 'Daily Planner & Kanban',
  icon: 'calendar',

  render() {
    const state = store.get();
    const columns = ['To Do', 'In Progress', 'Done'];

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Daily Planner &amp; Kanban Execution</h2>
            <p>High-agency task pipelines. Drag, prioritize, and crush friction.</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-add-kanban">
            ${getIcon('plus', 'w-3.5 h-3.5')} New Task Card
          </button>
        </div>

        <!-- Kanban 3-Column Board -->
        <div class="kanban-board">
          ${columns.map(col => {
            const cards = (state.kanbanCards || []).filter(c => c.column === col);
            return `
              <div class="kanban-col" data-col="${col}">
                <div class="kanban-col-header">
                  <span>${col}</span>
                  <span class="badge badge-primary">${cards.length}</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: var(--space-2-5); flex: 1;">
                  ${cards.map(card => `
                    <div class="kanban-card-item" data-card-id="${card.id}">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-2);">
                        <span style="font-weight: 700; font-size: 0.8125rem; color: var(--os-text);">${escapeHtml(card.title)}</span>
                        <span class="badge ${card.priority === 'high' ? 'badge-error' : 'badge-warning'}">${card.priority}</span>
                      </div>

                      <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                        ${(card.labels || []).map(l => `
                          <span style="font-size: 0.625rem; font-family: var(--font-mono); color: var(--os-text-subtle); background: var(--os-bg-subtle); padding: 2px 6px; border-radius: 4px;">${escapeHtml(l)}</span>
                        `).join('')}
                      </div>

                      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--os-border); padding-top: 6px; margin-top: 2px; font-size: 0.6875rem;">
                        <span style="color: var(--os-text-subtle); font-family: var(--font-mono);">Due ${card.deadline || 'Today'}</span>
                        <div style="display: flex; gap: 4px;">
                          ${col !== 'Done' ? `
                            <button class="btn btn-ghost btn-xs" data-move-next="${card.id}" title="Advance Column">→</button>
                          ` : `
                            <span style="color: var(--os-success); font-weight: 700;">✓ Done</span>
                          `}
                          <button class="btn btn-ghost btn-xs" data-delete-card="${card.id}" title="Delete Task">×</button>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  init(container) {
    // Add task button
    const addBtn = container.querySelector('#btn-add-kanban');
    addBtn?.addEventListener('click', () => {
      const title = prompt("Enter task title:");
      if (title && title.trim()) {
        const newCard = {
          id: `kc-${Date.now()}`,
          title: title.trim(),
          column: 'To Do',
          priority: 'high',
          deadline: new Date().toISOString().split('T')[0],
          labels: ['Task']
        };
        store.setKanbanCards(prev => [newCard, ...prev]);
        awardXP(20, `Created task: ${title}`);
        container.innerHTML = this.render();
        this.init(container);
      }
    });

    // Move to next column
    container.querySelectorAll('[data-move-next]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-move-next');
        store.setKanbanCards(prev => prev.map(c => {
          if (c.id === id) {
            const nextCol = c.column === 'To Do' ? 'In Progress' : 'Done';
            if (nextCol === 'Done') {
              awardXP(30, `Task completed: ${c.title}`, e.clientX, e.clientY);
            }
            return { ...c, column: nextCol };
          }
          return c;
        }));
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Delete task
    container.querySelectorAll('[data-delete-card]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-card');
        soundService.playClick();
        store.setKanbanCards(prev => prev.filter(c => c.id !== id));
        container.innerHTML = this.render();
        this.init(container);
      });
    });
  },

  destroy() {}
};

export default plannerApp;
