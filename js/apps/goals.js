// COLLEGE OS - App: Goals & Roadmap (Milestones, Progress Tracking, Quotas)

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml, getDaysLeft } from '../utils.js';
import soundService from '../sound.js';

export const goalsApp = {
  id: 'goals',
  title: 'Goals & Roadmap',
  icon: 'target',
  selectedCategory: 'All',

  render() {
    const state = store.get();
    const categories = ['All', 'Academic', 'Career', 'Fitness', 'Personal'];

    const filteredGoals = (state.goals || []).filter(g =>
      this.selectedCategory === 'All' || g.category === this.selectedCategory
    );

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

        <!-- Category filter -->
        <div class="tab-list">
          ${categories.map(cat => `
            <button class="tab-btn ${this.selectedCategory === cat ? 'active' : ''}" data-goal-cat="${cat}">
              ${cat}
            </button>
          `).join('')}
        </div>

        <!-- Goals Cards Grid -->
        <div class="app-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: var(--space-4);">
            ${filteredGoals.map(g => {
              const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) || 0;
              const days = getDaysLeft(g.deadline);

              return `
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-3);">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-2);">
                      <div>
                        <div style="display: flex; gap: var(--space-1-5); align-items: center; margin-bottom: 4px;">
                          <span class="badge badge-primary">${escapeHtml(g.category)}</span>
                          <span class="badge ${g.priority === 'high' ? 'badge-error' : 'badge-warning'}">${g.priority}</span>
                        </div>
                        <h3 style="font-size: 1.0625rem; font-family: var(--font-display);">${escapeHtml(g.name)}</h3>
                      </div>
                      <span class="badge badge-primary" style="font-size: 0.75rem; padding: 4px 8px;">${pct}%</span>
                    </div>

                    <p style="font-size: 0.75rem; color: var(--os-text-muted); margin: var(--space-2) 0;">${escapeHtml(g.description || '')}</p>

                    <!-- Progress bar -->
                    <div style="margin-top: var(--space-3);">
                      <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${pct}%; background: ${g.color || 'var(--os-accent)'};"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 0.6875rem; color: var(--os-text-subtle); font-family: var(--font-mono);">
                        <span>${g.currentValue} / ${g.targetValue} ${g.unit}</span>
                        <span>Due in ${days !== null ? `${days} days` : 'Ongoing'}</span>
                      </div>
                    </div>

                    <!-- Milestones -->
                    <div style="margin-top: var(--space-4); border-top: 1px solid var(--os-border); padding-top: var(--space-3);">
                      <div style="font-size: 0.6875rem; font-family: var(--font-mono); color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700; margin-bottom: var(--space-2);">
                        Milestones (${(g.milestones || []).filter(m => m.completed).length}/${(g.milestones || []).length})
                      </div>
                      <div style="display: flex; flex-direction: column; gap: var(--space-1-5);">
                        ${(g.milestones || []).map(m => `
                          <div style="display: flex; align-items: center; gap: var(--space-2); padding: 4px 0; font-size: 0.75rem; cursor: pointer;" data-toggle-milestone="${g.id}:${m.id}">
                            <div style="width: 14px; height: 14px; border-radius: var(--radius-xs); border: 1px solid ${m.completed ? 'var(--os-success)' : 'var(--os-border-light)'}; background: ${m.completed ? 'var(--os-success)' : 'transparent'}; display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0;">
                              ${m.completed ? getIcon('check', 'w-2.5 h-2.5') : ''}
                            </div>
                            <span style="color: ${m.completed ? 'var(--os-text-muted)' : 'var(--os-text)'}; text-decoration: ${m.completed ? 'line-through' : 'none'};">
                              ${escapeHtml(m.title)}
                            </span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--os-border); padding-top: var(--space-3); margin-top: var(--space-2);">
                    <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: #f59e0b; font-weight: 700;">+${g.xpReward || 500} XP on Completion</span>
                    <button class="btn btn-secondary btn-xs" data-inc-goal="${g.id}">+1 ${g.unit}</button>
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
    container.querySelectorAll('.tab-btn[data-goal-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        this.selectedCategory = btn.getAttribute('data-goal-cat');
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
                  awardXP(150, `Milestone achieved: ${m.title}`, e.clientX, e.clientY);
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

    // Increment progress
    container.querySelectorAll('[data-inc-goal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-inc-goal');
        store.setGoals(prev => prev.map(g => {
          if (g.id === id) {
            const nextVal = Math.min(g.targetValue, g.currentValue + 1);
            awardXP(50, `Goal progress: ${g.name}`, e.clientX, e.clientY);
            return { ...g, currentValue: nextVal };
          }
          return g;
        }));

        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Define Goal button
    const addBtn = container.querySelector('#btn-add-goal');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const name = prompt("Enter goal title:");
        if (name && name.trim()) {
          const newGoal = {
            id: `g-${Date.now()}`,
            name: name.trim(),
            description: "High priority semester standard.",
            category: "Academic",
            priority: "high",
            startDate: new Date().toISOString().split('T')[0],
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: "Active",
            currentValue: 0,
            targetValue: 5,
            unit: "steps",
            xpReward: 500,
            color: "#6366f1",
            milestones: [
              { id: `m-${Date.now()}-1`, title: "Phase 1: Research & Foundations", completed: false },
              { id: `m-${Date.now()}-2`, title: "Phase 2: Execution & Output", completed: false }
            ]
          };
          store.setGoals(prev => [newGoal, ...prev]);
          awardXP(50, `Goal defined: ${name}`);
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    }
  },

  destroy() {}
};

export default goalsApp;
