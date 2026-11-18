// COLLEGE OS - App: Wellbeing, Guided Box Breathing & Mood Check-In

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import soundService from '../sound.js';

export const wellbeingApp = {
  id: 'wellbeing',
  title: 'Wellbeing & Breathing',
  icon: 'heart-pulse',

  phase: 'Inhale', // Inhale -> Hold -> Exhale -> Hold
  breathCount: 4,
  intervalId: null,

  render() {
    const moods = [
      { name: 'Energized', emoji: '⚡' },
      { name: 'Locked In', emoji: '🎯' },
      { name: 'Calm', emoji: '🌿' },
      { name: 'Tired', emoji: '☕' },
      { name: 'Overwhelmed', emoji: '🌧️' }
    ];

    return `
      <div class="app-container" style="align-items: center; text-align: center; justify-content: space-between;">
        <!-- Header -->
        <div class="app-header" style="width: 100%;">
          <div class="app-title-group" style="text-align: left;">
            <h2>Wellbeing &amp; Nervous System Reset</h2>
            <p>Box breathing, mental clarity check-ins, and parasympathetic recovery.</p>
          </div>
        </div>

        <!-- Breathing Interactive Visualizer -->
        <div style="padding: var(--space-6) 0; display: flex; flex-direction: column; align-items: center;">
          <div class="breathing-circle ${this.phase.toLowerCase()}" style="width: 200px; height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: #ffffff;" id="breath-phase-text">${this.phase}</div>
            <div style="font-family: var(--font-mono); font-size: 2rem; font-weight: 900; color: var(--os-accent); margin-top: 4px;" id="breath-counter-text">${this.breathCount}</div>
          </div>
          <div style="margin-top: var(--space-6); font-size: 0.8125rem; color: var(--os-text-muted);">
            Navy SEAL 4×4 Box Breathing Protocol for immediate mental resets.
          </div>
        </div>

        <!-- Mood Check In -->
        <div style="width: 100%; border-top: 1px solid var(--os-border); padding-top: var(--space-4);">
          <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700; margin-bottom: var(--space-3);">
            How is your nervous system feeling right now?
          </div>
          <div style="display: flex; justify-content: center; gap: var(--space-3); flex-wrap: wrap;">
            ${moods.map(m => `
              <button class="btn btn-secondary btn-sm" data-log-mood="${m.name}" style="padding: 8px 16px;">
                <span style="font-size: 1.125rem;">${m.emoji}</span>
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

    // Mood check-in buttons
    container.querySelectorAll('[data-log-mood]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mood = btn.getAttribute('data-log-mood');
        awardXP(15, `Mood Check-In: ${mood}`, e.clientX, e.clientY);
        alert(`Checked in: ${mood}. Remember that state follows action.`);
      });
    });
  },

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
};

export default wellbeingApp;
