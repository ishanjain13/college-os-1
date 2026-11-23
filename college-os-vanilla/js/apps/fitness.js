// COLLEGE OS - App: Fitness, Strength & Biometrics

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

export const fitnessApp = {
  id: 'fitness',
  title: 'Fitness & Health',
  icon: 'dumbbell',

  render() {
    const state = store.get();
    const logs = state.fitnessLogs || [];
    const latest = logs[0] || { weight: 74.2, steps: 10000, sleep: 8.0, protein: 160, water: 3.5, volume: 6000 };

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Iron Scholar Fitness &amp; Vitality</h2>
            <p>Physical vitality is the hardware that powers high-output cognitive depth.</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-log-fitness">
            ${getIcon('plus', 'w-3.5 h-3.5')} Log Workout Session
          </button>
        </div>

        <!-- 4 Vital Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-4);">
          <div class="card">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Steps Today</span>
            <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); color: #10b981; margin: 4px 0;">${(latest.steps || 0).toLocaleString()}</div>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Target: 10,000 / day</span>
          </div>

          <div class="card">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Bodyweight</span>
            <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); color: #6366f1; margin: 4px 0;">${latest.weight || 74.2} kg</div>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Weekly Trend: Steady</span>
          </div>

          <div class="card">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Sleep Duration</span>
            <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); color: #8b5cf6; margin: 4px 0;">${latest.sleep || 8.0} hrs</div>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Target: 7.5 - 8.5 hrs</span>
          </div>

          <div class="card">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Protein Intake</span>
            <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); color: #f59e0b; margin: 4px 0;">${latest.protein || 160} g</div>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Target: 150g+ / day</span>
          </div>
        </div>

        <!-- Workout Log History Table -->
        <div class="card" style="flex: 1; display: flex; flex-direction: column;">
          <div class="card-header">
            <span class="card-title">Workout &amp; Training History</span>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">${logs.length} sessions logged</span>
          </div>

          ${logs.length === 0 ? ui.emptyState({
            icon: 'dumbbell',
            title: 'No workouts logged yet',
            description: 'Log your resistance training, volume, and daily physical recovery stats.',
            actionText: 'Log First Workout',
            actionId: 'btn-empty-add-workout'
          }) : `
            <div style="overflow-x: auto; flex: 1;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--os-border); color: var(--os-text-muted); text-align: left; font-family: var(--font-mono); font-size: 0.6875rem;">
                    <th style="padding: 8px 12px;">DATE</th>
                    <th style="padding: 8px 12px;">ROUTINE</th>
                    <th style="padding: 8px 12px;">VOLUME (KG)</th>
                    <th style="padding: 8px 12px;">STEPS</th>
                    <th style="padding: 8px 12px;">PROTEIN</th>
                    <th style="padding: 8px 12px;">SLEEP</th>
                    <th style="padding: 8px 12px; text-align: right;">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs.map(log => `
                    <tr style="border-bottom: 1px solid var(--os-border-subtle);">
                      <td style="padding: 10px 12px; font-family: var(--font-mono); font-size: 0.75rem;">${log.date}</td>
                      <td style="padding: 10px 12px; font-weight: 600;">${escapeHtml(log.workout)}</td>
                      <td style="padding: 10px 12px; font-family: var(--font-mono);">${(log.volume || 0).toLocaleString()}</td>
                      <td style="padding: 10px 12px; font-family: var(--font-mono);">${(log.steps || 0).toLocaleString()}</td>
                      <td style="padding: 10px 12px; font-family: var(--font-mono);">${log.protein}g</td>
                      <td style="padding: 10px 12px; font-family: var(--font-mono);">${log.sleep}h</td>
                      <td style="padding: 10px 12px; text-align: right;">
                        <button class="btn btn-ghost btn-xs" data-del-fitness="${log.id || log.date}">×</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  },

  init(container) {
    const logBtn = container.querySelector('#btn-log-fitness');
    const emptyBtn = container.querySelector('#btn-empty-add-workout');

    const openLogModal = () => {
      ui.modal({
        title: 'Log Workout & Vitality Session',
        width: '460px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Workout / Training Routine *</label>
            <input type="text" id="fit-routine-input" class="form-input" placeholder="e.g. Upper Body Hypertrophy" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Date</label>
              <input type="date" id="fit-date-input" class="form-input" value="${new Date().toISOString().split('T')[0]}" />
            </div>
            <div class="form-group">
              <label class="form-label">Total Volume (kg)</label>
              <input type="number" id="fit-volume-input" class="form-input" value="6500" step="100" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Bodyweight (kg)</label>
              <input type="number" id="fit-weight-input" class="form-input" value="74.5" step="0.1" />
            </div>
            <div class="form-group">
              <label class="form-label">Daily Steps</label>
              <input type="number" id="fit-steps-input" class="form-input" value="10500" step="500" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Protein Intake (g)</label>
              <input type="number" id="fit-protein-input" class="form-input" value="165" />
            </div>
            <div class="form-group">
              <label class="form-label">Sleep (hrs)</label>
              <input type="number" id="fit-sleep-input" class="form-input" value="7.8" step="0.1" />
            </div>
          </div>
        `,
        confirmText: 'Record Session',
        onConfirm: (modalEl) => {
          const workout = modalEl.querySelector('#fit-routine-input')?.value.trim();
          if (!workout) {
            ui.toast({ title: 'Validation Error', message: 'Workout routine name is required.', type: 'error' });
            return false;
          }

          const date = modalEl.querySelector('#fit-date-input')?.value || new Date().toISOString().split('T')[0];
          const volume = Number(modalEl.querySelector('#fit-volume-input')?.value) || 0;
          const weight = Number(modalEl.querySelector('#fit-weight-input')?.value) || 74.0;
          const steps = Number(modalEl.querySelector('#fit-steps-input')?.value) || 0;
          const protein = Number(modalEl.querySelector('#fit-protein-input')?.value) || 0;
          const sleep = Number(modalEl.querySelector('#fit-sleep-input')?.value) || 7.5;

          const newLog = {
            id: `fit-${Date.now()}`,
            date,
            workout,
            volume,
            weight,
            steps,
            protein,
            sleep,
            water: 3.5
          };

          store.setFitnessLogs(prev => [newLog, ...prev]);
          logActivity({
            appId: 'fitness',
            action: 'workout_logged',
            title: `Crushed Workout: ${workout}`,
            details: `${volume}kg Volume • ${steps} Steps`,
            xpEarned: 80,
            metadata: { workout, volume }
          });

          ui.toast({ title: 'Workout Logged! 💪', message: `+80 XP awarded for physical discipline!`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    };

    logBtn?.addEventListener('click', openLogModal);
    emptyBtn?.addEventListener('click', openLogModal);

    container.querySelectorAll('[data-del-fitness]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-fitness');
        ui.confirm({
          title: 'Delete Workout Log?',
          message: 'Remove this workout record from your log history?',
          confirmText: 'Delete',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            store.setFitnessLogs(prev => prev.filter(l => (l.id || l.date) !== id));
            ui.toast({ title: 'Record Removed', message: 'History updated.', type: 'info' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });
  },

  destroy() {}
};

export default fitnessApp;
