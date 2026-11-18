// COLLEGE OS - App: Command Center (Dashboard)

import store from '../state.js';
import { calculateLevelInfo, awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml, getDaysLeft } from '../utils.js';
import windowManager from '../windowManager.js';
import soundService from '../sound.js';

export const dashboardApp = {
  id: 'dashboard',
  title: 'Command Center',
  icon: 'layout-dashboard',

  render() {
    const state = store.get();
    const levelInfo = calculateLevelInfo(state.profile.totalXP, state.levelTiers);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    // Today's classes
    const todayClasses = (state.timetable || []).filter(
      (c) => c.day.toLowerCase() === todayDayName.toLowerCase()
    );

    // Habits completed today
    const totalHabits = (state.habits || []).length;
    const completedHabits = (state.habits || []).filter(h => h.completedDates?.includes(todayStr)).length;
    const habitPercent = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    // Next assignment
    const nextAssignment = (state.assignments || [])
      .filter((a) => a.status !== 'Completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];
    const daysLeft = nextAssignment ? getDaysLeft(nextAssignment.deadline) : null;

    return `
      <div class="app-container">
        <!-- Hero Header -->
        <div style="background: linear-gradient(135deg, rgba(99,102,241,0.18) 0%, var(--os-bg-card) 60%, rgba(139,92,246,0.12) 100%); border: 1px solid var(--os-border-light); border-radius: var(--radius-2xl); padding: var(--space-6); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
          <div>
            <div style="display: flex; align-items: center; gap: var(--space-2); font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-accent); text-transform: uppercase; font-weight: 700;">
              <span>${escapeHtml(state.profile.college)}</span> • <span>${escapeHtml(state.profile.course)}</span>
            </div>
            <h1 style="font-size: 1.75rem; margin: var(--space-1) 0; font-family: var(--font-display);">Command Center</h1>
            <p style="color: var(--os-text-muted); font-size: 0.8125rem;">Build the person you want to become. Compounding daily standards.</p>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--os-border); border-radius: var(--radius-xl); padding: var(--space-3) var(--space-4); text-align: right;">
              <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 4px; justify-content: flex-end;">
                ${getIcon('flame', 'w-4 h-4')} ${state.profile.streak} DAY STREAK
              </div>
              <div style="font-family: var(--font-display); font-size: 1.125rem; font-weight: 800; color: #ffffff;">Level ${levelInfo.level}</div>
              <div style="font-size: 0.6875rem; color: var(--os-text-subtle);">${escapeHtml(levelInfo.title)}</div>
            </div>
          </div>
        </div>

        <!-- 4 Key Stat Tiles -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4);">
          <div class="card card-interactive" data-jump="achievements">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Level Progress</span>
              <span style="color: var(--os-accent);">${getIcon('trophy', 'w-4 h-4')}</span>
            </div>
            <div style="font-size: 1.5rem; font-weight: 800; margin: var(--space-2) 0; font-family: var(--font-display);">${levelInfo.progressPercent}%</div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${levelInfo.progressPercent}%;"></div>
            </div>
            <div style="font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: var(--space-2);">${levelInfo.xpInCurrentLevel} / ${levelInfo.xpNeededForLevel} XP to Next Lvl</div>
          </div>

          <div class="card card-interactive" data-jump="habits">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Habits Protocol</span>
              <span style="color: var(--os-success);">${getIcon('check-circle', 'w-4 h-4')}</span>
            </div>
            <div style="font-size: 1.5rem; font-weight: 800; margin: var(--space-2) 0; font-family: var(--font-display);">${completedHabits} / ${totalHabits}</div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${habitPercent}%; background: var(--os-success);"></div>
            </div>
            <div style="font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: var(--space-2);">${habitPercent}% Done Today</div>
          </div>

          <div class="card card-interactive" data-jump="focus">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Deep Focus</span>
              <span style="color: #f59e0b;">${getIcon('timer', 'w-4 h-4')}</span>
            </div>
            <div style="font-size: 1.5rem; font-weight: 800; margin: var(--space-2) 0; font-family: var(--font-display);">25 min</div>
            <div style="font-size: 0.75rem; color: var(--os-text-muted);">Standard Pomodoro Sprint</div>
            <div style="font-size: 0.6875rem; color: #f59e0b; margin-top: var(--space-2); font-weight: 600;">+50 XP per session</div>
          </div>

          <div class="card card-interactive" data-jump="academics">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Next Deadline</span>
              <span style="color: #ec4899;">${getIcon('calendar', 'w-4 h-4')}</span>
            </div>
            <div style="font-size: 1.125rem; font-weight: 800; margin: var(--space-2) 0; font-family: var(--font-display);" class="truncate">
              ${nextAssignment ? escapeHtml(nextAssignment.title) : 'All Caught Up!'}
            </div>
            <div style="font-size: 0.75rem; color: var(--os-text-muted);" class="truncate">
              ${nextAssignment ? escapeHtml(nextAssignment.subject) : 'No pending assignments'}
            </div>
            <div style="font-size: 0.6875rem; color: #ec4899; margin-top: var(--space-2); font-weight: 700;">
              ${nextAssignment ? (daysLeft <= 0 ? 'Due Today' : `In ${daysLeft} days`) : 'Relax'}
            </div>
          </div>
        </div>

        <!-- 2 Column Main Body -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5);">
          <!-- Left: Today's Classes & Habit Checklist -->
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div class="card">
              <div class="card-header">
                <span class="card-title" style="display: flex; align-items: center; gap: var(--space-2);">
                  ${getIcon('graduation-cap', 'w-4 h-4')} Today's Lectures &amp; Labs (${todayDayName})
                </span>
                <button class="btn btn-ghost btn-xs" data-jump="academics">Full Timetable →</button>
              </div>
              <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                ${todayClasses.length > 0 ? todayClasses.map(c => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2-5) var(--space-3); background: var(--os-bg-subtle); border-radius: var(--radius-md); border-left: 3px solid ${c.color || 'var(--os-accent)'};">
                    <div>
                      <div style="font-size: 0.8125rem; font-weight: 700; color: var(--os-text);">${escapeHtml(c.subject)}</div>
                      <div style="font-size: 0.6875rem; color: var(--os-text-muted);">${escapeHtml(c.room)} • ${escapeHtml(c.teacher)}</div>
                    </div>
                    <div style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 600; color: var(--os-text);">${c.startTime} - ${c.endTime}</div>
                  </div>
                `).join('') : `
                  <div style="padding: var(--space-6); text-align: center; color: var(--os-text-subtle); font-size: 0.75rem;">
                    No lectures scheduled today! Ideal day for deep project work.
                  </div>
                `}
              </div>
            </div>

            <!-- Today's Habits Quick Toggles -->
            <div class="card">
              <div class="card-header">
                <span class="card-title" style="display: flex; align-items: center; gap: var(--space-2);">
                  ${getIcon('check-circle', 'w-4 h-4')} Daily Habit Standards
                </span>
                <button class="btn btn-ghost btn-xs" data-jump="habits">All Habits →</button>
              </div>
              <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                ${(state.habits || []).slice(0, 4).map(h => {
                  const isDone = h.completedDates?.includes(todayStr);
                  return `
                    <div class="habit-row" style="padding: var(--space-2-5) var(--space-3); cursor: pointer;" data-habit-id="${h.id}">
                      <div style="display: flex; align-items: center; gap: var(--space-3);">
                        <div class="habit-check-btn ${isDone ? 'checked' : ''}">
                          ${isDone ? getIcon('check', 'w-3 h-3') : ''}
                        </div>
                        <div>
                          <div style="font-size: 0.8125rem; font-weight: 600; text-decoration: ${isDone ? 'line-through' : 'none'}; color: ${isDone ? 'var(--os-text-muted)' : 'var(--os-text)'};">
                            ${escapeHtml(h.name)}
                          </div>
                          <div style="font-size: 0.6875rem; color: var(--os-text-subtle); font-family: var(--font-mono);">+${h.xp || 35} XP • Target: ${h.target} ${h.unit}</div>
                        </div>
                      </div>
                      <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #f59e0b; font-weight: 700;">
                        ${h.currentStreak || 0}d
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Right: Core Goals & Quick Actions -->
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div class="card">
              <div class="card-header">
                <span class="card-title" style="display: flex; align-items: center; gap: var(--space-2);">
                  ${getIcon('target', 'w-4 h-4')} Active High-Priority Goals
                </span>
                <button class="btn btn-ghost btn-xs" data-jump="goals">Goals Hub →</button>
              </div>
              <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                ${(state.goals || []).slice(0, 2).map(g => {
                  const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) || 0;
                  return `
                    <div style="background: var(--os-bg-subtle); border: 1px solid var(--os-border); border-radius: var(--radius-md); padding: var(--space-3);">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-1);">
                        <div style="font-size: 0.8125rem; font-weight: 700; color: var(--os-text);">${escapeHtml(g.name)}</div>
                        <span class="badge badge-primary">${pct}%</span>
                      </div>
                      <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${pct}%; background: ${g.color || 'var(--os-accent)'};"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-top: var(--space-2); font-size: 0.6875rem; color: var(--os-text-muted); font-family: var(--font-mono);">
                        <span>${g.currentValue} / ${g.targetValue} ${g.unit}</span>
                        <span>Due ${g.deadline}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Launchpad Quick Shortcuts -->
            <div class="card">
              <div class="card-header">
                <span class="card-title">Launchpad Shortcuts</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2);">
                <button class="btn btn-secondary btn-sm" data-jump="planner" style="justify-content: flex-start;">${getIcon('calendar', 'w-4 h-4')} Kanban</button>
                <button class="btn btn-secondary btn-sm" data-jump="notes" style="justify-content: flex-start;">${getIcon('book-open', 'w-4 h-4')} Notes</button>
                <button class="btn btn-secondary btn-sm" data-jump="money" style="justify-content: flex-start;">${getIcon('wallet', 'w-4 h-4')} Budget</button>
                <button class="btn btn-secondary btn-sm" data-jump="career" style="justify-content: flex-start;">${getIcon('briefcase', 'w-4 h-4')} Career</button>
                <button class="btn btn-secondary btn-sm" data-jump="fitness" style="justify-content: flex-start;">${getIcon('dumbbell', 'w-4 h-4')} Fitness</button>
                <button class="btn btn-secondary btn-sm" data-jump="ai_buddy" style="justify-content: flex-start;">${getIcon('bot', 'w-4 h-4')} AI Buddy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init(container) {
    // Jump button listeners
    container.querySelectorAll('[data-jump]').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.getAttribute('data-jump');
        windowManager.openWindow(appId);
      });
    });

    // Habit toggle listeners
    container.querySelectorAll('[data-habit-id]').forEach(row => {
      row.addEventListener('click', (e) => {
        const habitId = row.getAttribute('data-habit-id');
        const todayStr = new Date().toISOString().split('T')[0];

        store.setHabits(prev => prev.map(h => {
          if (h.id === habitId) {
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

        // Re-render dashboard
        container.innerHTML = dashboardApp.render();
        dashboardApp.init(container);
      });
    });
  },

  destroy() {}
};

export default dashboardApp;
