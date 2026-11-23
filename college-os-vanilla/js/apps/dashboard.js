// COLLEGE OS - App: Command Center (Real Dashboard with Live Activity Feed & Zero Fake Stats)

import store from '../state.js';
import { calculateLevelInfo, awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml, getDaysLeft } from '../utils.js';
import windowManager from '../windowManager.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { getDailyActivityCounts, getPastDaysActivities } from '../activity.js';

export const dashboardApp = {
  id: 'dashboard',
  title: 'Command Center',
  icon: 'layout-dashboard',

  render() {
    const state = store.get();
    const levelInfo = calculateLevelInfo(state.profile.totalXP, state.levelTiers);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    // Today's classes from real timetable
    const todayClasses = (state.timetable || [])
      .filter((c) => c.day.toLowerCase() === todayDayName.toLowerCase())
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    // Next class calculation
    const nowTimeStr = new Date().toTimeString().slice(0, 5);
    const upcomingClass = todayClasses.find(c => (c.startTime || '') >= nowTimeStr);

    // Habits completed today from real completedLogs
    const activeHabits = (state.habits || []).filter(h => !h.archived);
    const totalHabits = activeHabits.length;
    const completedHabits = activeHabits.filter(h => {
      const val = h.completedLogs?.[todayStr];
      return val !== undefined && val >= (h.target || 1);
    }).length;
    const habitPercent = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    // Next assignment due
    const nextAssignment = (state.assignments || [])
      .filter((a) => a.status !== 'Completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];
    const daysLeft = nextAssignment ? getDaysLeft(nextAssignment.deadline) : null;

    // Attendance danger check
    const minThreshold = state.profile.attendanceThreshold || 75;
    const dangerAttendance = (state.attendance || []).filter(a => {
      const pct = a.totalClasses > 0 ? (a.attended / a.totalClasses) * 100 : 100;
      return pct < (a.minimumRequired || minThreshold);
    });

    // Real weekly focus time in hours from activityLog
    const recentLogs = state.activityLog || [];
    let focusMinutesWeekly = 0;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    recentLogs.forEach(l => {
      if (l.appId === 'focus' && l.timestamp >= sevenDaysAgo) {
        focusMinutesWeekly += Number(l.metadata?.durationMinutes) || 25;
      }
    });
    const focusHoursWeekly = (focusMinutesWeekly / 60).toFixed(1);

    // Activity heatmap counts (real computed data)
    const heatmapCounts = getDailyActivityCounts(84);

    return `
      <div class="app-container">
        <!-- Hero Header -->
        <div style="background: linear-gradient(135deg, rgba(99,102,241,0.18) 0%, var(--os-bg-card) 60%, rgba(139,92,246,0.12) 100%); border: 1px solid var(--os-border-light); border-radius: var(--radius-2xl); padding: var(--space-6); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
          <div>
            <div style="display: flex; align-items: center; gap: var(--space-2); font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-accent); text-transform: uppercase; font-weight: 700;">
              <span>${escapeHtml(state.profile.college)}</span> • <span>${escapeHtml(state.profile.course)}</span>
            </div>
            <h1 style="font-size: 1.75rem; margin: var(--space-1) 0; font-family: var(--font-display);">Command Center</h1>
            <p style="color: var(--os-text-muted); font-size: 0.8125rem;">Compounding standards across 18 integrated domains. 100% real student telemetry.</p>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--os-border); border-radius: var(--radius-xl); padding: var(--space-3) var(--space-4); text-align: right;">
              <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 4px; justify-content: flex-end;">
                ${getIcon('flame', 'w-4 h-4')} ${state.profile.streak || 0} DAY STREAK
              </div>
              <div style="font-family: var(--font-display); font-size: 1.125rem; font-weight: 800; color: #ffffff;">Level ${levelInfo.level}</div>
              <div style="font-size: 0.6875rem; color: var(--os-text-subtle);">${escapeHtml(levelInfo.title)}</div>
            </div>
          </div>
        </div>

        <!-- 4 Key Stat Tiles -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4);">
          <!-- Level Tile -->
          <div class="card card-interactive" data-jump="achievements">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Level Progress</span>
              <span style="color: var(--os-accent);">${getIcon('trophy', 'w-4 h-4')}</span>
            </div>
            <div style="font-size: 1.5rem; font-weight: 800; margin: var(--space-2) 0; font-family: var(--font-display);">${levelInfo.progressPercent}%</div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${levelInfo.progressPercent}%;"></div>
            </div>
            <div style="font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: var(--space-2); font-family: var(--font-mono);">${levelInfo.xpInCurrentLevel} / ${levelInfo.xpNeededForLevel} XP to Lvl ${levelInfo.level + 1}</div>
          </div>

          <!-- Habits Tile -->
          <div class="card card-interactive" data-jump="habits">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Habits Today</span>
              <span style="color: var(--os-success);">${getIcon('check-circle', 'w-4 h-4')}</span>
            </div>
            <div style="font-size: 1.5rem; font-weight: 800; margin: var(--space-2) 0; font-family: var(--font-display);">${completedHabits} / ${totalHabits}</div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${habitPercent}%; background: var(--os-success);"></div>
            </div>
            <div style="font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: var(--space-2);">${habitPercent}% Done Today</div>
          </div>

          <!-- Deep Focus Tile -->
          <div class="card card-interactive" data-jump="focus">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Weekly Focus Time</span>
              <span style="color: #f59e0b;">${getIcon('timer', 'w-4 h-4')}</span>
            </div>
            <div style="font-size: 1.5rem; font-weight: 800; margin: var(--space-2) 0; font-family: var(--font-display);">${focusHoursWeekly} hrs</div>
            <div style="font-size: 0.75rem; color: var(--os-text-muted);">Past 7 Days Deep Work</div>
            <div style="font-size: 0.6875rem; color: #f59e0b; margin-top: var(--space-2); font-weight: 600;">+80 XP per Pomodoro</div>
          </div>

          <!-- Next Deadline Tile -->
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
              ${nextAssignment ? (daysLeft !== null && daysLeft <= 0 ? 'Due Today!' : `Due in ${daysLeft} days`) : 'Zero friction'}
            </div>
          </div>
        </div>

        <!-- Attendance Alert Banner if any course is low -->
        ${dangerAttendance.length > 0 ? `
          <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4); display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <span style="color: var(--os-error);">${getIcon('alert-triangle', 'w-5 h-5')}</span>
              <div style="font-size: 0.8125rem; color: var(--os-text);">
                <strong>Attendance Warning:</strong> ${dangerAttendance.map(d => `${d.subject} (${Math.round((d.attended/d.totalClasses)*100)}%)`).join(', ')} below ${minThreshold}% minimum!
              </div>
            </div>
            <button class="btn btn-secondary btn-xs" data-jump="academics">View Academic Hub →</button>
          </div>
        ` : ''}

        <!-- 84-Day Activity Heatmap Matrix -->
        <div class="card" style="padding: var(--space-3) var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--os-text); font-family: var(--font-mono); text-transform: uppercase;">
              Active Consistency Matrix (Real 12-Week Event Stream)
            </span>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">${recentLogs.length} Activities Logged</span>
          </div>
          ${ui.chart.heatmap({ data: heatmapCounts, days: 84 })}
        </div>

        <!-- 2 Column Main Body -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5);">
          <!-- Left: Today's Lectures & Next Class Countdown -->
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div class="card">
              <div class="card-header">
                <span class="card-title" style="display: flex; align-items: center; gap: var(--space-2);">
                  ${getIcon('graduation-cap', 'w-4 h-4')} Lectures Today (${todayDayName})
                </span>
                <button class="btn btn-ghost btn-xs" data-jump="academics">Full Timetable →</button>
              </div>

              ${upcomingClass ? `
                <div style="background: rgba(99,102,241,0.12); border: 1px solid var(--os-accent); border-radius: var(--radius-md); padding: var(--space-2-5) var(--space-3); margin-bottom: var(--space-3); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 0.6875rem; font-family: var(--font-mono); color: var(--os-accent); font-weight: 700;">UPCOMING LECTURE</div>
                    <div style="font-weight: 700; font-size: 0.875rem; color: #ffffff;">${escapeHtml(upcomingClass.subject)}</div>
                    <div style="font-size: 0.6875rem; color: var(--os-text-muted);">${escapeHtml(upcomingClass.room)}</div>
                  </div>
                  <div style="font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 800; color: #ffffff;">
                    ${upcomingClass.startTime}
                  </div>
                </div>
              ` : ''}

              <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                ${todayClasses.length > 0 ? todayClasses.map(c => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2-5) var(--space-3); background: var(--os-bg-subtle); border-radius: var(--radius-md); border-left: 3px solid ${c.color || 'var(--os-accent)'};">
                    <div>
                      <div style="font-size: 0.8125rem; font-weight: 700; color: var(--os-text);">${escapeHtml(c.subject)}</div>
                      <div style="font-size: 0.6875rem; color: var(--os-text-muted);">${escapeHtml(c.room)} ${c.teacher ? `• ${escapeHtml(c.teacher)}` : ''}</div>
                    </div>
                    <div style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 600; color: var(--os-text);">${c.startTime} - ${c.endTime}</div>
                  </div>
                `).join('') : `
                  <div style="padding: var(--space-6); text-align: center; color: var(--os-text-subtle); font-size: 0.75rem;">
                    No lectures scheduled today! Great opportunity for uninterrupted deep work.
                  </div>
                `}
              </div>
            </div>

            <!-- Today's Habits Quick Toggles -->
            <div class="card">
              <div class="card-header">
                <span class="card-title" style="display: flex; align-items: center; gap: var(--space-2);">
                  ${getIcon('check-circle', 'w-4 h-4')} Quick Habit Toggles
                </span>
                <button class="btn btn-ghost btn-xs" data-jump="habits">All Habits →</button>
              </div>
              <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                ${activeHabits.slice(0, 4).map(h => {
                  const val = h.completedLogs?.[todayStr] || 0;
                  const target = h.target || 1;
                  const isDone = val >= target;

                  return `
                    <div class="habit-row" style="padding: var(--space-2-5) var(--space-3); cursor: pointer;" data-quick-toggle-habit="${h.id}">
                      <div style="display: flex; align-items: center; gap: var(--space-3);">
                        <div class="habit-check-btn ${isDone ? 'checked' : ''}">
                          ${isDone ? getIcon('check', 'w-3 h-3') : ''}
                        </div>
                        <div>
                          <div style="font-size: 0.8125rem; font-weight: 600; text-decoration: ${isDone ? 'line-through' : 'none'}; color: ${isDone ? 'var(--os-text-muted)' : 'var(--os-text)'};">
                            ${escapeHtml(h.name)}
                          </div>
                          <div style="font-size: 0.6875rem; color: var(--os-text-subtle); font-family: var(--font-mono);">
                            +${h.xp || 35} XP • ${target} ${escapeHtml(h.unit)} (${escapeHtml(h.frequency)})
                          </div>
                        </div>
                      </div>
                      <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #f59e0b; font-weight: 700;">
                        ${h.currentStreak || 0}d 🔥
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Right: Live Activity Stream & Launchpad Shortcuts -->
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <!-- Live Activity Log Stream -->
            <div class="card">
              <div class="card-header">
                <span class="card-title" style="display: flex; align-items: center; gap: var(--space-2);">
                  ${getIcon('activity', 'w-4 h-4')} Live Activity Stream
                </span>
                <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Real OS Events</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                ${recentLogs.slice(0, 5).map(log => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--os-bg-subtle); border-radius: var(--radius-md); border-left: 2px solid var(--os-accent);">
                    <div>
                      <div style="font-size: 0.75rem; font-weight: 600; color: var(--os-text);">${escapeHtml(log.title)}</div>
                      <div style="font-size: 0.6875rem; color: var(--os-text-subtle);">${escapeHtml(log.details || log.appId)}</div>
                    </div>
                    <div style="text-align: right; font-family: var(--font-mono); font-size: 0.6875rem;">
                      ${log.xpEarned > 0 ? `<span style="color: #f59e0b; font-weight: 700;">+${log.xpEarned} XP</span>` : ''}
                      <div style="color: var(--os-text-subtle); font-size: 0.625rem;">${log.timestamp ? log.timestamp.split('T')[1].slice(0, 5) : ''}</div>
                    </div>
                  </div>
                `).join('')}

                ${recentLogs.length === 0 ? `
                  <div style="text-align: center; padding: 16px; color: var(--os-text-subtle); font-size: 0.75rem;">
                    No activities recorded yet. Complete habits, tasks, or study blocks to build your activity feed.
                  </div>
                ` : ''}
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

    // Quick habit toggle right from Command Center
    container.querySelectorAll('[data-quick-toggle-habit]').forEach(row => {
      row.addEventListener('click', (e) => {
        const habitId = row.getAttribute('data-quick-toggle-habit');
        const todayStr = new Date().toISOString().split('T')[0];

        store.setHabits(prev => prev.map(h => {
          if (h.id === habitId) {
            const currentVal = h.completedLogs?.[todayStr] || 0;
            const target = h.target || 1;
            const isDone = currentVal >= target;
            const newLogs = { ...(h.completedLogs || {}) };

            if (isDone) {
              delete newLogs[todayStr];
              return { ...h, completedLogs: newLogs, currentStreak: Math.max(0, (h.currentStreak || 1) - 1) };
            } else {
              newLogs[todayStr] = target;
              const newStreak = (h.currentStreak || 0) + 1;
              awardXP(h.xp || 35, `Habit completed: ${h.name}`, e.clientX, e.clientY);
              ui.toast({ title: 'Habit Done!', message: `+${h.xp || 35} XP for ${h.name}`, type: 'success' });
              return { ...h, completedLogs: newLogs, currentStreak: newStreak };
            }
          }
          return h;
        }));

        container.innerHTML = this.render();
        this.init(container);
      });
    });
  },

  destroy() {}
};

export default dashboardApp;
