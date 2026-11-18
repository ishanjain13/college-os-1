// COLLEGE OS - App: Academic Hub (Timetable, Attendance, Assignments, Exams, GPA, Syllabus)

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml, getDaysLeft } from '../utils.js';
import soundService from '../sound.js';

export const academicsApp = {
  id: 'academics',
  title: 'Academic Hub',
  icon: 'graduation-cap',
  currentTab: 'timetable',

  render() {
    const state = store.get();
    const currentTab = this.currentTab;

    return `
      <div class="app-container">
        <!-- App Header with Tab Switcher -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Academic Hub</h2>
            <p>Timetable, class attendance standards, assignment pipeline, and exam readiness.</p>
          </div>
          <div class="tab-list">
            <button class="tab-btn ${currentTab === 'timetable' ? 'active' : ''}" data-tab="timetable">
              ${getIcon('calendar', 'w-3.5 h-3.5')} Timetable
            </button>
            <button class="tab-btn ${currentTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
              ${getIcon('check-circle', 'w-3.5 h-3.5')} Attendance
            </button>
            <button class="tab-btn ${currentTab === 'assignments' ? 'active' : ''}" data-tab="assignments">
              ${getIcon('sparkles', 'w-3.5 h-3.5')} Assignments
            </button>
            <button class="tab-btn ${currentTab === 'exams' ? 'active' : ''}" data-tab="exams">
              ${getIcon('target', 'w-3.5 h-3.5')} Exams
            </button>
            <button class="tab-btn ${currentTab === 'gpa' ? 'active' : ''}" data-tab="gpa">
              ${getIcon('trophy', 'w-3.5 h-3.5')} GPA
            </button>
          </div>
        </div>

        <!-- Body based on active tab -->
        <div class="app-body">
          ${this.renderTabContent(state, currentTab)}
        </div>
      </div>
    `;
  },

  renderTabContent(state, tab) {
    if (tab === 'timetable') {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      return `
        <div class="timetable-grid">
          ${days.map(day => {
            const classes = (state.timetable || []).filter(c => c.day.toLowerCase() === day.toLowerCase());
            return `
              <div class="timetable-day-col">
                <div style="font-family: var(--font-display); font-weight: 700; font-size: 0.875rem; border-bottom: 1px solid var(--os-border); padding-bottom: 4px;">
                  ${day}
                </div>
                ${classes.length > 0 ? classes.map(c => `
                  <div class="timetable-class-card" style="border-left-color: ${c.color || 'var(--os-accent)'};">
                    <div style="font-weight: 700; color: var(--os-text);">${escapeHtml(c.subject)}</div>
                    <div style="color: var(--os-text-muted); font-size: 0.6875rem; margin-top: 2px;">${escapeHtml(c.room)}</div>
                    <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-accent); margin-top: 4px;">${c.startTime} - ${c.endTime}</div>
                  </div>
                `).join('') : `
                  <div style="color: var(--os-text-subtle); font-size: 0.6875rem; padding: 12px 0;">No lectures scheduled</div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    if (tab === 'attendance') {
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${(state.attendance || []).map(att => {
            const pct = Math.round((att.attended / att.totalClasses) * 100) || 0;
            const isSafe = pct >= (att.minimumRequired || 75);
            return `
              <div class="attendance-card">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <span style="font-weight: 700; font-size: 0.9375rem;">${escapeHtml(att.subject)}</span>
                    <span class="badge ${isSafe ? 'badge-success' : 'badge-error'}">${pct}%</span>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--os-text-muted); margin-top: 2px;">
                    Attended ${att.attended} of ${att.totalClasses} classes (Min. ${att.minimumRequired}%)
                  </div>
                  <div class="progress-bar-container" style="max-width: 380px; margin-top: var(--space-2);">
                    <div class="progress-bar-fill" style="width: ${pct}%; background: ${isSafe ? 'var(--os-success)' : 'var(--os-error)'};"></div>
                  </div>
                </div>
                <div style="display: flex; gap: var(--space-2);">
                  <button class="btn btn-secondary btn-sm" data-att-action="miss" data-att-id="${att.id}">+1 Miss</button>
                  <button class="btn btn-primary btn-sm" data-att-action="attend" data-att-id="${att.id}">+1 Attend</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    if (tab === 'assignments') {
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${(state.assignments || []).map(asg => {
            const isDone = asg.status === 'Completed';
            const days = getDaysLeft(asg.deadline);
            return `
              <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
                <div style="flex: 1; min-width: 260px;">
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <span class="badge badge-primary">${escapeHtml(asg.subject)}</span>
                    <span class="badge ${asg.priority === 'high' ? 'badge-error' : 'badge-warning'}">${asg.priority}</span>
                    <span style="font-size: 0.6875rem; color: var(--os-text-subtle);">Due in ${days} days</span>
                  </div>
                  <h4 style="font-size: 0.9375rem; margin-top: 6px; text-decoration: ${isDone ? 'line-through' : 'none'}; color: ${isDone ? 'var(--os-text-muted)' : 'var(--os-text)'};">
                    ${escapeHtml(asg.title)}
                  </h4>
                  <p style="font-size: 0.75rem; color: var(--os-text-muted); margin-top: 2px;">${escapeHtml(asg.description || '')}</p>
                </div>
                <div>
                  <button class="btn ${isDone ? 'btn-secondary' : 'btn-primary'} btn-sm" data-asg-id="${asg.id}">
                    ${isDone ? 'Completed ✓' : 'Mark Completed (+120 XP)'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    if (tab === 'exams') {
      return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
          ${(state.exams || []).map(ex => {
            const days = getDaysLeft(ex.examDate);
            return `
              <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                  <span class="badge badge-primary">${escapeHtml(ex.subject)}</span>
                  <span class="badge badge-warning">${days} Days Left</span>
                </div>
                <h3 style="font-size: 1.125rem; font-family: var(--font-display);">${escapeHtml(ex.title)}</h3>
                <div style="font-size: 0.75rem; color: var(--os-text-muted); margin: var(--space-2) 0;">
                  <strong>Syllabus:</strong> ${escapeHtml(ex.syllabus || '')}
                </div>
                <div style="margin-top: var(--space-3);">
                  <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; font-family: var(--font-mono); margin-bottom: 4px;">
                    <span>Readiness Preparation</span>
                    <span>${ex.preparationPercent}%</span>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${ex.preparationPercent}%;"></div>
                  </div>
                </div>
                <button class="btn btn-secondary btn-sm" style="margin-top: var(--space-4); width: 100%;" data-study-exam="${ex.id}">
                  Log 1hr Study Session (+80 XP)
                </button>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    if (tab === 'gpa') {
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 600px;">
          <div class="card" style="text-align: center; padding: var(--space-8);">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--os-accent); font-weight: 700; text-transform: uppercase;">Cumulative GPA Projection</div>
            <div style="font-size: 3.5rem; font-weight: 900; font-family: var(--font-mono); margin: var(--space-2) 0; color: #ffffff;">3.88 / 4.0</div>
            <p style="color: var(--os-text-muted); font-size: 0.8125rem;">Standing: First Class Honours / Dean's List Track</p>
          </div>
        </div>
      `;
    }

    return '';
  },

  init(container) {
    // Tab switching
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        this.currentTab = btn.getAttribute('data-tab');
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Attendance buttons
    container.querySelectorAll('[data-att-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-att-action');
        const id = btn.getAttribute('data-att-id');

        store.setAttendance(prev => prev.map(a => {
          if (a.id === id) {
            if (action === 'attend') {
              awardXP(15, `Attended lecture: ${a.subject}`);
              return { ...a, totalClasses: a.totalClasses + 1, attended: a.attended + 1 };
            } else {
              return { ...a, totalClasses: a.totalClasses + 1 };
            }
          }
          return a;
        }));

        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Assignment completion
    container.querySelectorAll('[data-asg-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-asg-id');
        store.setAssignments(prev => prev.map(asg => {
          if (asg.id === id) {
            const nextStatus = asg.status === 'Completed' ? 'In progress' : 'Completed';
            if (nextStatus === 'Completed') {
              awardXP(120, `Completed assignment: ${asg.title}`, e.clientX, e.clientY);
            }
            return { ...asg, status: nextStatus, progress: nextStatus === 'Completed' ? 100 : 50 };
          }
          return asg;
        }));

        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Exam study session logger
    container.querySelectorAll('[data-study-exam]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-study-exam');
        store.setExams(prev => prev.map(ex => {
          if (ex.id === id) {
            awardXP(80, `Exam Study Session: ${ex.title}`, e.clientX, e.clientY);
            return { ...ex, preparationPercent: Math.min(100, (ex.preparationPercent || 50) + 10) };
          }
          return ex;
        }));

        container.innerHTML = this.render();
        this.init(container);
      });
    });
  },

  destroy() {}
};

export default academicsApp;
