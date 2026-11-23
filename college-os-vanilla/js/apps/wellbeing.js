// COLLEGE OS - App: Wellbeing, Guided Box Breathing & Mood Check-In

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

export const wellbeingApp = {
  id: 'wellbeing',
  title: 'Wellbeing & Breathing',
  icon: 'heart-pulse',

  phase: 'Inhale',
  breathCount: 4,
  intervalId: null,

  render() {
    const state = store.get();
    const logs = state.wellbeingLogs || [];

    const moods = [
      { name: 'Energized', emoji: '⚡', score: 5 },
      { name: 'Locked In', emoji: '🎯', score: 4 },
      { name: 'Calm & Clear', emoji: '🌿', score: 4 },
      { name: 'Tired / Drained', emoji: '☕', score: 2 },
      { name: 'Overwhelmed', emoji: '🌧️', score: 1 }
    ];

    // Compute 7-day mood trend
    const trendData = [...logs].reverse().slice(-7).map(l => ({
      label: l.date ? l.date.split('-').slice(1).join('/') : '',
      value: Number(l.moodScore) || 3
    }));

    const latest = logs[0];

    return `
      <div class="app-container" style="align-items: center; text-align: center; justify-content: space-between;">
        <!-- Header -->
        <div class="app-header" style="width: 100%;">
          <div class="app-title-group" style="text-align: left;">
            <h2>Wellbeing &amp; Nervous System Reset</h2>
            <p>Box breathing, mental clarity check-ins, and parasympathetic recovery.</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-full-checkin">
            ${getIcon('plus', 'w-3.5 h-3.5')} Detailed Reflection Log
          </button>
        </div>

        <!-- Breathing Interactive Visualizer -->
        <div style="padding: var(--space-4) 0; display: flex; flex-direction: column; align-items: center;">
          <div class="breathing-circle ${this.phase.toLowerCase()}" style="width: 180px; height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: #ffffff;" id="breath-phase-text">${this.phase}</div>
            <div style="font-family: var(--font-mono); font-size: 2rem; font-weight: 900; color: var(--os-accent); margin-top: 2px;" id="breath-counter-text">${this.breathCount}</div>
          </div>
          <div style="margin-top: var(--space-3); font-size: 0.75rem; color: var(--os-text-muted);">
            Navy SEAL 4×4 Box Breathing Protocol. Inhale 4s • Hold 4s • Exhale 4s • Hold 4s.
          </div>
        </div>

        <!-- 7-Day Trend Chart & Latest State -->
        ${trendData.length > 1 ? `
          <div class="card" style="width: 100%; max-width: 580px; padding: var(--space-3); text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 0.75rem; font-family: var(--font-mono); font-weight: 700; text-transform: uppercase; color: var(--os-text);">
                7-Day Mental Clarity Trend (Score 1-5)
              </span>
              ${latest ? `<span style="font-size: 0.6875rem; color: var(--os-text-muted);">Latest: ${latest.moodLabel || 'Calm'}</span>` : ''}
            </div>
            ${ui.chart.line({ data: trendData, height: 100, strokeColor: 'var(--os-success)' })}
          </div>
        ` : ''}

        <!-- Mood Quick Check In -->
        <div style="width: 100%; border-top: 1px solid var(--os-border); padding-top: var(--space-3);">
          <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700; margin-bottom: var(--space-2);">
            Quick Nervous System State Check-In
          </div>
          <div style="display: flex; justify-content: center; gap: var(--space-2); flex-wrap: wrap;">
            ${moods.map(m => `
              <button class="btn btn-secondary btn-sm" data-log-mood="${m.name}:${m.score}" style="padding: 6px 12px;">
                <span style="font-size: 1rem;">${m.emoji}</span>
                <span>${m.name}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  init(container) {
    // Breathing cycle loop
    let currentPhase = 'Inhale';
    let count = 4;

    const phaseText = container.querySelector('#breath-phase-text');
    const counterText = container.querySelector('#breath-counter-text');
    const circle = container.querySelector('.breathing-circle');

    this.intervalId = setInterval(() => {
      count--;
      if (count <= 0) {
        count = 4;
        if (currentPhase === 'Inhale') currentPhase = 'Hold';
        else if (currentPhase === 'Hold' && circle?.classList.contains('inhale')) currentPhase = 'Exhale';
        else if (currentPhase === 'Exhale') currentPhase = 'Hold';
        else currentPhase = 'Inhale';

        if (circle) {
          circle.className = `breathing-circle ${currentPhase.toLowerCase()}`;
        }
      }

      if (phaseText) phaseText.textContent = currentPhase;
      if (counterText) counterText.textContent = count;
    }, 1000);

    // Quick mood check-in buttons
    container.querySelectorAll('[data-log-mood]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const [mood, score] = btn.getAttribute('data-log-mood').split(':');
        const todayStr = new Date().toISOString().split('T')[0];

        const logEntry = {
          id: `wb-${Date.now()}`,
          date: todayStr,
          moodScore: Number(score) || 4,
          moodLabel: mood,
          energyLevel: Number(score) * 20,
          stressLevel: 100 - Number(score) * 20,
          breathingMinutes: 4,
          notes: 'Quick check-in'
        };

        store.setWellbeingLogs(prev => [logEntry, ...prev]);
        logActivity({
          appId: 'wellbeing',
          action: 'mood_checked',
          title: `Mood Check-In: ${mood}`,
          details: `Score: ${score}/5`,
          xpEarned: 25,
          metadata: { mood, score }
        });

        ui.toast({ title: 'Check-In Recorded', message: `+25 XP! State logged: ${mood}.`, type: 'success' });
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Detailed check-in modal
    container.querySelector('#btn-full-checkin')?.addEventListener('click', () => {
      ui.modal({
        title: 'Wellbeing & Clarity Reflection',
        width: '420px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Mental Clarity & Mood State</label>
            <select id="modal-wb-mood" class="form-select">
              <option value="5:Energized & Focused">⚡ Energized & High Agency (5/5)</option>
              <option value="4:Calm & Grounded" selected>🌿 Calm & Grounded (4/5)</option>
              <option value="3:Neutral / Steady">⚖️ Neutral & Steady (3/5)</option>
              <option value="2:Tired / Low Energy">☕ Tired & Overworked (2/5)</option>
              <option value="1:High Stress / Overwhelmed">🌧️ High Stress / Anxious (1/5)</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Energy Level (%)</label>
              <input type="number" id="modal-wb-energy" class="form-input" min="0" max="100" value="75" />
            </div>
            <div class="form-group">
              <label class="form-label">Stress Level (%)</label>
              <input type="number" id="modal-wb-stress" class="form-input" min="0" max="100" value="30" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Mindset / Reflection Notes</label>
            <textarea id="modal-wb-notes" class="form-textarea" placeholder="What is currently consuming cognitive bandwidth?"></textarea>
          </div>
        `,
        confirmText: 'Log Reflection',
        onConfirm: (modalEl) => {
          const rawMood = modalEl.querySelector('#modal-wb-mood')?.value || '4:Calm & Grounded';
          const [score, label] = rawMood.split(':');
          const energy = Number(modalEl.querySelector('#modal-wb-energy')?.value) || 75;
          const stress = Number(modalEl.querySelector('#modal-wb-stress')?.value) || 30;
          const notes = modalEl.querySelector('#modal-wb-notes')?.value.trim() || '';

          const newLog = {
            id: `wb-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            moodScore: Number(score),
            moodLabel: label,
            energyLevel: energy,
            stressLevel: stress,
            breathingMinutes: 5,
            notes
          };

          store.setWellbeingLogs(prev => [newLog, ...prev]);
          logActivity({
            appId: 'wellbeing',
            action: 'reflection_logged',
            title: `Wellbeing Logged: ${label}`,
            details: `Energy: ${energy}% • Stress: ${stress}%`,
            xpEarned: 40,
            metadata: { score, energy, stress }
          });

          ui.toast({ title: 'Reflection Saved', message: `+40 XP awarded for prioritizing mental clarity!`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });
  },

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
};

export default wellbeingApp;
