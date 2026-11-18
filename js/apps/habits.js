// COLLEGE OS - App: Habit Tracker (Streaks, Protocols, 7-Day Matrix, Freeze Days)

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';

export const habitsApp = {
  id: 'habits',
  title: 'Habit Tracker',
  icon: 'check-circle',
  selectedCategory: 'All',

  render() {
    const state = store.get();
    const todayStr = new Date().toISOString().split('T')[0];
    const categories = ['All', 'Academic', 'Skills', 'Fitness', 'Health', 'Personal'];

    const filteredHabits = (state.habits || []).filter(h =>
      this.selectedCategory === 'All' || h.category === this.selectedCategory
    );

    const completedToday = (state.habits || []).filter(h => h.completedDates?.includes(todayStr)).length;
    const totalHabits = (state.habits || []).length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    // Past 7 days array
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past7Days.push(d.toISOString().split('T')[0]);
    }

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Habit Protocols &amp; Streaks</h2>
            <p>Consistency is identity. Build compounding momentum every single day.</p>
          </div>
          <div style="display: flex; gap: var(--space-2); align-items: center;">
            <div style="background: var(--os-bg-subtle); padding: 6px 12px; border-radius: var(--radius-md); border: 1px solid var(--os-border); font-family: var(--font-mono); font-size: 0.75rem; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 4px;">
              ${getIcon('flame', 'w-4 h-4')} ${state.profile.streak}d Streak Active
            </div>
            <button class="btn btn-primary btn-sm" id="btn-add-habit">
              ${getIcon('plus', 'w-3.5 h-3.5')} New Habit
            </button>
          </div>
        </div>

        <!-- Filter bar & daily score -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
          <div class="tab-list">
            ${categories.map(cat => `
              <button class="tab-btn ${this.selectedCategory === cat ? 'active' : ''}" data-cat="${cat}">
                ${cat}
              </button>
            `).join('')}
          </div>
          <div style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--os-text-muted);">
            Today's Score: <strong style="color: var(--os-success); font-size: 0.875rem;">${completedToday} / ${totalHabits}</strong> (${completionRate}%)
          </div>
        </div>

        <!-- Habit List -->
        <div class="app-body">
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${filteredHabits.map(h => {
              const isDone = h.completedDates?.includes(todayStr);
              return `
                <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
                  <div style="display: flex; align-items: center; gap: var(--space-4); min-width: 240px; flex: 1;">
                    <button class="habit-check-btn ${isDone ? 'checked' : ''}" data-toggle-habit="${h.id}" title="${isDone ? 'Mark Incomplete' : 'Complete Habit'}">
                      ${isDone ? getIcon('check', 'w-3.5 h-3.5') : ''}
                    </button>
                    <div>
                      <div style="display: flex; align-items: center; gap: var(--space-2);">
                        <h4 style="font-size: 0.9375rem; text-decoration: ${isDone ? 'line-through' : 'none'}; color: ${isDone ? 'var(--os-text-muted)' : 'var(--os-text)'};">
                          ${escapeHtml(h.name)}
                        </h4>
                        <span class="badge badge-primary">${escapeHtml(h.category)}</span>
                      </div>
                      <div style="font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: 2px; font-family: var(--font-mono);">
                        Target: ${h.target} ${h.unit} • Frequency: ${h.frequency} • +${h.xp || 35} XP
                      </div>
                    </div>
                  </div>

                  <!-- 7-day completion dots & streak -->
                  <div style="display: flex; align-items: center; gap: var(--space-6);">
                    <div style="display: flex; gap: 4px;" title="Last 7 days history">
                      ${past7Days.map(d => {
                        const done = h.completedDates?.includes(d);
                        return `
                          <div style="width: 10px; height: 10px; border-radius: var(--radius-full); background: ${done ? 'var(--os-success)' : 'rgba(255,255,255,0.1)'};" title="${d}"></div>
                        `;
                      }).join('')}
                    </div>

                    <div style="text-align: right; min-width: 65px;">
                      <div style="font-family: var(--font-mono); font-size: 0.875rem; font-weight: 800; color: #f59e0b; display: flex; align-items: center; justify-content: flex-end; gap: 2px;">
                        ${getIcon('flame', 'w-3.5 h-3.5')} ${h.currentStreak || 0}d
                      </div>
                      <div style="font-size: 0.625rem; color: var(--os-text-subtle);">Best: ${h.longestStreak || 0}d</div>
                    </div>

                    <button class="btn btn-ghost btn-xs" data-delete-habit="${h.id}" title="Delete Habit">
                      ${getIcon('trash-2', 'w-3.5 h-3.5')}
                    </button>
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
    // Category tabs
    container.querySelectorAll('.tab-btn[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        this.selectedCategory = btn.getAttribute('data-cat');
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Toggle habit completion
    container.querySelectorAll('[data-toggle-habit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-toggle-habit');
        const todayStr = new Date().toISOString().split('T')[0];

        store.setHabits(prev => prev.map(h => {
          if (h.id === id) {
            const isDone = h.completedDates?.includes(todayStr);
            const newDates = isDone
              ? h.completedDates.filter(d => d !== todayStr)
              : [...(h.completedDates || []), todayStr];

            if (!isDone) {
              awardXP(h.xp || 35, `Habit completed: ${h.name}`, e.clientX, e.clientY);
            }
            return {
              ...h,
              completedDates: newDates,
              currentStreak: isDone ? Math.max(0, h.currentStreak - 1) : h.currentStreak + 1
            };
          }
          return h;
        }));

        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Delete habit
    container.querySelectorAll('[data-delete-habit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-habit');
        if (confirm("Delete this habit protocol?")) {
          soundService.playClick();
          store.setHabits(prev => prev.filter(h => h.id !== id));
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    // Add Habit button
    const addBtn = container.querySelector('#btn-add-habit');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const name = prompt("Enter new habit protocol name:");
        if (name && name.trim()) {
          const newHabit = {
            id: `h-${Date.now()}`,
            name: name.trim(),
            category: 'Personal',
            type: 'checkbox',
            target: 1,
            unit: 'session',
            xp: 35,
            frequency: 'daily',
            currentStreak: 0,
            longestStreak: 0,
            active: true,
            completedDates: []
          };
          store.setHabits(prev => [newHabit, ...prev]);
          awardXP(30, `New habit established: ${name}`);
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    }
  },

  destroy() {}
};

export default habitsApp;
