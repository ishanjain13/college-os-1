// COLLEGE OS - App: Habit Tracker (Streaks, Protocols, 90-Day Matrix, Numeric Logs & Streak Freezes)

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

export const habitsApp = {
  id: 'habits',
  title: 'Habit Tracker',
  icon: 'check-circle',
  selectedCategory: 'All',
  searchQuery: '',
  showArchived: false,

  render() {
    const state = store.get();
    const todayStr = new Date().toISOString().split('T')[0];
    const categories = ['All', 'Academic', 'Skills', 'Fitness', 'Health', 'Personal'];

    const habits = (state.habits || []).filter(h => {
      if (this.showArchived) return h.archived === true;
      if (h.archived) return false;
      if (this.selectedCategory !== 'All' && h.category !== this.selectedCategory) return false;
      if (this.searchQuery && !h.name.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
      return true;
    });

    const activeHabits = (state.habits || []).filter(h => !h.archived);
    const completedToday = activeHabits.filter(h => {
      const log = h.completedLogs?.[todayStr];
      return log !== undefined && log >= (h.target || 1);
    }).length;
    const totalHabits = activeHabits.length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    // Past 7 days array
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past7Days.push(d.toISOString().split('T')[0]);
    }

    // Heatmap aggregate data
    const heatmapData = {};
    (state.habits || []).forEach(h => {
      if (h.completedLogs) {
        Object.entries(h.completedLogs).forEach(([dateStr, val]) => {
          if (val > 0) {
            heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
          }
        });
      }
    });

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Habit Protocols &amp; Streaks</h2>
            <p>Consistency is identity. Build compounding momentum every single day.</p>
          </div>
          <div style="display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap;">
            <div style="background: var(--os-bg-subtle); padding: 6px 12px; border-radius: var(--radius-md); border: 1px solid var(--os-border); font-family: var(--font-mono); font-size: 0.75rem; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 4px;">
              ${getIcon('flame', 'w-4 h-4')} ${state.profile.streak || 0}d System Streak
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-toggle-archived">
              ${this.showArchived ? 'Show Active' : 'Archived'}
            </button>
            <button class="btn btn-primary btn-sm" id="btn-add-habit">
              ${getIcon('plus', 'w-3.5 h-3.5')} New Habit Protocol
            </button>
          </div>
        </div>

        <!-- Filter bar & daily score -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
          <div style="display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap; flex: 1;">
            <div class="tab-list">
              ${categories.map(cat => `
                <button class="tab-btn ${this.selectedCategory === cat ? 'active' : ''}" data-cat="${cat}">
                  ${cat}
                </button>
              `).join('')}
            </div>
            <div class="input-wrapper" style="width: 180px;">
              <input type="text" id="habit-search-input" class="form-input" placeholder="Search habits..." value="${escapeHtml(this.searchQuery)}" style="padding: 4px 8px; font-size: 0.75rem;" />
            </div>
          </div>
          <div style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--os-text-muted);">
            Today's Score: <strong style="color: var(--os-success); font-size: 0.875rem;">${completedToday} / ${totalHabits}</strong> (${completionRate}%)
          </div>
        </div>

        <!-- 90-Day Visual Momentum Heatmap -->
        <div class="card" style="padding: var(--space-3) var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--os-text); font-family: var(--font-mono); text-transform: uppercase;">
              90-Day Habit Completion Matrix
            </span>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Real completed logs</span>
          </div>
          ${ui.chart.heatmap({ data: heatmapData, days: 84 })}
        </div>

        <!-- Habit List -->
        <div class="app-body">
          ${habits.length === 0 ? ui.emptyState({
      icon: 'check-circle',
      title: this.showArchived ? 'No archived habits' : 'No habit protocols active',
      description: this.showArchived ? 'Active habits you archive will be kept here.' : 'Add your first daily habit to start building positive feedback loops and earning XP.',
      actionText: this.showArchived ? '' : 'Create First Habit Protocol',
      actionId: 'btn-empty-add-habit'
    }) : `
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${habits.map(h => {
      const currentVal = h.completedLogs?.[todayStr] || 0;
      const target = h.target || 1;
      const isDone = currentVal >= target;
      const isSkipped = h.skippedDates?.includes(todayStr);

      return `
                  <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4); border-left: 3px solid ${h.color || 'var(--os-accent)'};">
                    <div style="display: flex; align-items: center; gap: var(--space-3); min-width: 240px; flex: 1;">
                      <button class="habit-check-btn ${isDone ? 'checked' : ''}" data-toggle-habit="${h.id}" title="${isDone ? 'Mark Incomplete' : 'Complete Habit'}" style="flex-shrink: 0;">
                        ${isDone ? getIcon('check', 'w-3.5 h-3.5') : ''}
                      </button>
                      <div style="min-width: 0;">
                        <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
                          <h4 style="font-size: 0.9375rem; text-decoration: ${isDone ? 'line-through' : 'none'}; color: ${isDone ? 'var(--os-text-muted)' : 'var(--os-text)'};">
                            ${escapeHtml(h.name)}
                          </h4>
                          <span class="badge badge-primary">${escapeHtml(h.category)}</span>
                          ${isSkipped ? '<span class="badge badge-warning">Streak Frozen</span>' : ''}
                        </div>
                        <div style="font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: 2px; font-family: var(--font-mono);">
                          ${h.type === 'number' || h.type === 'duration' ? `
                            Logged Today: <strong style="color: var(--os-text);">${currentVal} / ${target} ${escapeHtml(h.unit)}</strong> • 
                          ` : `Target: ${target} ${escapeHtml(h.unit)} • `}
                          Frequency: ${escapeHtml(h.frequency)} • +${h.xp || 35} XP
                        </div>
                      </div>
                    </div>

                    <!-- 7-day completion dots, streak & actions -->
                    <div style="display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap;">
                      <div style="display: flex; gap: 4px;" title="Last 7 days completion history">
                        ${past7Days.map(d => {
        const done = (h.completedLogs?.[d] || 0) >= target;
        const frozen = h.skippedDates?.includes(d);
        return `
                            <div style="width: 11px; height: 11px; border-radius: var(--radius-full); background: ${frozen ? 'var(--os-warning)' : done ? 'var(--os-success)' : 'rgba(255,255,255,0.1)'};" title="${d}: ${frozen ? 'Streak Freeze' : done ? 'Completed' : 'Missed'}"></div>
                          `;
      }).join('')}
                      </div>

                      <div style="text-align: right; min-width: 65px;">
                        <div style="font-family: var(--font-mono); font-size: 0.875rem; font-weight: 800; color: #f59e0b; display: flex; align-items: center; justify-content: flex-end; gap: 2px;">
                          ${getIcon('flame', 'w-3.5 h-3.5')} ${h.currentStreak || 0}d
                        </div>
                        <div style="font-size: 0.625rem; color: var(--os-text-subtle);">Best: ${h.longestStreak || 0}d</div>
                      </div>

                      <div style="display: flex; gap: 4px;">
                        ${h.type !== 'checkbox' ? `
                          <button class="btn btn-secondary btn-xs" data-log-value="${h.id}" title="Log Value">
                            + Log
                          </button>
                        ` : ''}
                        <button class="btn btn-ghost btn-xs" data-freeze-habit="${h.id}" title="Freeze streak for today">
                          ${getIcon('snowflake', 'w-3.5 h-3.5')}
                        </button>
                        <button class="btn btn-ghost btn-xs" data-edit-habit="${h.id}" title="Edit Protocol">
                          ${getIcon('edit-2', 'w-3.5 h-3.5')}
                        </button>
                        <button class="btn btn-ghost btn-xs" data-delete-habit="${h.id}" title="Delete Protocol">
                          ${getIcon('trash-2', 'w-3.5 h-3.5')}
                        </button>
                      </div>
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
    // Category tabs
    container.querySelectorAll('.tab-btn[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        this.selectedCategory = btn.getAttribute('data-cat');
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Search input
    const searchInput = container.querySelector('#habit-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      container.innerHTML = this.render();
      this.init(container);
      const newSearch = container.querySelector('#habit-search-input');
      if (newSearch) {
        newSearch.focus();
        newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
      }
    });

    // Toggle archived view
    const toggleArchivedBtn = container.querySelector('#btn-toggle-archived');
    toggleArchivedBtn?.addEventListener('click', () => {
      soundService.playClick();
      this.showArchived = !this.showArchived;
      container.innerHTML = this.render();
      this.init(container);
    });

    // Toggle habit completion (one-click checkbox)
    container.querySelectorAll('[data-toggle-habit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-toggle-habit');
        const todayStr = new Date().toISOString().split('T')[0];

        store.setHabits(prev => prev.map(h => {
          if (h.id === id) {
            const currentVal = h.completedLogs?.[todayStr] || 0;
            const target = h.target || 1;
            const isDone = currentVal >= target;
            const newLogs = { ...(h.completedLogs || {}) };

            if (isDone) {
              delete newLogs[todayStr];
              return {
                ...h,
                completedLogs: newLogs,
                currentStreak: Math.max(0, (h.currentStreak || 1) - 1)
              };
            } else {
              newLogs[todayStr] = target;
              const newStreak = (h.currentStreak || 0) + 1;
              const newLongest = Math.max(h.longestStreak || 0, newStreak);

              logActivity({
                appId: 'habits',
                action: 'completed',
                title: `Completed Habit: ${h.name}`,
                details: `${target} ${h.unit} logged`,
                xpEarned: h.xp || 35,
                metadata: { habitId: h.id, date: todayStr }
              });

              ui.toast({
                title: 'Habit Completed!',
                message: `+${h.xp || 35} XP earned for ${h.name}`,
                type: 'success',
                action: {
                  label: 'Undo',
                  onClick: () => {
                    store.setHabits(p => p.map(hab => {
                      if (hab.id === h.id) {
                        const undoneLogs = { ...hab.completedLogs };
                        delete undoneLogs[todayStr];
                        return { ...hab, completedLogs: undoneLogs, currentStreak: Math.max(0, hab.currentStreak - 1) };
                      }
                      return hab;
                    }));
                  }
                }
              });

              return {
                ...h,
                completedLogs: newLogs,
                currentStreak: newStreak,
                longestStreak: newLongest
              };
            }
          }
          return h;
        }));

        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Log numerical value modal
    container.querySelectorAll('[data-log-value]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-log-value');
        const habit = store.get().habits.find(h => h.id === id);
        if (!habit) return;
        const todayStr = new Date().toISOString().split('T')[0];
        const currentVal = habit.completedLogs?.[todayStr] || 0;

        ui.modal({
          title: `Log ${escapeHtml(habit.name)}`,
          width: '380px',
          contentHtml: `
            <div class="form-group">
              <label class="form-label">Amount Completed Today (${escapeHtml(habit.unit)})</label>
              <input type="number" step="any" id="modal-log-val" class="form-input" value="${currentVal}" />
              <span class="form-help">Daily target: ${habit.target} ${escapeHtml(habit.unit)}</span>
            </div>
          `,
          confirmText: 'Save Log',
          onConfirm: (modalEl) => {
            const entered = Number(modalEl.querySelector('#modal-log-val')?.value) || 0;
            store.setHabits(prev => prev.map(h => {
              if (h.id === id) {
                const newLogs = { ...(h.completedLogs || {}), [todayStr]: entered };
                const reached = entered >= (h.target || 1);
                if (reached && currentVal < (h.target || 1)) {
                  logActivity({
                    appId: 'habits',
                    action: 'completed',
                    title: `Completed Habit: ${h.name}`,
                    details: `${entered} / ${h.target} ${h.unit} logged`,
                    xpEarned: h.xp || 35,
                    metadata: { habitId: h.id, date: todayStr }
                  });
                }
                return {
                  ...h,
                  completedLogs: newLogs,
                  currentStreak: reached ? Math.max(h.currentStreak || 0, 1) : h.currentStreak
                };
              }
              return h;
            }));
            ui.toast({ title: 'Progress Logged', message: `${entered} ${habit.unit} recorded for today.`, type: 'success' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });

    // Freeze streak
    container.querySelectorAll('[data-freeze-habit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-freeze-habit');
        const habit = store.get().habits.find(h => h.id === id);
        if (!habit) return;
        const todayStr = new Date().toISOString().split('T')[0];
        const isFrozen = habit.skippedDates?.includes(todayStr);

        store.setHabits(prev => prev.map(h => {
          if (h.id === id) {
            const newSkipped = isFrozen
              ? (h.skippedDates || []).filter(d => d !== todayStr)
              : [...(h.skippedDates || []), todayStr];
            return { ...h, skippedDates: newSkipped };
          }
          return h;
        }));

        soundService.playClick();
        ui.toast({
          title: isFrozen ? 'Freeze Removed' : 'Streak Frozen',
          message: isFrozen ? 'Habit is back on normal tracking.' : 'Your streak is protected for today.',
          type: 'info'
        });
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Delete habit
    container.querySelectorAll('[data-delete-habit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-habit');
        const habit = store.get().habits.find(h => h.id === id);
        ui.confirm({
          title: 'Delete Habit Protocol?',
          message: `Are you sure you want to delete "${habit?.name || 'this habit'}"? All logged streaks and history will be permanently deleted.`,
          confirmText: 'Delete Protocol',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            store.setHabits(prev => prev.filter(h => h.id !== id));
            ui.toast({ title: 'Habit Deleted', message: 'Protocol removed.', type: 'info' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });

    // Edit habit modal
    container.querySelectorAll('[data-edit-habit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-habit');
        const habit = store.get().habits.find(h => h.id === id);
        if (habit) this.openHabitModal(habit, container);
      });
    });

    // Add Habit button
    const addBtn = container.querySelector('#btn-add-habit');
    addBtn?.addEventListener('click', () => this.openHabitModal(null, container));

    const emptyAddBtn = container.querySelector('#btn-empty-add-habit');
    emptyAddBtn?.addEventListener('click', () => this.openHabitModal(null, container));
  },

  openHabitModal(existingHabit, container) {
    const isEdit = Boolean(existingHabit);
    const habit = existingHabit || {
      name: '',
      category: 'Academic',
      type: 'checkbox',
      target: 1,
      unit: 'times',
      xp: 35,
      frequency: 'daily',
      color: '#6366f1',
      notes: ''
    };

    ui.modal({
      title: isEdit ? 'Edit Habit Protocol' : 'Create New Habit Protocol',
      width: '480px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Habit Name *</label>
          <input type="text" id="habit-name-input" class="form-input" placeholder="e.g. 90-Min Morning Focus Block" value="${escapeHtml(habit.name)}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="habit-category-select" class="form-select">
              ${['Academic', 'Skills', 'Fitness', 'Health', 'Personal'].map(c => `
                <option value="${c}" ${habit.category === c ? 'selected' : ''}>${c}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Habit Type</label>
            <select id="habit-type-select" class="form-select">
              <option value="checkbox" ${habit.type === 'checkbox' ? 'selected' : ''}>Simple Checkbox</option>
              <option value="duration" ${habit.type === 'duration' ? 'selected' : ''}>Duration (Time)</option>
              <option value="number" ${habit.type === 'number' ? 'selected' : ''}>Numeric Target</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Daily Target</label>
            <input type="number" id="habit-target-input" class="form-input" value="${habit.target || 1}" min="1" step="any" />
          </div>
          <div class="form-group">
            <label class="form-label">Unit of Measurement</label>
            <input type="text" id="habit-unit-input" class="form-input" placeholder="e.g. mins, pages, L, sessions" value="${escapeHtml(habit.unit || 'times')}" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Frequency</label>
            <select id="habit-freq-select" class="form-select">
              <option value="daily" ${habit.frequency === 'daily' ? 'selected' : ''}>Daily</option>
              <option value="weekdays" ${habit.frequency === 'weekdays' ? 'selected' : ''}>Weekdays Only</option>
              <option value="weekends" ${habit.frequency === 'weekends' ? 'selected' : ''}>Weekends Only</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">XP Reward</label>
            <input type="number" id="habit-xp-input" class="form-input" value="${habit.xp || 35}" min="10" max="200" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Protocol Notes / Implementation Intentions</label>
          <textarea id="habit-notes-input" class="form-textarea" placeholder="When, where, and how will you execute this?">${escapeHtml(habit.notes || '')}</textarea>
        </div>
      `,
      confirmText: isEdit ? 'Save Changes' : 'Establish Protocol',
      onConfirm: (modalEl) => {
        const name = modalEl.querySelector('#habit-name-input')?.value.trim();
        if (!name) {
          ui.toast({ title: 'Validation Error', message: 'Habit name is required.', type: 'error' });
          return false;
        }

        const category = modalEl.querySelector('#habit-category-select')?.value;
        const type = modalEl.querySelector('#habit-type-select')?.value;
        const target = Number(modalEl.querySelector('#habit-target-input')?.value) || 1;
        const unit = modalEl.querySelector('#habit-unit-input')?.value.trim() || 'times';
        const frequency = modalEl.querySelector('#habit-freq-select')?.value;
        const xp = Number(modalEl.querySelector('#habit-xp-input')?.value) || 35;
        const notes = modalEl.querySelector('#habit-notes-input')?.value.trim() || '';

        if (isEdit) {
          store.setHabits(prev => prev.map(h => {
            if (h.id === habit.id) {
              return { ...h, name, category, type, target, unit, frequency, xp, notes };
            }
            return h;
          }));
          ui.toast({ title: 'Habit Updated', message: `Changes saved for ${name}.`, type: 'success' });
        } else {
          const newHabit = {
            id: `h-${Date.now()}`,
            name,
            category,
            type,
            target,
            unit,
            xp,
            frequency,
            notes,
            color: category === 'Academic' ? '#6366f1' : category === 'Skills' ? '#06b6d4' : category === 'Fitness' ? '#10b981' : category === 'Health' ? '#38bdf8' : '#a855f7',
            currentStreak: 0,
            longestStreak: 0,
            active: true,
            completedLogs: {},
            skippedDates: []
          };
          store.setHabits(prev => [newHabit, ...prev]);
          logActivity({
            appId: 'habits',
            action: 'created',
            title: `New Habit Established: ${name}`,
            details: `Target: ${target} ${unit} (${frequency})`,
            xpEarned: 30
          });
          ui.toast({ title: 'Habit Established', message: `+30 XP awarded for establishing ${name}!`, type: 'success' });
        }

        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  destroy() { }
};

export default habitsApp;
