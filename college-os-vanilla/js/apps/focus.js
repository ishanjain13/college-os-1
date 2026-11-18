// COLLEGE OS - App: Focus & Pomodoro (Ambient Sound, Modes, Sessions)

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import soundService from '../sound.js';
import { triggerConfetti } from '../confetti.js';

export const focusApp = {
  id: 'focus',
  title: 'Focus & Pomodoro',
  icon: 'timer',

  timeLeft: 25 * 60,
  workDuration: 25 * 60,
  breakDuration: 5 * 60,
  isRunning: false,
  isBreak: false,
  timerInterval: null,
  selectedMode: '25_5',
  selectedSound: 'rain',

  render() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const sounds = [
      { id: 'rain', label: 'Rain' },
      { id: 'cafe', label: 'Cafe Ambience' },
      { id: 'forest', label: 'Forest Wind' },
      { id: 'white_noise', label: 'White Noise' },
      { id: 'silence', label: 'Muted' }
    ];

    return `
      <div class="app-container" style="align-items: center; justify-content: space-between; text-align: center;">
        <!-- Header -->
        <div class="app-header" style="width: 100%;">
          <div class="app-title-group" style="text-align: left;">
            <h2>Focus &amp; Deep Work</h2>
            <p>Enter the flow state with synthesized ambient soundscapes and structured sprints.</p>
          </div>
          <div class="tab-list">
            <button class="tab-btn ${this.selectedMode === '25_5' ? 'active' : ''}" data-mode="25_5">25 / 5 Classic</button>
            <button class="tab-btn ${this.selectedMode === '50_10' ? 'active' : ''}" data-mode="50_10">50 / 10 Ultra</button>
          </div>
        </div>

        <!-- Timer Circle -->
        <div class="focus-timer-display">
          <div class="timer-circle ${this.isRunning ? 'pulse-glow' : ''}">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--os-accent); font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-2);">
              ${this.isBreak ? '☕ Rest & Rejuvenate' : '⚡ Deep Focus Sprint'}
            </div>
            <div class="timer-time-text">${timeStr}</div>
            <div style="font-size: 0.75rem; color: var(--os-text-muted); margin-top: var(--space-2);">
              ${this.isRunning ? 'Locked In' : 'Ready when you are'}
            </div>
          </div>
        </div>

        <!-- Action Controls -->
        <div style="display: flex; gap: var(--space-3); align-items: center;">
          <button class="btn btn-primary btn-lg" id="btn-toggle-focus" style="min-width: 140px;">
            ${this.isRunning ? getIcon('pause', 'w-4 h-4') : getIcon('play', 'w-4 h-4')}
            ${this.isRunning ? 'Pause' : 'Start Sprint'}
          </button>
          <button class="btn btn-secondary btn-md" id="btn-reset-focus" title="Reset Session">
            ${getIcon('rotate-ccw', 'w-4 h-4')} Reset
          </button>
        </div>

        <!-- Ambient Sound Preset Switcher -->
        <div style="width: 100%; border-top: 1px solid var(--os-border); padding-top: var(--space-4);">
          <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700; margin-bottom: var(--space-2);">
            Synthesized Ambient Audio
          </div>
          <div class="sound-presets-grid" style="max-width: 600px; margin: 0 auto;">
            ${sounds.map(s => `
              <button class="sound-btn ${this.selectedSound === s.id ? 'active' : ''}" data-sound="${s.id}">
                ${getIcon('volume-2', 'w-3.5 h-3.5')} ${s.label}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  init(container) {
    const toggleBtn = container.querySelector('#btn-toggle-focus');
    const resetBtn = container.querySelector('#btn-reset-focus');

    toggleBtn?.addEventListener('click', () => {
      soundService.playClick();
      if (this.isRunning) {
        this.pause();
      } else {
        this.start(container);
      }
      container.innerHTML = this.render();
      this.init(container);
    });

    resetBtn?.addEventListener('click', () => {
      soundService.playClick();
      this.reset();
      container.innerHTML = this.render();
      this.init(container);
    });

    // Mode buttons
    container.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        this.pause();
        const mode = btn.getAttribute('data-mode');
        this.selectedMode = mode;
        if (mode === '25_5') {
          this.workDuration = 25 * 60;
          this.breakDuration = 5 * 60;
        } else {
          this.workDuration = 50 * 60;
          this.breakDuration = 10 * 60;
        }
        this.timeLeft = this.workDuration;
        this.isBreak = false;
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Sound buttons
    container.querySelectorAll('[data-sound]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        const s = btn.getAttribute('data-sound');
        this.selectedSound = s;
        if (this.isRunning) {
          soundService.startAmbient(s);
        }
        container.innerHTML = this.render();
        this.init(container);
      });
    });
  },

  start(container) {
    this.isRunning = true;
    soundService.startAmbient(this.selectedSound);

    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        const timeText = container.querySelector('.timer-time-text');
        if (timeText) {
          timeText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
      } else {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        soundService.stopAmbient();
        soundService.playTimerEnd();

        if (!this.isBreak) {
          awardXP(100, "Completed Deep Focus Cycle");
          triggerConfetti(90);
          this.isBreak = true;
          this.timeLeft = this.breakDuration;
        } else {
          this.isBreak = false;
          this.timeLeft = this.workDuration;
        }
        container.innerHTML = this.render();
        this.init(container);
      }
    }, 1000);
  },

  pause() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    soundService.stopAmbient();
  },

  reset() {
    this.pause();
    this.timeLeft = this.workDuration;
    this.isBreak = false;
  },

  destroy() {
    this.pause();
  }
};

export default focusApp;
