// COLLEGE OS - App: Academic Hub (Timetable, Attendance, Assignments, Exams, Syllabus & Dynamic GPA Engine)

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml, getDaysLeft } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

export const academicsApp = {
  id: 'academics',
  title: 'Academic Hub',
  icon: 'graduation-cap',
  currentTab: 'timetable',
  selectedSubjectFilter: 'All',

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
            <button class="tab-btn ${currentTab === 'syllabus' ? 'active' : ''}" data-tab="syllabus">
              ${getIcon('book-open', 'w-3.5 h-3.5')} Syllabus
            </button>
            <button class="tab-btn ${currentTab === 'gpa' ? 'active' : ''}" data-tab="gpa">
              ${getIcon('trophy', 'w-3.5 h-3.5')} GPA Calc
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
      const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
            <div style="font-size: 0.8125rem; color: var(--os-text-muted);">
              Current Day: <strong style="color: var(--os-accent);">${todayDayName}</strong>
            </div>
            <div style="display: flex; gap: var(--space-2);">
              <button class="btn btn-primary btn-sm" id="btn-add-class">
                ${getIcon('plus', 'w-3.5 h-3.5')} Add Class
              </button>
            </div>
          </div>

          <div class="timetable-grid">
            ${days.map(day => {
              const isToday = day.toLowerCase() === todayDayName.toLowerCase();
              const classes = (state.timetable || [])
                .filter(c => c.day.toLowerCase() === day.toLowerCase())
                .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

              return `
                <div class="timetable-day-col" style="${isToday ? 'border-color: var(--os-accent); background: rgba(99,102,241,0.06);' : ''}">
                  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--os-border); padding-bottom: 6px;">
                    <span style="font-family: var(--font-display); font-weight: 700; font-size: 0.875rem; color: ${isToday ? 'var(--os-accent)' : 'var(--os-text)'};">
                      ${day}
                    </span>
                    ${isToday ? '<span class="badge badge-primary" style="font-size: 0.625rem;">TODAY</span>' : ''}
                  </div>

                  <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: 4px;">
                    ${classes.length > 0 ? classes.map(c => `
                      <div class="timetable-class-card" style="border-left: 3px solid ${c.color || 'var(--os-accent)'}; position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 4px;">
                          <div style="font-weight: 700; color: var(--os-text); font-size: 0.75rem; line-height: 1.3;">
                            ${escapeHtml(c.subject)}
                          </div>
                          <div style="display: flex; gap: 2px;">
                            <button class="btn btn-ghost btn-xs" data-edit-class="${c.id}" title="Edit" style="padding: 2px;">${getIcon('edit-2', 'w-3 h-3')}</button>
                            <button class="btn btn-ghost btn-xs" data-del-class="${c.id}" title="Delete" style="padding: 2px;">×</button>
                          </div>
                        </div>
                        <div style="color: var(--os-text-muted); font-size: 0.6875rem; margin-top: 2px;">
                          ${escapeHtml(c.room || 'TBD')} ${c.teacher ? `• ${escapeHtml(c.teacher)}` : ''}
                        </div>
                        <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-accent); margin-top: 4px;">
                          ${c.startTime} - ${c.endTime}
                        </div>
                      </div>
                    `).join('') : `
                      <div style="color: var(--os-text-subtle); font-size: 0.6875rem; padding: 16px 0; text-align: center;">No lectures scheduled</div>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'attendance') {
      const minThreshold = state.profile.attendanceThreshold || 75;
      const attendanceList = state.attendance || [];

      // Check for courses below threshold
      const dangerCourses = attendanceList.filter(a => {
        const pct = a.totalClasses > 0 ? (a.attended / a.totalClasses) * 100 : 100;
        return pct < (a.minimumRequired || minThreshold);
      });

      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <!-- Top bar with Add Course and Threshold Warning -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
            <div style="font-size: 0.8125rem; color: var(--os-text-muted);">
              Threshold Target: <strong style="color: var(--os-text);">${minThreshold}%</strong>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-add-attendance-course">
              ${getIcon('plus', 'w-3.5 h-3.5')} Add Course
            </button>
          </div>

          ${dangerCourses.length > 0 ? `
            <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4); display: flex; align-items: center; gap: var(--space-3);">
              <span style="color: var(--os-error);">${getIcon('alert-triangle', 'w-5 h-5')}</span>
              <div style="font-size: 0.8125rem; color: var(--os-text);">
                <strong>Attendance Alert:</strong> ${dangerCourses.length} course(s) are below the ${minThreshold}% minimum requirement. Catch up on upcoming lectures immediately!
              </div>
            </div>
          ` : ''}

          <!-- Course Attendance Cards -->
          ${attendanceList.length === 0 ? ui.emptyState({
            icon: 'check-circle',
            title: 'No courses tracked',
            description: 'Add your semester courses to track attendance percentages and know exactly how many classes you can afford to miss.',
            actionText: 'Add First Course',
            actionId: 'btn-empty-add-att'
          }) : `
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${attendanceList.map(att => {
                const total = Number(att.totalClasses) || 0;
                const attended = Number(att.attended) || 0;
                const required = Number(att.minimumRequired) || minThreshold;
                const pct = total > 0 ? Math.round((attended / total) * 100) : 100;
                const isSafe = pct >= required;

                // Calculate classes student can miss or must attend
                let statusMessage = '';
                if (pct >= required) {
                  // How many can miss: floor((attended - (req/100)*total) / (req/100))
                  const canMiss = Math.floor((attended - (required / 100) * total) / (required / 100));
                  statusMessage = canMiss > 0
                    ? `<span style="color: var(--os-success);">You can safely miss <strong>${canMiss}</strong> more class${canMiss === 1 ? '' : 'es'}.</span>`
                    : `<span style="color: var(--os-warning);">On the threshold. Do not miss the next class!</span>`;
                } else {
                  // How many must attend: ceil(((req/100)*total - attended) / (1 - req/100))
                  const mustAttend = Math.ceil(((required / 100) * total - attended) / (1 - required / 100));
                  statusMessage = `<span style="color: var(--os-error);">Must attend next <strong>${mustAttend}</strong> consecutive class${mustAttend === 1 ? '' : 'es'} to reach ${required}%.</span>`;
                }

                return `
                  <div class="card attendance-card" style="border-left: 3px solid ${isSafe ? 'var(--os-success)' : 'var(--os-error)'};">
                    <div style="flex: 1; min-width: 260px;">
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: var(--space-2);">
                          <span style="font-weight: 700; font-size: 0.9375rem; color: var(--os-text);">${escapeHtml(att.subject)}</span>
                          <span class="badge ${isSafe ? 'badge-success' : 'badge-error'}">${pct}%</span>
                        </div>
                        <div style="display: flex; gap: 4px;">
                          <button class="btn btn-ghost btn-xs" data-edit-att="${att.id}" title="Edit Course">${getIcon('edit-2', 'w-3 h-3')}</button>
                          <button class="btn btn-ghost btn-xs" data-del-att="${att.id}" title="Delete Course">×</button>
                        </div>
                      </div>

                      <div style="font-size: 0.75rem; color: var(--os-text-muted); margin-top: 4px;">
                        Attended <strong>${attended}</strong> of <strong>${total}</strong> total sessions (Target: ${required}%)
                      </div>

                      <div class="progress-bar-container" style="max-width: 480px; margin-top: var(--space-2);">
                        <div class="progress-bar-fill" style="width: ${Math.min(100, pct)}%; background: ${isSafe ? 'var(--os-success)' : 'var(--os-error)'};"></div>
                      </div>

                      <div style="font-size: 0.75rem; font-family: var(--font-mono); margin-top: 6px;">
                        ${statusMessage}
                      </div>
                    </div>

                    <div style="display: flex; gap: var(--space-2); align-items: center; margin-top: var(--space-2);">
                      <button class="btn btn-secondary btn-sm" data-att-action="miss" data-att-id="${att.id}" title="Log missed lecture">
                        ${getIcon('x', 'w-3.5 h-3.5')} Missed
                      </button>
                      <button class="btn btn-primary btn-sm" data-att-action="attend" data-att-id="${att.id}" title="Log attended lecture">
                        ${getIcon('check', 'w-3.5 h-3.5')} Attended (+15 XP)
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;
    }

    if (tab === 'assignments') {
      const assignments = state.assignments || [];

      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
            <div style="font-size: 0.8125rem; color: var(--os-text-muted);">
              Active Pipeline: <strong>${assignments.filter(a => a.status !== 'Completed').length} Pending</strong>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-add-asg">
              ${getIcon('plus', 'w-3.5 h-3.5')} New Assignment
            </button>
          </div>

          ${assignments.length === 0 ? ui.emptyState({
            icon: 'sparkles',
            title: 'No assignments in pipeline',
            description: 'Track homework problem sets, laboratory write-ups, and projects to stay ahead of all deadlines.',
            actionText: 'Add First Assignment',
            actionId: 'btn-empty-add-asg'
          }) : `
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${assignments.map(asg => {
                const isDone = asg.status === 'Completed';
                const days = getDaysLeft(asg.deadline);
                const progress = Number(asg.progress) || (isDone ? 100 : 0);

                return `
                  <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3); border-left: 3px solid ${isDone ? 'var(--os-success)' : asg.priority === 'high' ? 'var(--os-error)' : 'var(--os-accent)'};">
                    <div style="flex: 1; min-width: 260px;">
                      <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
                        <span class="badge badge-primary">${escapeHtml(asg.subject)}</span>
                        <span class="badge ${asg.priority === 'high' ? 'badge-error' : 'badge-warning'}">${asg.priority}</span>
                        <span style="font-size: 0.6875rem; color: var(--os-text-subtle); font-family: var(--font-mono);">
                          ${asg.deadline ? `Due: ${asg.deadline} (${days !== null ? `${days}d left` : ''})` : 'No deadline'}
                        </span>
                        ${isDone ? '<span class="badge badge-success">Completed ✓</span>' : ''}
                      </div>

                      <h4 style="font-size: 0.9375rem; margin-top: 6px; text-decoration: ${isDone ? 'line-through' : 'none'}; color: ${isDone ? 'var(--os-text-muted)' : 'var(--os-text)'};">
                        ${escapeHtml(asg.title)}
                      </h4>
                      <p style="font-size: 0.75rem; color: var(--os-text-muted); margin-top: 2px;">${escapeHtml(asg.description || '')}</p>

                      <div style="display: flex; align-items: center; gap: var(--space-3); max-width: 320px; margin-top: var(--space-2);">
                        <div class="progress-bar-container" style="flex: 1;">
                          <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                        </div>
                        <span style="font-size: 0.6875rem; font-family: var(--font-mono); color: var(--os-text-muted);">${progress}%</span>
                      </div>
                    </div>

                    <div style="display: flex; gap: var(--space-2); align-items: center;">
                      <button class="btn ${isDone ? 'btn-secondary' : 'btn-primary'} btn-sm" data-toggle-asg="${asg.id}">
                        ${isDone ? 'Completed ✓' : 'Mark Done (+120 XP)'}
                      </button>
                      <button class="btn btn-ghost btn-xs" data-edit-asg="${asg.id}" title="Edit Assignment">${getIcon('edit-2', 'w-3.5 h-3.5')}</button>
                      <button class="btn btn-ghost btn-xs" data-del-asg="${asg.id}" title="Delete Assignment">${getIcon('trash-2', 'w-3.5 h-3.5')}</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;
    }

    if (tab === 'exams') {
      const exams = state.exams || [];

      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
            <div style="font-size: 0.8125rem; color: var(--os-text-muted);">
              Tracked Examinations: <strong>${exams.length} Upcoming</strong>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-add-exam">
              ${getIcon('plus', 'w-3.5 h-3.5')} New Exam
            </button>
          </div>

          ${exams.length === 0 ? ui.emptyState({
            icon: 'target',
            title: 'No upcoming exams',
            description: 'Schedule midterm and final exams with countdowns and preparation readiness tracking.',
            actionText: 'Schedule First Exam',
            actionId: 'btn-empty-add-exam'
          }) : `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
              ${exams.map(ex => {
                const days = getDaysLeft(ex.examDate);
                const prep = Number(ex.preparationPercent) || 0;

                return `
                  <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid var(--os-accent);">
                    <div>
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                        <span class="badge badge-primary">${escapeHtml(ex.subject)}</span>
                        <div style="display: flex; align-items: center; gap: 4px;">
                          <span class="badge ${days !== null && days <= 7 ? 'badge-error' : 'badge-warning'}">
                            ${days !== null ? `${days} Days Left` : 'Date TBD'}
                          </span>
                          <button class="btn btn-ghost btn-xs" data-edit-exam="${ex.id}" title="Edit">${getIcon('edit-2', 'w-3 h-3')}</button>
                          <button class="btn btn-ghost btn-xs" data-del-exam="${ex.id}" title="Delete">×</button>
                        </div>
                      </div>

                      <h3 style="font-size: 1.125rem; font-family: var(--font-display);">${escapeHtml(ex.title)}</h3>
                      <div style="font-size: 0.75rem; color: var(--os-text-muted); margin: var(--space-2) 0;">
                        <strong>Syllabus:</strong> ${escapeHtml(ex.syllabus || 'Review lecture slides')}
                      </div>

                      <div style="margin-top: var(--space-3);">
                        <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; font-family: var(--font-mono); margin-bottom: 4px;">
                          <span>Preparation Readiness</span>
                          <span>${prep}%</span>
                        </div>
                        <div class="progress-bar-container">
                          <div class="progress-bar-fill" style="width: ${prep}%; background: ${prep >= 80 ? 'var(--os-success)' : 'var(--os-accent)'};"></div>
                        </div>
                      </div>
                    </div>

                    <button class="btn btn-secondary btn-sm" style="margin-top: var(--space-4); width: 100%;" data-study-exam="${ex.id}">
                      Log 1hr Study Block (+80 XP)
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;
    }

    if (tab === 'syllabus') {
      const syllabusList = state.syllabus || [];
      const subjects = ['All', ...new Set((state.timetable || []).map(t => t.subject))];

      const filtered = syllabusList.filter(s =>
        this.selectedSubjectFilter === 'All' || s.subject === this.selectedSubjectFilter
      );

      const completedCount = filtered.filter(s => s.completed).length;
      const totalCount = filtered.length;
      const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
            <div style="display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap;">
              <span style="font-size: 0.75rem; color: var(--os-text-muted);">Filter Subject:</span>
              <select id="syllabus-subject-filter" class="form-select" style="width: auto; padding: 4px 8px; font-size: 0.75rem;">
                ${subjects.map(s => `
                  <option value="${escapeHtml(s)}" ${this.selectedSubjectFilter === s ? 'selected' : ''}>${escapeHtml(s)}</option>
                `).join('')}
              </select>
            </div>
            <div style="display: flex; gap: var(--space-2); align-items: center;">
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--os-text-muted);">
                Coverage: <strong style="color: var(--os-success);">${completedCount} / ${totalCount}</strong> (${pct}%)
              </span>
              <button class="btn btn-primary btn-sm" id="btn-add-syllabus-topic">
                ${getIcon('plus', 'w-3.5 h-3.5')} Add Topic
              </button>
            </div>
          </div>

          ${filtered.length === 0 ? ui.emptyState({
            icon: 'book-open',
            title: 'No syllabus topics found',
            description: 'Break down your courses into atomic topics and mark them off as you study.',
            actionText: 'Add First Topic',
            actionId: 'btn-empty-add-topic'
          }) : `
            <div class="card" style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${filtered.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--os-border-subtle); gap: var(--space-2);">
                  <div style="display: flex; align-items: center; gap: var(--space-2-5); flex: 1; cursor: pointer;" data-toggle-topic="${item.id}">
                    <div style="width: 16px; height: 16px; border-radius: var(--radius-xs); border: 1px solid ${item.completed ? 'var(--os-success)' : 'var(--os-border-light)'}; background: ${item.completed ? 'var(--os-success)' : 'transparent'}; display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0;">
                      ${item.completed ? getIcon('check', 'w-3 h-3') : ''}
                    </div>
                    <div>
                      <div style="font-size: 0.8125rem; font-weight: 600; color: ${item.completed ? 'var(--os-text-muted)' : 'var(--os-text)'}; text-decoration: ${item.completed ? 'line-through' : 'none'};">
                        ${escapeHtml(item.topic)}
                      </div>
                      <div style="font-size: 0.6875rem; color: var(--os-text-subtle);">
                        ${escapeHtml(item.subject)} ${item.notes ? `• ${escapeHtml(item.notes)}` : ''}
                      </div>
                    </div>
                  </div>
                  <button class="btn btn-ghost btn-xs" data-del-topic="${item.id}" title="Remove Topic">×</button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    }

    if (tab === 'gpa') {
      const grades = state.grades || [];

      let totalCredits = 0;
      let totalGradePoints = 0;

      grades.forEach(g => {
        const creds = Number(g.credits) || 0;
        const pts = Number(g.gradePoints) || 0;
        totalCredits += creds;
        totalGradePoints += creds * pts;
      });

      const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '4.00';
      const honors = Number(cgpa) >= 3.8 ? "First Class Honours / Dean's List Track" :
                     Number(cgpa) >= 3.5 ? "Distinction Track" :
                     Number(cgpa) >= 3.0 ? "Good Academic Standing" : "Academic Recovery Protocol";

      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 720px;">
          <!-- GPA Hero Card -->
          <div class="card" style="text-align: center; padding: var(--space-6);">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--os-accent); font-weight: 700; text-transform: uppercase;">
              Cumulative GPA Projection (Real Data)
            </div>
            <div style="font-size: 3.5rem; font-weight: 900; font-family: var(--font-mono); margin: var(--space-2) 0; color: #ffffff;">
              ${cgpa} <span style="font-size: 1.5rem; color: var(--os-text-muted);">/ 4.0</span>
            </div>
            <p style="color: var(--os-text-muted); font-size: 0.8125rem;">
              Standing: <strong style="color: var(--os-success);">${honors}</strong> • ${totalCredits} Total Credits Logged
            </p>
          </div>

          <!-- Courses Grade List -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Completed Semester Courses &amp; Credits</span>
              <button class="btn btn-primary btn-sm" id="btn-add-grade">
                ${getIcon('plus', 'w-3.5 h-3.5')} Add Course Grade
              </button>
            </div>

            ${grades.length === 0 ? `
              <div style="text-align: center; padding: 24px; color: var(--os-text-muted); font-size: 0.75rem;">
                No grades logged yet. Add your past semester courses and credits to calculate your CGPA.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${grades.map(g => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--os-bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--os-border);">
                    <div>
                      <div style="font-weight: 700; font-size: 0.8125rem; color: var(--os-text);">${escapeHtml(g.courseName)}</div>
                      <div style="font-size: 0.6875rem; color: var(--os-text-muted);">${escapeHtml(g.semester || 'Semester')} • ${g.credits} Credits</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                      <div style="text-align: right;">
                        <span class="badge badge-primary" style="font-size: 0.8125rem;">${escapeHtml(g.grade)}</span>
                        <div style="font-size: 0.625rem; font-family: var(--font-mono); color: var(--os-text-subtle);">${g.gradePoints} pts</div>
                      </div>
                      <button class="btn btn-ghost btn-xs" data-del-grade="${g.id}">×</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
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

    // --- TIMETABLE HANDLERS ---
    container.querySelector('#btn-add-class')?.addEventListener('click', () => this.openClassModal(null, container));

    container.querySelectorAll('[data-edit-class]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-class');
        const item = store.get().timetable.find(c => c.id === id);
        if (item) this.openClassModal(item, container);
      });
    });

    container.querySelectorAll('[data-del-class]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-class');
        ui.confirm({
          title: 'Delete Class?',
          message: 'Remove this lecture from your weekly timetable?',
          confirmText: 'Delete',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            store.setTimetable(prev => prev.filter(c => c.id !== id));
            ui.toast({ title: 'Class Deleted', message: 'Timetable updated.', type: 'info' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });

    // --- ATTENDANCE HANDLERS ---
    container.querySelectorAll('[data-att-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.getAttribute('data-att-action');
        const id = btn.getAttribute('data-att-id');
        const todayStr = new Date().toISOString().split('T')[0];

        store.setAttendance(prev => prev.map(a => {
          if (a.id === id) {
            const nextLogs = [...(a.lectureLogs || []), { id: `log-${Date.now()}`, date: todayStr, status: action }];
            if (action === 'attend') {
              logActivity({
                appId: 'academics',
                action: 'lecture_attended',
                title: `Attended Lecture: ${a.subject}`,
                details: `${a.attended + 1} of ${a.totalClasses + 1} sessions attended`,
                xpEarned: 15,
                metadata: { courseId: a.id }
              });
              ui.toast({ title: 'Attendance Logged!', message: `+15 XP earned for attending ${a.subject}`, type: 'success' });
              return { ...a, totalClasses: a.totalClasses + 1, attended: a.attended + 1, lectureLogs: nextLogs };
            } else {
              ui.toast({ title: 'Absence Recorded', message: `Logged miss for ${a.subject}`, type: 'warning' });
              return { ...a, totalClasses: a.totalClasses + 1, lectureLogs: nextLogs };
            }
          }
          return a;
        }));

        container.innerHTML = this.render();
        this.init(container);
      });
    });

    container.querySelector('#btn-add-attendance-course')?.addEventListener('click', () => this.openAttendanceModal(null, container));
    container.querySelector('#btn-empty-add-att')?.addEventListener('click', () => this.openAttendanceModal(null, container));

    container.querySelectorAll('[data-edit-att]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-att');
        const att = store.get().attendance.find(a => a.id === id);
        if (att) this.openAttendanceModal(att, container);
      });
    });

    container.querySelectorAll('[data-del-att]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-att');
        ui.confirm({
          title: 'Delete Course Attendance?',
          message: 'Are you sure you want to delete this course from attendance tracking?',
          confirmText: 'Delete',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            store.setAttendance(prev => prev.filter(a => a.id !== id));
            ui.toast({ title: 'Course Removed', message: 'Attendance list updated.', type: 'info' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });

    // --- ASSIGNMENTS HANDLERS ---
    container.querySelector('#btn-add-asg')?.addEventListener('click', () => this.openAssignmentModal(null, container));
    container.querySelector('#btn-empty-add-asg')?.addEventListener('click', () => this.openAssignmentModal(null, container));

    container.querySelectorAll('[data-toggle-asg]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-toggle-asg');
        store.setAssignments(prev => prev.map(asg => {
          if (asg.id === id) {
            const isDone = asg.status === 'Completed';
            const nextStatus = isDone ? 'In progress' : 'Completed';
            const nextProgress = isDone ? 50 : 100;

            if (!isDone) {
              logActivity({
                appId: 'academics',
                action: 'assignment_completed',
                title: `Crushed Assignment: ${asg.title}`,
                details: `Subject: ${asg.subject}`,
                xpEarned: 120,
                metadata: { assignmentId: asg.id }
              });
              ui.toast({
                title: 'Assignment Completed! 🎯',
                message: `+120 XP awarded for ${asg.title}`,
                type: 'success',
                action: {
                  label: 'Undo',
                  onClick: () => {
                    store.setAssignments(p => p.map(a => a.id === id ? { ...a, status: 'In progress', progress: 50 } : a));
                  }
                }
              });
            }

            return { ...asg, status: nextStatus, progress: nextProgress };
          }
          return asg;
        }));

        container.innerHTML = this.render();
        this.init(container);
      });
    });

    container.querySelectorAll('[data-edit-asg]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-asg');
        const asg = store.get().assignments.find(a => a.id === id);
        if (asg) this.openAssignmentModal(asg, container);
      });
    });

    container.querySelectorAll('[data-del-asg]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-asg');
        ui.confirm({
          title: 'Delete Assignment?',
          message: 'Remove this assignment from your tracking list?',
          confirmText: 'Delete',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            store.setAssignments(prev => prev.filter(a => a.id !== id));
            ui.toast({ title: 'Assignment Deleted', message: 'Pipeline updated.', type: 'info' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });

    // --- EXAMS HANDLERS ---
    container.querySelector('#btn-add-exam')?.addEventListener('click', () => this.openExamModal(null, container));
    container.querySelector('#btn-empty-add-exam')?.addEventListener('click', () => this.openExamModal(null, container));

    container.querySelectorAll('[data-study-exam]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-study-exam');
        store.setExams(prev => prev.map(ex => {
          if (ex.id === id) {
            const nextPrep = Math.min(100, (Number(ex.preparationPercent) || 0) + 15);
            logActivity({
              appId: 'academics',
              action: 'exam_prep',
              title: `Logged Study Session: ${ex.title}`,
              details: `Readiness reached ${nextPrep}%`,
              xpEarned: 80,
              metadata: { examId: ex.id }
            });
            ui.toast({ title: 'Study Session Logged! 📚', message: `+80 XP awarded! Readiness: ${nextPrep}%`, type: 'success' });
            return { ...ex, preparationPercent: nextPrep };
          }
          return ex;
        }));

        container.innerHTML = this.render();
        this.init(container);
      });
    });

    container.querySelectorAll('[data-edit-exam]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-exam');
        const exam = store.get().exams.find(e => e.id === id);
        if (exam) this.openExamModal(exam, container);
      });
    });

    container.querySelectorAll('[data-del-exam]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-exam');
        ui.confirm({
          title: 'Delete Exam?',
          message: 'Are you sure you want to remove this examination from your schedule?',
          confirmText: 'Delete',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            store.setExams(prev => prev.filter(e => e.id !== id));
            ui.toast({ title: 'Exam Removed', message: 'Schedule updated.', type: 'info' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });

    // --- SYLLABUS HANDLERS ---
    const subjFilter = container.querySelector('#syllabus-subject-filter');
    subjFilter?.addEventListener('change', (e) => {
      this.selectedSubjectFilter = e.target.value;
      container.innerHTML = this.render();
      this.init(container);
    });

    container.querySelector('#btn-add-syllabus-topic')?.addEventListener('click', () => this.openSyllabusModal(container));
    container.querySelector('#btn-empty-add-topic')?.addEventListener('click', () => this.openSyllabusModal(container));

    container.querySelectorAll('[data-toggle-topic]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-toggle-topic');
        store.setSyllabus(prev => prev.map(s => {
          if (s.id === id) {
            const nextComp = !s.completed;
            if (nextComp) {
              logActivity({
                appId: 'academics',
                action: 'topic_completed',
                title: `Mastered Topic: ${s.topic}`,
                details: `Subject: ${s.subject}`,
                xpEarned: 25,
                metadata: { topicId: s.id }
              });
              ui.toast({ title: 'Topic Mastered!', message: `+25 XP earned for ${s.topic}`, type: 'success' });
            }
            return { ...s, completed: nextComp };
          }
          return s;
        }));

        container.innerHTML = this.render();
        this.init(container);
      });
    });

    container.querySelectorAll('[data-del-topic]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-topic');
        store.setSyllabus(prev => prev.filter(s => s.id !== id));
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // --- GPA HANDLERS ---
    container.querySelector('#btn-add-grade')?.addEventListener('click', () => this.openGradeModal(container));

    container.querySelectorAll('[data-del-grade]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-grade');
        store.setGrades(prev => prev.filter(g => g.id !== id));
        ui.toast({ title: 'Course Grade Removed', message: 'CGPA recalculating...', type: 'info' });
        container.innerHTML = this.render();
        this.init(container);
      });
    });
  },

  openClassModal(existing, container) {
    const isEdit = Boolean(existing);
    const item = existing || {
      subject: '',
      teacher: '',
      room: '',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      color: '#6366f1'
    };

    ui.modal({
      title: isEdit ? 'Edit Class Lecture' : 'Add Class to Timetable',
      width: '460px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Course / Subject Name *</label>
          <input type="text" id="class-subject-input" class="form-input" placeholder="e.g. CS 229: Machine Learning" value="${escapeHtml(item.subject)}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Day of Week</label>
            <select id="class-day-select" class="form-select">
              ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => `
                <option value="${d}" ${item.day.toLowerCase() === d.toLowerCase() ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Room / Building</label>
            <input type="text" id="class-room-input" class="form-input" placeholder="e.g. Turing Hall 101" value="${escapeHtml(item.room)}" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <input type="time" id="class-start-input" class="form-input" value="${item.startTime || '09:00'}" />
          </div>
          <div class="form-group">
            <label class="form-label">End Time</label>
            <input type="time" id="class-end-input" class="form-input" value="${item.endTime || '10:30'}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Professor / Instructor</label>
          <input type="text" id="class-teacher-input" class="form-input" placeholder="e.g. Prof. Andrew" value="${escapeHtml(item.teacher || '')}" />
        </div>
      `,
      confirmText: isEdit ? 'Save Changes' : 'Add Class',
      onConfirm: (modalEl) => {
        const subject = modalEl.querySelector('#class-subject-input')?.value.trim();
        if (!subject) {
          ui.toast({ title: 'Validation Error', message: 'Subject name is required.', type: 'error' });
          return false;
        }

        const day = modalEl.querySelector('#class-day-select')?.value;
        const room = modalEl.querySelector('#class-room-input')?.value.trim() || 'Classroom';
        const startTime = modalEl.querySelector('#class-start-input')?.value || '09:00';
        const endTime = modalEl.querySelector('#class-end-input')?.value || '10:30';
        const teacher = modalEl.querySelector('#class-teacher-input')?.value.trim() || '';

        if (isEdit) {
          store.setTimetable(prev => prev.map(c => c.id === item.id ? { ...c, subject, day, room, startTime, endTime, teacher } : c));
          ui.toast({ title: 'Timetable Updated', message: `Updated ${subject}`, type: 'success' });
        } else {
          const newClass = {
            id: `c-${Date.now()}`,
            subject,
            day,
            room,
            startTime,
            endTime,
            teacher,
            color: '#6366f1'
          };
          store.setTimetable(prev => [...prev, newClass]);
          ui.toast({ title: 'Class Scheduled', message: `Added ${subject} on ${day}`, type: 'success' });
        }

        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  openAttendanceModal(existing, container) {
    const isEdit = Boolean(existing);
    const item = existing || {
      subject: '',
      totalClasses: 0,
      attended: 0,
      minimumRequired: store.get().profile.attendanceThreshold || 75
    };

    ui.modal({
      title: isEdit ? 'Edit Course Attendance' : 'Track New Course Attendance',
      width: '440px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Course Subject *</label>
          <input type="text" id="att-subject-input" class="form-input" placeholder="e.g. CS 161: Algorithms" value="${escapeHtml(item.subject)}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Total Classes Held</label>
            <input type="number" id="att-total-input" class="form-input" min="0" value="${item.totalClasses || 0}" />
          </div>
          <div class="form-group">
            <label class="form-label">Classes Attended</label>
            <input type="number" id="att-attended-input" class="form-input" min="0" value="${item.attended || 0}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Minimum Requirement (%)</label>
          <input type="number" id="att-min-input" class="form-input" min="50" max="100" value="${item.minimumRequired || 75}" />
        </div>
      `,
      confirmText: isEdit ? 'Save Changes' : 'Start Tracking',
      onConfirm: (modalEl) => {
        const subject = modalEl.querySelector('#att-subject-input')?.value.trim();
        if (!subject) {
          ui.toast({ title: 'Validation Error', message: 'Course subject is required.', type: 'error' });
          return false;
        }

        const totalClasses = Number(modalEl.querySelector('#att-total-input')?.value) || 0;
        const attended = Number(modalEl.querySelector('#att-attended-input')?.value) || 0;
        const minimumRequired = Number(modalEl.querySelector('#att-min-input')?.value) || 75;

        if (isEdit) {
          store.setAttendance(prev => prev.map(a => a.id === item.id ? { ...a, subject, totalClasses, attended, minimumRequired } : a));
          ui.toast({ title: 'Attendance Updated', message: `Saved changes for ${subject}`, type: 'success' });
        } else {
          const newAtt = {
            id: `att-${Date.now()}`,
            subject,
            totalClasses,
            attended,
            minimumRequired,
            lectureLogs: []
          };
          store.setAttendance(prev => [...prev, newAtt]);
          ui.toast({ title: 'Course Added', message: `Tracking attendance for ${subject}`, type: 'success' });
        }

        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  openAssignmentModal(existing, container) {
    const isEdit = Boolean(existing);
    const item = existing || {
      subject: '',
      title: '',
      description: '',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      priority: 'high',
      status: 'Not started',
      progress: 0
    };

    ui.modal({
      title: isEdit ? 'Edit Assignment' : 'Add Assignment to Pipeline',
      width: '480px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Assignment Title *</label>
          <input type="text" id="asg-title-input" class="form-input" placeholder="e.g. Problem Set 2: Support Vector Machines" value="${escapeHtml(item.title)}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Course / Subject</label>
            <input type="text" id="asg-subject-input" class="form-input" placeholder="e.g. CS 229" value="${escapeHtml(item.subject)}" />
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select id="asg-priority-select" class="form-select">
              <option value="high" ${item.priority === 'high' ? 'selected' : ''}>High</option>
              <option value="medium" ${item.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="low" ${item.priority === 'low' ? 'selected' : ''}>Low</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Deadline</label>
            <input type="datetime-local" id="asg-deadline-input" class="form-input" value="${item.deadline ? item.deadline.slice(0, 16) : ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Current Progress (%)</label>
            <input type="number" id="asg-progress-input" class="form-input" min="0" max="100" value="${item.progress || 0}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description / Instructions</label>
          <textarea id="asg-desc-input" class="form-textarea" placeholder="Key submission instructions and requirements...">${escapeHtml(item.description || '')}</textarea>
        </div>
      `,
      confirmText: isEdit ? 'Save Changes' : 'Add Assignment',
      onConfirm: (modalEl) => {
        const title = modalEl.querySelector('#asg-title-input')?.value.trim();
        if (!title) {
          ui.toast({ title: 'Validation Error', message: 'Assignment title is required.', type: 'error' });
          return false;
        }

        const subject = modalEl.querySelector('#asg-subject-input')?.value.trim() || 'General';
        const priority = modalEl.querySelector('#asg-priority-select')?.value;
        const deadline = modalEl.querySelector('#asg-deadline-input')?.value || '';
        const progress = Number(modalEl.querySelector('#asg-progress-input')?.value) || 0;
        const description = modalEl.querySelector('#asg-desc-input')?.value.trim() || '';
        const status = progress >= 100 ? 'Completed' : progress > 0 ? 'In progress' : 'Not started';

        if (isEdit) {
          store.setAssignments(prev => prev.map(a => a.id === item.id ? { ...a, title, subject, priority, deadline, progress, description, status } : a));
          ui.toast({ title: 'Assignment Updated', message: `Saved ${title}`, type: 'success' });
        } else {
          const newAsg = {
            id: `asg-${Date.now()}`,
            title,
            subject,
            priority,
            deadline,
            progress,
            description,
            status
          };
          store.setAssignments(prev => [newAsg, ...prev]);
          logActivity({
            appId: 'academics',
            action: 'assignment_added',
            title: `New Assignment Added: ${title}`,
            details: `Subject: ${subject} • Priority: ${priority}`,
            xpEarned: 25
          });
          ui.toast({ title: 'Assignment Added', message: `+25 XP for planning "${title}"`, type: 'success' });
        }

        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  openExamModal(existing, container) {
    const isEdit = Boolean(existing);
    const item = existing || {
      subject: '',
      title: '',
      examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      syllabus: '',
      preparationPercent: 20
    };

    ui.modal({
      title: isEdit ? 'Edit Exam' : 'Schedule Examination',
      width: '460px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Exam Title *</label>
          <input type="text" id="exam-title-input" class="form-input" placeholder="e.g. Midterm Examination 1" value="${escapeHtml(item.title)}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Course Subject</label>
            <input type="text" id="exam-subject-input" class="form-input" placeholder="e.g. CS 161: Algorithms" value="${escapeHtml(item.subject)}" />
          </div>
          <div class="form-group">
            <label class="form-label">Exam Date &amp; Time</label>
            <input type="datetime-local" id="exam-date-input" class="form-input" value="${item.examDate ? item.examDate.slice(0, 16) : ''}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Preparation Readiness (%)</label>
          <input type="number" id="exam-prep-input" class="form-input" min="0" max="100" value="${item.preparationPercent || 0}" />
        </div>
        <div class="form-group">
          <label class="form-label">Syllabus Topics Covered</label>
          <textarea id="exam-syllabus-input" class="form-textarea" placeholder="Key topics and chapters...">${escapeHtml(item.syllabus || '')}</textarea>
        </div>
      `,
      confirmText: isEdit ? 'Save Changes' : 'Schedule Exam',
      onConfirm: (modalEl) => {
        const title = modalEl.querySelector('#exam-title-input')?.value.trim();
        if (!title) {
          ui.toast({ title: 'Validation Error', message: 'Exam title is required.', type: 'error' });
          return false;
        }

        const subject = modalEl.querySelector('#exam-subject-input')?.value.trim() || 'Course';
        const examDate = modalEl.querySelector('#exam-date-input')?.value || '';
        const preparationPercent = Number(modalEl.querySelector('#exam-prep-input')?.value) || 0;
        const syllabus = modalEl.querySelector('#exam-syllabus-input')?.value.trim() || '';

        if (isEdit) {
          store.setExams(prev => prev.map(e => e.id === item.id ? { ...e, title, subject, examDate, preparationPercent, syllabus } : e));
          ui.toast({ title: 'Exam Updated', message: `Saved ${title}`, type: 'success' });
        } else {
          const newExam = {
            id: `ex-${Date.now()}`,
            title,
            subject,
            examDate,
            preparationPercent,
            syllabus
          };
          store.setExams(prev => [...prev, newExam]);
          ui.toast({ title: 'Exam Scheduled', message: `Scheduled ${title}`, type: 'success' });
        }

        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  openSyllabusModal(container) {
    ui.modal({
      title: 'Add Syllabus Topic',
      width: '420px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Course Subject *</label>
          <input type="text" id="topic-subj-input" class="form-input" placeholder="e.g. CS 229: Machine Learning" />
        </div>
        <div class="form-group">
          <label class="form-label">Topic / Unit Name *</label>
          <input type="text" id="topic-name-input" class="form-input" placeholder="e.g. Singular Value Decomposition" />
        </div>
        <div class="form-group">
          <label class="form-label">Notes / Key Takeaways</label>
          <input type="text" id="topic-notes-input" class="form-input" placeholder="e.g. Review lecture 7 slides" />
        </div>
      `,
      confirmText: 'Add Topic',
      onConfirm: (modalEl) => {
        const subject = modalEl.querySelector('#topic-subj-input')?.value.trim();
        const topic = modalEl.querySelector('#topic-name-input')?.value.trim();
        const notes = modalEl.querySelector('#topic-notes-input')?.value.trim() || '';

        if (!subject || !topic) {
          ui.toast({ title: 'Validation Error', message: 'Subject and Topic are required.', type: 'error' });
          return false;
        }

        const newTopic = {
          id: `syl-${Date.now()}`,
          subject,
          topic,
          completed: false,
          notes
        };

        store.setSyllabus(prev => [...prev, newTopic]);
        ui.toast({ title: 'Topic Added', message: `Added ${topic} to ${subject}`, type: 'success' });
        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  openGradeModal(container) {
    const gradeScale = [
      { grade: 'A+', pts: 4.0 },
      { grade: 'A', pts: 4.0 },
      { grade: 'A-', pts: 3.7 },
      { grade: 'B+', pts: 3.3 },
      { grade: 'B', pts: 3.0 },
      { grade: 'B-', pts: 2.7 },
      { grade: 'C+', pts: 2.3 },
      { grade: 'C', pts: 2.0 },
      { grade: 'D', pts: 1.0 },
      { grade: 'F', pts: 0.0 }
    ];

    ui.modal({
      title: 'Add Course Grade',
      width: '420px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Course Name *</label>
          <input type="text" id="grade-course-input" class="form-input" placeholder="e.g. CS 106B: Programming Abstractions" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Semester</label>
            <input type="text" id="grade-sem-input" class="form-input" placeholder="e.g. Semester 2" value="Semester 1" />
          </div>
          <div class="form-group">
            <label class="form-label">Course Credits</label>
            <input type="number" id="grade-creds-input" class="form-input" min="1" max="10" value="4" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Letter Grade</label>
          <select id="grade-letter-select" class="form-select">
            ${gradeScale.map(g => `<option value="${g.grade}" data-pts="${g.pts}">${g.grade} (${g.pts} pts)</option>`).join('')}
          </select>
        </div>
      `,
      confirmText: 'Record Grade',
      onConfirm: (modalEl) => {
        const courseName = modalEl.querySelector('#grade-course-input')?.value.trim();
        if (!courseName) {
          ui.toast({ title: 'Validation Error', message: 'Course name is required.', type: 'error' });
          return false;
        }

        const semester = modalEl.querySelector('#grade-sem-input')?.value.trim() || 'Semester';
        const credits = Number(modalEl.querySelector('#grade-creds-input')?.value) || 4;
        const letterSelect = modalEl.querySelector('#grade-letter-select');
        const grade = letterSelect?.value || 'A';
        const gradePoints = Number(letterSelect?.selectedOptions[0]?.getAttribute('data-pts')) || 4.0;

        const newGrade = {
          id: `gr-${Date.now()}`,
          courseName,
          semester,
          credits,
          grade,
          gradePoints
        };

        store.setGrades(prev => [...prev, newGrade]);
        logActivity({
          appId: 'academics',
          action: 'grade_recorded',
          title: `Grade Recorded: ${courseName} (${grade})`,
          details: `${credits} Credits • ${gradePoints} pts`,
          xpEarned: 50
        });
        ui.toast({ title: 'Grade Recorded!', message: `+50 XP for logging ${courseName}`, type: 'success' });

        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  destroy() {}
};

export default academicsApp;
