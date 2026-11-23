// COLLEGE OS - App: Focus & Pomodoro (Persistent Background Timer, Distraction Capture & Flow Stats)

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import { triggerConfetti } from '../confetti.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

export const focusApp = {
  id: 'focus',
  title: 'Focus & Pomodoro',
  icon: 'timer',

  selectedMode: '25_5',
  selectedSound: 'rain',
  selectedSubject: '',
  timerInterval: null,
  distractions: [],

  render() {
    const state = store.get();
    const activeTimer = state.activeFocusTimer;
    const subjects = ['General Study', ...new Set((state.timetable || []).map(t => t.subject))];

    // Compute remaining time from persistent state
    let remainingSeconds = 25 * 60;
    let isRunning = false;
    let isBreak = false;

    if (activeTimer) {
      isRunning = Boolean(activeTimer.isRunning);
      isBreak = Boolean(activeTimer.isBreak);
      if (isRunning && activeTimer.startTime) {
        const elapsed = Math.floor((Date.now() - activeTimer.startTime) / 1000);
        remainingSeconds = Math.max(0, (activeTimer.targetDurationSeconds || 25 * 60) - elapsed);
      } else {
        remainingSeconds = activeTimer.pausedRemainingSeconds !== undefined ? activeTimer.pausedRemainingSeconds : (activeTimer.targetDurationSeconds || 25 * 60);
      }
    } else {
      remainingSeconds = this.selectedMode === '25_5' ? 25 * 60 : 50 * 60;
    }

    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
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
            <p>Enter the flow state with synthesized ambient soundscapes and persistent timer intervals.</p>
          </div>
          <div style="display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap;">
            <select id="focus-subject-select" class="form-select" style="width: auto; padding: 4px 8px; font-size: 0.75rem;">
              ${subjects.map(s => `
                <option value="${escapeHtml(s)}" ${this.selectedSubject === s ? 'selected' : ''}>${escapeHtml(s)}</option>
              `).join('')}
            </select>
            <div class="tab-list">
              <button class="tab-btn ${this.selectedMode === '25_5' ? 'active' : ''}" data-mode="25_5">25 / 5 Classic</button>
              <button class="tab-btn ${this.selectedMode === '50_10' ? 'active' : ''}" data-mode="50_10">50 / 10 Ultra</button>
            </div>
          </div>
        </div>

        <!-- Timer Circle -->
        <div class="focus-timer-display" style="margin: var(--space-4) 0;">
          <div class="timer-circle ${isRunning ? 'pulse-glow' : ''}">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--os-accent); font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-2);">
              ${isBreak ? '☕ Rest & Rejuvenate' : '⚡ Deep Focus Sprint'}
            </div>
            <div class="timer-time-text">${timeStr}</div>
            <div style="font-size: 0.75rem; color: var(--os-text-muted); margin-top: var(--space-2);">
              ${isRunning ? `Locked In • ${escapeHtml(this.selectedSubject || 'Deep Work')}` : 'Ready to start'}
            </div>
          </div>
        </div>

        <!-- Action Controls -->
        <div style="display: flex; gap: var(--space-3); align-items: center; justify-content: center; margin-bottom: var(--space-4);">
          <button class="btn btn-primary btn-lg" id="btn-toggle-focus" style="min-width: 150px;">
            ${isRunning ? getIcon('pause', 'w-4 h-4') : getIcon('play', 'w-4 h-4')}
            ${isRunning ? 'Pause' : 'Start Sprint'}
          </button>
          <button class="btn btn-secondary btn-md" id="btn-reset-focus" title="Reset Session">
            ${getIcon('rotate-ccw', 'w-4 h-4')} Reset
          </button>
          <button class="btn btn-secondary btn-md" id="btn-distraction-note" title="Log a distraction without breaking focus">
            ${getIcon('feather', 'w-4 h-4')} Distraction Note
          </button>
        </div>

        <!-- Distractions Shelf (if any logged) -->
        ${this.distractions.length > 0 ? `
          <div class="card" style="width: 100%; max-width: 540px; padding: var(--space-2) var(--space-3); margin-bottom: var(--space-3); text-align: left;">
            <div style="font-size: 0.6875rem; font-family: var(--font-mono); color: var(--os-text-subtle); margin-bottom: 4px; text-transform: uppercase;">
              Captured Distractions (${this.distractions.length})
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px;">
              ${this.distractions.map((d, i) => `
                <div style="font-size: 0.75rem; color: var(--os-text-muted); display: flex; justify-content: space-between;">
                  <span>• ${escapeHtml(d)}</span>
                  <button class="btn btn-ghost btn-xs" data-del-distraction="${i}">×</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Ambient Sound Preset Switcher -->
        <div style="width: 100%; border-top: 1px solid var(--os-border); padding-top: var(--space-3);">
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
    const subjectSelect = container.querySelector('#focus-subject-select');
    const distractionBtn = container.querySelector('#btn-distraction-note');

    subjectSelect?.addEventListener('change', (e) => {
      this.selectedSubject = e.target.value;
    });

    toggleBtn?.addEventListener('click', () => {
      soundService.playClick();
      const state = store.get();
      const activeTimer = state.activeFocusTimer;

      if (activeTimer && activeTimer.isRunning) {
        // Pause timer
        const elapsed = Math.floor((Date.now() - activeTimer.startTime) / 1000);
        const remaining = Math.max(0, activeTimer.targetDurationSeconds - elapsed);
        store.setActiveFocusTimer({
          ...activeTimer,
          isRunning: false,
          pausedRemainingSeconds: remaining
        });
        soundService.stopAmbient();
        this.stopLocalTicker();
      } else {
        // Start or resume timer
        const duration = (activeTimer && activeTimer.pausedRemainingSeconds !== undefined)
          ? activeTimer.pausedRemainingSeconds
          : (this.selectedMode === '25_5' ? 25 * 60 : 50 * 60);

        store.setActiveFocusTimer({
          startTime: Date.now(),
          targetDurationSeconds: duration,
          mode: this.selectedMode,
          isBreak: activeTimer?.isBreak || false,
          isRunning: true,
          subject: this.selectedSubject || 'General Study'
        });

        if (this.selectedSound !== 'silence') {
          soundService.startAmbient(this.selectedSound);
        }
        this.startLocalTicker(container);
      }

      container.innerHTML = this.render();
      this.init(container);
    });

    resetBtn?.addEventListener('click', () => {
      soundService.playClick();
      soundService.stopAmbient();
      this.stopLocalTicker();
      store.setActiveFocusTimer(null);
      container.innerHTML = this.render();
      this.init(container);
    });

    distractionBtn?.addEventListener('click', () => {
      ui.modal({
        title: 'Capture Distraction',
        width: '380px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Wandering Thought or Chore</label>
            <input type="text" id="modal-distraction-input" class="form-input" placeholder="e.g. Remember to pay electric bill" autofocus />
            <span class="form-help">Write it down to free up working memory, then immediately return to focus.</span>
          </div>
        `,
        confirmText: 'Capture & Return',
        onConfirm: (modalEl) => {
          const text = modalEl.querySelector('#modal-distraction-input')?.value.trim();
          if (text) {
            this.distractions.push(text);
            ui.toast({ title: 'Distraction Parked', message: 'Mind cleared. Stay in the zone!', type: 'info' });
            container.innerHTML = this.render();
            this.init(container);
          }
        }
      });
    });

    container.querySelectorAll('[data-del-distraction]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-del-distraction'));
        this.distractions.splice(idx, 1);
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Mode buttons
    container.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        soundService.stopAmbient();
        this.stopLocalTicker();
        const mode = btn.getAttribute('data-mode');
        this.selectedMode = mode;
        const dur = mode === '25_5' ? 25 * 60 : 50 * 60;
        store.setActiveFocusTimer({
          startTime: null,
          targetDurationSeconds: dur,
          mode,
          isBreak: false,
          isRunning: false,
          pausedRemainingSeconds: dur,
          subject: this.selectedSubject || 'General Study'
        });
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
        const activeTimer = store.get().activeFocusTimer;
        if (activeTimer && activeTimer.isRunning) {
          soundService.startAmbient(s);
        }
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // If timer is already running in background, keep ticker going
    const active = store.get().activeFocusTimer;
    if (active && active.isRunning) {
      this.startLocalTicker(container);
    }
  },

  startLocalTicker(container) {
    this.stopLocalTicker();

    this.timerInterval = setInterval(() => {
      const activeTimer = store.get().activeFocusTimer;
      if (!activeTimer || !activeTimer.isRunning) {
        this.stopLocalTicker();
        return;
      }

      const elapsed = Math.floor((Date.now() - activeTimer.startTime) / 1000);
      const remaining = Math.max(0, activeTimer.targetDurationSeconds - elapsed);

      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      const timeText = container.querySelector('.timer-time-text');
      if (timeText) {
        timeText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }

      if (remaining <= 0) {
        this.stopLocalTicker();
        soundService.stopAmbient();
        soundService.playTimerEnd();

        const wasBreak = activeTimer.isBreak;
        if (!wasBreak) {
          const durationMins = activeTimer.mode === '50_10' ? 50 : 25;
          const xp = activeTimer.mode === '50_10' ? 150 : 80;

          logActivity({
            appId: 'focus',
            action: 'focus_completed',
            title: `Completed ${durationMins}-Min Focus Block`,
            details: `Subject: ${activeTimer.subject || 'Deep Work'}`,
            xpEarned: xp,
            metadata: { durationMinutes: durationMins, subject: activeTimer.subject }
          });

          triggerConfetti(90);
          ui.toast({
            title: 'Sprint Complete! ⚡',
            message: `+${xp} XP awarded! Take a well-earned break.`,
            type: 'success'
          });

          // Transition to break
          const breakDuration = activeTimer.mode === '50_10' ? 10 * 60 : 5 * 60;
          store.setActiveFocusTimer({
            startTime: Date.now(),
            targetDurationSeconds: breakDuration,
            mode: activeTimer.mode,
            isBreak: true,
            isRunning: true,
            subject: 'Break'
          });
        } else {
          ui.toast({ title: 'Break Ended', message: 'Ready to crush another sprint!', type: 'info' });
          const workDuration = activeTimer.mode === '50_10' ? 50 * 60 : 25 * 60;
          store.setActiveFocusTimer({
            startTime: null,
            targetDurationSeconds: workDuration,
            mode: activeTimer.mode,
            isBreak: false,
            isRunning: false,
            pausedRemainingSeconds: workDuration,
            subject: activeTimer.subject || 'General Study'
          });
        }

        container.innerHTML = this.render();
        this.init(container);
      }
    }, 1000);
  },

  stopLocalTicker() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  destroy() {
    this.stopLocalTicker();
    soundService.stopAmbient();
  }
};

export default focusApp;
