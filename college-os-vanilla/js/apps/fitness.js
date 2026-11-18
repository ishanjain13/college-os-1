// COLLEGE OS - App: Fitness, Strength & Biometrics

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';

export const fitnessApp = {
  id: 'fitness',
  title: 'Fitness & Health',
  icon: 'dumbbell',

  render() {
    const state = store.get();
    const logs = state.fitnessLogs || [];
    const latest = logs[0] || { weight: 74.2, steps: 10450, sleep: 7.8, protein: 165, water: 3.5 };

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
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Weekly Trend: Lean Bulk</span>
          </div>

          <div class="card">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Sleep Duration</span>
            <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); color: #8b5cf6; margin: 4px 0;">${latest.sleep || 7.8} hrs</div>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Target: 7.5 - 8.5 hrs</span>
          </div>

          <div class="card">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Protein Intake</span>
            <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); color: #f59e0b; margin: 4px 0;">${latest.protein || 165} g</div>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Target: 160g+</span>
          </div>
        </div>

        <!-- Workout Log History Table -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Workout &amp; Training History</span>
          </div>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--os-border); color: var(--os-text-muted); text-align: left; font-family: var(--font-mono); font-size: 0.6875rem;">
                  <th style="padding: 8px 12px;">DATE</th>
                  <th style="padding: 8px 12px;">ROUTINE</th>
                  <th style="padding: 8px 12px;">VOLUME (KG)</th>
                  <th style="padding: 8px 12px;">STEPS</th>
                  <th style="padding: 8px 12px;">PROTEIN</th>
                  <th style="padding: 8px 12px;">SLEEP</th>
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
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  init(container) {
    const logBtn = container.querySelector('#btn-log-fitness');
    logBtn?.addEventListener('click', () => {
      const routine = prompt("Workout Routine (e.g. Upper Body Hypertrophy):");
      if (routine) {
        const newLog = {
          date: new Date().toISOString().split('T')[0],
          workout: routine.trim(),
          volume: 6800,
          weight: 74.2,
          steps: 10500,
          protein: 165,
          sleep: 8.0,
          water: 3.5
        };
        store.setFitnessLogs(prev => [newLog, ...prev]);
        awardXP(90, `Workout logged: ${routine}`);
        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  destroy() {}
};

export default fitnessApp;
