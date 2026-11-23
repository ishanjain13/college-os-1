// COLLEGE OS - App: Goals & Roadmap (Milestones, Progress Tracking, Quotas & Real Progress Logs)

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml, getDaysLeft } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

export const goalsApp = {
  id: 'goals',
  title: 'Goals & Roadmap',
  icon: 'target',
  selectedCategory: 'All',
  searchQuery: '',
  expandedGoalId: null,

  render() {
    const state = store.get();
    const categories = ['All', 'Academic', 'Career', 'Fitness', 'Personal'];

    const filteredGoals = (state.goals || []).filter(g => {
      if (this.selectedCategory !== 'All' && g.category !== this.selectedCategory) return false;
      if (this.searchQuery && !g.name.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
      return true;
    });

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Goals &amp; Strategic Roadmap</h2>
            <p>Milestone-driven execution for the semester's highest-leverage targets.</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-add-goal">
            ${getIcon('plus', 'w-3.5 h-3.5')} Define Goal
          </button>
        </div>

        <!-- Filter and search bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
          <div class="tab-list">
            ${categories.map(cat => `
              <button class="tab-btn ${this.selectedCategory === cat ? 'active' : ''}" data-goal-cat="${cat}">
                ${cat}
              </button>
            `).join('')}
          </div>
          <div class="input-wrapper" style="width: 220px;">
            <input type="text" id="goal-search-input" class="form-input" placeholder="Search roadmap goals..." value="${escapeHtml(this.searchQuery)}" style="padding: 4px 8px; font-size: 0.75rem;" />
          </div>
        </div>

        <!-- Goals Cards Grid -->
        <div class="app-body">
          ${filteredGoals.length === 0 ? ui.emptyState({
            icon: 'target',
            title: 'No goals found',
            description: 'Define your strategic semester goals with deadlines, numerical targets, and trackable milestones.',
            actionText: 'Define Your First Goal',
            actionId: 'btn-empty-add-goal'
          }) : `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: var(--space-4);">
              ${filteredGoals.map(g => {
                const current = Number(g.currentValue) || 0;
                const target = Number(g.targetValue) || 1;
                const pct = Math.min(100, Math.round((current / target) * 100)) || 0;
                const days = getDaysLeft(g.deadline);
                const isExpanded = this.expandedGoalId === g.id;

                // Format progress logs for chart
                const chartData = (g.progressLogs || []).map(log => ({
                  label: log.date ? log.date.split('-').slice(1).join('/') : '',
                  value: Number(log.value) || 0
                }));

                return `
                  <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-3); border-top: 3px solid ${g.color || 'var(--os-accent)'};">
                    <div>
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-2);">
                        <div>
                          <div style="display: flex; gap: var(--space-1-5); align-items: center; margin-bottom: 4px; flex-wrap: wrap;">
                            <span class="badge badge-primary">${escapeHtml(g.category)}</span>
                            <span class="badge ${g.priority === 'high' ? 'badge-error' : 'badge-warning'}">${g.priority}</span>
                            ${pct >= 100 ? '<span class="badge badge-success">Conquered ✓</span>' : ''}
                          </div>
                          <h3 style="font-size: 1.0625rem; font-family: var(--font-display);">${escapeHtml(g.name)}</h3>
                        </div>
                        <div style="display: flex; align-items: center; gap: var(--space-2);">
                          <span class="badge ${pct >= 100 ? 'badge-success' : 'badge-primary'}" style="font-size: 0.75rem; padding: 4px 8px;">${pct}%</span>
                          <button class="btn btn-ghost btn-xs" data-edit-goal="${g.id}" title="Edit Goal">${getIcon('edit-2', 'w-3.5 h-3.5')}</button>
                          <button class="btn btn-ghost btn-xs" data-delete-goal="${g.id}" title="Delete Goal">${getIcon('trash-2', 'w-3.5 h-3.5')}</button>
                        </div>
                      </div>

                      <p style="font-size: 0.75rem; color: var(--os-text-muted); margin: var(--space-2) 0;">${escapeHtml(g.description || '')}</p>

                      <!-- Progress bar -->
                      <div style="margin-top: var(--space-3);">
                        <div class="progress-bar-container">
                          <div class="progress-bar-fill" style="width: ${pct}%; background: ${g.color || 'var(--os-accent)'};"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 0.6875rem; color: var(--os-text-subtle); font-family: var(--font-mono);">
                          <span>${current} / ${target} ${escapeHtml(g.unit)}</span>
                          <span>Due: ${g.deadline ? `${g.deadline} (${days !== null ? `${days}d left` : ''})` : 'Ongoing'}</span>
                        </div>
                      </div>

                      <!-- Progress History Chart (Toggleable or if has data) -->
                      ${chartData.length > 1 ? `
                        <div style="margin-top: var(--space-3); padding-top: var(--space-2); border-top: 1px solid var(--os-border-subtle);">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                            <span style="font-size: 0.6875rem; font-family: var(--font-mono); color: var(--os-text-subtle);">Progress History (${chartData.length} entries)</span>
                            <button class="btn btn-ghost btn-xs" data-toggle-chart="${g.id}" style="font-size: 0.625rem;">${isExpanded ? 'Hide Chart' : 'Show Trend'}</button>
                          </div>
                          ${isExpanded ? `
                            <div style="margin-top: 4px;">
                              ${ui.chart.line({ data: chartData, height: 110, strokeColor: g.color || 'var(--os-accent)' })}
                            </div>
                          ` : ''}
                        </div>
                      ` : ''}

                      <!-- Milestones list -->
                      <div style="margin-top: var(--space-4); border-top: 1px solid var(--os-border); padding-top: var(--space-3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                          <span style="font-size: 0.6875rem; font-family: var(--font-mono); color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">
                            Milestones (${(g.milestones || []).filter(m => m.completed).length}/${(g.milestones || []).length})
                          </span>
                          <button class="btn btn-ghost btn-xs" data-add-milestone="${g.id}">+ Add</button>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: var(--space-1-5);">
                          ${(g.milestones || []).map(m => `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 0; font-size: 0.75rem;">
                              <div style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; flex: 1;" data-toggle-milestone="${g.id}:${m.id}">
                                <div style="width: 14px; height: 14px; border-radius: var(--radius-xs); border: 1px solid ${m.completed ? 'var(--os-success)' : 'var(--os-border-light)'}; background: ${m.completed ? 'var(--os-success)' : 'transparent'}; display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0;">
                                  ${m.completed ? getIcon('check', 'w-2.5 h-2.5') : ''}
                                </div>
                                <span style="color: ${m.completed ? 'var(--os-text-muted)' : 'var(--os-text)'}; text-decoration: ${m.completed ? 'line-through' : 'none'};">
                                  ${escapeHtml(m.title)}
                                </span>
                              </div>
                              <button class="btn btn-ghost btn-xs" data-del-milestone="${g.id}:${m.id}" title="Remove milestone" style="opacity: 0.6; padding: 2px;">×</button>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    </div>

                    <!-- Footer with Log Progress -->
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--os-border); padding-top: var(--space-3); margin-top: var(--space-2);">
                      <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: #f59e0b; font-weight: 700;">+${g.xpReward || 500} XP</span>
                      <div style="display: flex; gap: var(--space-2);">
                        <button class="btn btn-primary btn-xs" data-log-progress="${g.id}">
                          ${getIcon('plus', 'w-3 h-3')} Log Progress
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
    container.querySelectorAll('.tab-btn[data-goal-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        this.selectedCategory = btn.getAttribute('data-goal-cat');
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Search input
    const searchInput = container.querySelector('#goal-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      container.innerHTML = this.render();
      this.init(container);
      const newSearch = container.querySelector('#goal-search-input');
      if (newSearch) {
        newSearch.focus();
        newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
      }
    });

    // Toggle chart visibility
    container.querySelectorAll('[data-toggle-chart]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-toggle-chart');
        this.expandedGoalId = this.expandedGoalId === id ? null : id;
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Milestone toggling
    container.querySelectorAll('[data-toggle-milestone]').forEach(row => {
      row.addEventListener('click', (e) => {
        const [goalId, milestoneId] = row.getAttribute('data-toggle-milestone').split(':');
        store.setGoals(prev => prev.map(g => {
          if (g.id === goalId) {
            const updatedMilestones = (g.milestones || []).map(m => {
              if (m.id === milestoneId) {
                const nextComp = !m.completed;
                if (nextComp) {
                  logActivity({
                    appId: 'goals',
                    action: 'milestone_completed',
                    title: `Milestone Achieved: ${m.title}`,
                    details: `Goal: ${g.name}`,
                    xpEarned: 100,
                    metadata: { goalId: g.id, milestoneId: m.id }
                  });
                  ui.toast({ title: 'Milestone Conquered!', message: `+100 XP awarded for ${m.title}`, type: 'success' });
                }
                return { ...m, completed: nextComp };
              }
              return m;
            });
            return { ...g, milestones: updatedMilestones };
          }
          return g;
        }));

        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Delete milestone
    container.querySelectorAll('[data-del-milestone]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [goalId, milestoneId] = btn.getAttribute('data-del-milestone').split(':');
        store.setGoals(prev => prev.map(g => {
          if (g.id === goalId) {
            return { ...g, milestones: (g.milestones || []).filter(m => m.id !== milestoneId) };
          }
          return g;
        }));
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Add milestone
    container.querySelectorAll('[data-add-milestone]').forEach(btn => {
      btn.addEventListener('click', () => {
        const goalId = btn.getAttribute('data-add-milestone');
        ui.modal({
          title: 'Add Goal Milestone',
          width: '380px',
          contentHtml: `
            <div class="form-group">
              <label class="form-label">Milestone Title</label>
              <input type="text" id="modal-milestone-title" class="form-input" placeholder="e.g. Build prototype demo" />
            </div>
          `,
          confirmText: 'Add Milestone',
          onConfirm: (modalEl) => {
            const title = modalEl.querySelector('#modal-milestone-title')?.value.trim();
            if (!title) return false;
            store.setGoals(prev => prev.map(g => {
              if (g.id === goalId) {
                const newM = { id: `m-${Date.now()}`, title, completed: false };
                return { ...g, milestones: [...(g.milestones || []), newM] };
              }
              return g;
            }));
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });

    // Log progress dialog
    container.querySelectorAll('[data-log-progress]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-log-progress');
        const goal = store.get().goals.find(g => g.id === id);
        if (!goal) return;

        ui.modal({
          title: `Log Progress: ${escapeHtml(goal.name)}`,
          width: '420px',
          contentHtml: `
            <div class="form-group">
              <label class="form-label">Current Progress Value (${escapeHtml(goal.unit)})</label>
              <input type="number" id="modal-log-val" class="form-input" value="${goal.currentValue || 0}" step="any" />
              <span class="form-help">Target is ${goal.targetValue} ${escapeHtml(goal.unit)}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Session Reflection / Progress Note</label>
              <input type="text" id="modal-log-note" class="form-input" placeholder="What progress did you accomplish?" />
            </div>
          `,
          confirmText: 'Record Progress',
          onConfirm: (modalEl) => {
            const val = Number(modalEl.querySelector('#modal-log-val')?.value) || 0;
            const note = modalEl.querySelector('#modal-log-note')?.value.trim() || 'Logged progress';
            const todayStr = new Date().toISOString().split('T')[0];

            store.setGoals(prev => prev.map(g => {
              if (g.id === id) {
                const updatedLogs = [...(g.progressLogs || []), { date: todayStr, value: val, note }];
                const wasCompleted = (g.currentValue || 0) >= g.targetValue;
                const isNowCompleted = val >= g.targetValue;

                if (!wasCompleted && isNowCompleted) {
                  logActivity({
                    appId: 'goals',
                    action: 'goal_completed',
                    title: `Goal Conquered: ${g.name}`,
                    details: `Reached target: ${val} / ${g.targetValue} ${g.unit}`,
                    xpEarned: g.xpReward || 500,
                    metadata: { goalId: g.id }
                  });
                  ui.toast({ title: 'Goal Conquered! 🏆', message: `+${g.xpReward || 500} XP awarded for crushing this goal!`, type: 'success' });
                } else {
                  logActivity({
                    appId: 'goals',
                    action: 'progress_logged',
                    title: `Progress on Goal: ${g.name}`,
                    details: `${val} ${g.unit} (${note})`,
                    xpEarned: 35,
                    metadata: { goalId: g.id }
                  });
                  ui.toast({ title: 'Progress Logged', message: `Updated to ${val} ${g.unit}.`, type: 'success' });
                }

                return {
                  ...g,
                  currentValue: val,
                  progressLogs: updatedLogs
                };
              }
              return g;
            }));

            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });

    // Delete goal
    container.querySelectorAll('[data-delete-goal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-goal');
        const goal = store.get().goals.find(g => g.id === id);
        ui.confirm({
          title: 'Delete Goal?',
          message: `Are you sure you want to delete "${goal?.name || 'this goal'}"? Its milestones and progress history will be removed.`,
          confirmText: 'Delete Goal',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            store.setGoals(prev => prev.filter(g => g.id !== id));
            ui.toast({ title: 'Goal Deleted', message: 'Goal removed from roadmap.', type: 'info' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });

    // Edit goal
    container.querySelectorAll('[data-edit-goal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-goal');
        const goal = store.get().goals.find(g => g.id === id);
        if (goal) this.openGoalModal(goal, container);
      });
    });

    // Add Goal buttons
    container.querySelector('#btn-add-goal')?.addEventListener('click', () => this.openGoalModal(null, container));
    container.querySelector('#btn-empty-add-goal')?.addEventListener('click', () => this.openGoalModal(null, container));
  },

  openGoalModal(existingGoal, container) {
    const isEdit = Boolean(existingGoal);
    const goal = existingGoal || {
      name: '',
      category: 'Academic',
      priority: 'high',
      currentValue: 0,
      targetValue: 10,
      unit: 'items',
      startDate: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
      color: '#6366f1',
      xpReward: 500
    };

    ui.modal({
      title: isEdit ? 'Edit Goal' : 'Define New Strategic Goal',
      width: '500px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Goal Title *</label>
          <input type="text" id="goal-name-input" class="form-input" placeholder="e.g. Master Neural Networks & PyTorch" value="${escapeHtml(goal.name)}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="goal-category-select" class="form-select">
              ${['Academic', 'Career', 'Fitness', 'Personal'].map(c => `
                <option value="${c}" ${goal.category === c ? 'selected' : ''}>${c}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select id="goal-priority-select" class="form-select">
              <option value="high" ${goal.priority === 'high' ? 'selected' : ''}>High Priority</option>
              <option value="medium" ${goal.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
              <option value="low" ${goal.priority === 'low' ? 'selected' : ''}>Low Priority</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Current Progress</label>
            <input type="number" id="goal-current-input" class="form-input" value="${goal.currentValue || 0}" step="any" />
          </div>
          <div class="form-group">
            <label class="form-label">Target Goal Value</label>
            <input type="number" id="goal-target-input" class="form-input" value="${goal.targetValue || 10}" step="any" />
          </div>
          <div class="form-group">
            <label class="form-label">Unit of Measure</label>
            <input type="text" id="goal-unit-input" class="form-input" placeholder="e.g. projects, problems" value="${escapeHtml(goal.unit || 'units')}" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Target Deadline</label>
            <input type="date" id="goal-deadline-input" class="form-input" value="${goal.deadline || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">XP Reward</label>
            <input type="number" id="goal-xp-input" class="form-input" value="${goal.xpReward || 500}" min="50" max="2000" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description & Strategy</label>
          <textarea id="goal-desc-input" class="form-textarea" placeholder="Why does this goal matter and what is the key leverage point?">${escapeHtml(goal.description || '')}</textarea>
        </div>
      `,
      confirmText: isEdit ? 'Save Changes' : 'Establish Goal',
      onConfirm: (modalEl) => {
        const name = modalEl.querySelector('#goal-name-input')?.value.trim();
        if (!name) {
          ui.toast({ title: 'Validation Error', message: 'Goal title is required.', type: 'error' });
          return false;
        }

        const category = modalEl.querySelector('#goal-category-select')?.value;
        const priority = modalEl.querySelector('#goal-priority-select')?.value;
        const currentValue = Number(modalEl.querySelector('#goal-current-input')?.value) || 0;
        const targetValue = Number(modalEl.querySelector('#goal-target-input')?.value) || 10;
        const unit = modalEl.querySelector('#goal-unit-input')?.value.trim() || 'units';
        const deadline = modalEl.querySelector('#goal-deadline-input')?.value || '';
        const xpReward = Number(modalEl.querySelector('#goal-xp-input')?.value) || 500;
        const description = modalEl.querySelector('#goal-desc-input')?.value.trim() || '';

        if (isEdit) {
          store.setGoals(prev => prev.map(g => {
            if (g.id === goal.id) {
              return { ...g, name, category, priority, currentValue, targetValue, unit, deadline, xpReward, description };
            }
            return g;
          }));
          ui.toast({ title: 'Goal Updated', message: `Changes saved for ${name}.`, type: 'success' });
        } else {
          const newGoal = {
            id: `g-${Date.now()}`,
            name,
            category,
            priority,
            currentValue,
            targetValue,
            unit,
            startDate: new Date().toISOString().split('T')[0],
            deadline,
            status: 'Active',
            description,
            xpReward,
            color: category === 'Academic' ? '#6366f1' : category === 'Career' ? '#ec4899' : category === 'Fitness' ? '#10b981' : '#f59e0b',
            progressLogs: [{ date: new Date().toISOString().split('T')[0], value: currentValue, note: 'Initial starting level' }],
            milestones: [
              { id: `m-${Date.now()}-1`, title: 'Phase 1: Research & Foundations', completed: false },
              { id: `m-${Date.now()}-2`, title: 'Phase 2: Core Execution', completed: false }
            ]
          };
          store.setGoals(prev => [newGoal, ...prev]);
          logActivity({
            appId: 'goals',
            action: 'created',
            title: `Defined Strategic Goal: ${name}`,
            details: `Target: ${targetValue} ${unit} (Deadline: ${deadline})`,
            xpEarned: 50
          });
          ui.toast({ title: 'Goal Established', message: `+50 XP awarded for establishing ${name}!`, type: 'success' });
        }

        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  destroy() {}
};

export default goalsApp;
