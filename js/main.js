// COLLEGE OS - Main System Bootstrap (ES6 Modules)

import store, { APP_METADATA } from './state.js';
import { initTheme, applyTheme, toggleTheme } from './theme.js';
import soundService from './sound.js';
import windowManager from './windowManager.js';
import commandPalette from './commandPalette.js';
import { calculateLevelInfo, awardXP } from './xpSystem.js';
import { getIcon } from './icons.js';
import { escapeHtml, getDaysLeft, addRipple } from './utils.js';

// Import all 18 apps
import dashboardApp from './apps/dashboard.js';
import academicsApp from './apps/academics.js';
import habitsApp from './apps/habits.js';
import goalsApp from './apps/goals.js';
import focusApp from './apps/focus.js';
import plannerApp from './apps/planner.js';
import notesApp from './apps/notes.js';
import moneyApp from './apps/money.js';
import fitnessApp from './apps/fitness.js';
import careerApp from './apps/career.js';
import wellbeingApp from './apps/wellbeing.js';
import journalApp from './apps/journal.js';
import gamificationApp from './apps/gamification.js';
import visionApp from './apps/vision.js';
import futureMeApp from './apps/futureMe.js';
import campusApp from './apps/campus.js';
import aiBuddyApp from './apps/aiBuddy.js';
import settingsApp from './apps/settings.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme & Sound
  initTheme();
  const state = store.get();
  soundService.setEnabled(state.profile.soundEnabled);
  soundService.setVolume(state.profile.soundVolume);

  // 2. Initialize Window Manager & Register Apps
  const winContainer = document.getElementById('window-container');
  windowManager.init(winContainer);

  const appsList = [
    dashboardApp, academicsApp, habitsApp, goalsApp,
    focusApp, plannerApp, notesApp, moneyApp,
    fitnessApp, careerApp, wellbeingApp, journalApp,
    gamificationApp, visionApp, futureMeApp, campusApp,
    aiBuddyApp, settingsApp
  ];

  appsList.forEach(app => windowManager.registerApp(app));

  // 3. Initialize Command Palette
  commandPalette.init();

  // 4. Initialize Wallpaper Particle Engine
  initWallpaperEngine();

  // 5. Initialize Top Bar (Clock, Menus, Quick Actions)
  initTopBar();

  // 6. Initialize Desktop Widgets
  initDesktopWidgets();

  // 7. Initialize Dock
  initDock();

  // 8. Initialize Quick Capture Modal
  initQuickCapture();

  // 9. Initialize Boot Screen
  initBootScreen();

  // 10. Open Dashboard Window by default on desktop
  if (window.innerWidth >= 768) {
    windowManager.openWindow('dashboard');
  }

  // 11. Ripple effect on all buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) addRipple(e);
  });
});

/* ==========================================================================
   WALLPAPER PARTICLE ENGINE (60fps Canvas)
   ========================================================================== */
function initWallpaperEngine() {
  const canvas = document.getElementById('wallpaper-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const count = 35;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  let isPaused = document.hidden;
  document.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
  });

  function render() {
    if (!isPaused) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(99, 102, 241, ${p.alpha})`
          : `rgba(99, 102, 241, ${p.alpha * 0.6})`;
        ctx.fill();
      }
    }
    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   TOP BAR (System Clock, Menu Dropdowns, Quick Actions)
   ========================================================================== */
function initTopBar() {
  const timeEl = document.getElementById('topbar-clock');
  const dateEl = document.getElementById('topbar-date');

  const updateTime = () => {
    const now = new Date();
    if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (dateEl) dateEl.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };
  updateTime();
  setInterval(updateTime, 1000);

  // Search Button
  document.getElementById('topbar-search-btn')?.addEventListener('click', () => {
    commandPalette.open();
  });

  // Quick Capture Button (+)
  document.getElementById('topbar-quick-btn')?.addEventListener('click', () => {
    soundService.playClick();
    document.getElementById('quick-capture-modal')?.classList.add('open');
  });

  // Theme Toggle Button
  document.getElementById('topbar-theme-btn')?.addEventListener('click', () => {
    soundService.playClick();
    toggleTheme();
  });

  // Sound Toggle Button
  const soundBtn = document.getElementById('topbar-sound-btn');
  soundBtn?.addEventListener('click', () => {
    const state = store.get();
    const next = !state.profile.soundEnabled;
    store.updateProfile({ soundEnabled: next });
    soundService.setEnabled(next);
    soundBtn.innerHTML = getIcon(next ? 'volume-2' : 'volume-x', 'w-4 h-4');
  });
}

/* ==========================================================================
   DESKTOP WIDGETS
   ========================================================================== */
function initDesktopWidgets() {
  const container = document.getElementById('os-desktop-widgets');
  if (!container) return;

  const renderWidgets = () => {
    const state = store.get();
    const levelInfo = calculateLevelInfo(state.profile.totalXP, state.levelTiers);
    const todayStr = new Date().toISOString().split('T')[0];

    // Next assignment
    const nextAssignment = (state.assignments || [])
      .filter((a) => a.status !== 'Completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];
    const daysLeft = nextAssignment ? getDaysLeft(nextAssignment.deadline) : null;

    // Pending tasks
    const pendingTasks = (state.kanbanCards || []).filter(c => c.column !== 'Done').slice(0, 3);

    container.innerHTML = `
      <!-- XP & Level Widget -->
      <div class="widget-card widget-col-2" data-open="achievements" style="cursor: pointer;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: #f59e0b; font-weight: 700; display: flex; align-items: center; gap: 4px;">
              ${getIcon('flame', 'w-4 h-4')} ${state.profile.streak} DAY STREAK
            </span>
            <span class="badge badge-primary">Level ${levelInfo.level}</span>
          </div>
          <h3 style="font-size: 1.125rem; font-family: var(--font-display);">${escapeHtml(levelInfo.title)}</h3>
          <div class="progress-bar-container" style="margin-top: var(--space-3);">
            <div class="progress-bar-fill" style="width: ${levelInfo.progressPercent}%;"></div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; font-family: var(--font-mono); color: var(--os-text-subtle); border-top: 1px solid var(--os-border); padding-top: var(--space-2); margin-top: var(--space-2);">
          <span>${levelInfo.totalXP.toLocaleString()} Total XP</span>
          <span>${levelInfo.xpInCurrentLevel} / ${levelInfo.xpNeededForLevel} XP</span>
        </div>
      </div>

      <!-- Quick 25-min Focus Sprint Widget -->
      <div class="widget-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: #f59e0b; font-weight: 700;">FOCUS SPRINT</span>
          <button class="btn btn-ghost btn-xs" data-open="focus">Open App →</button>
        </div>
        <div style="text-align: center; margin: auto 0;">
          <div style="font-family: var(--font-mono); font-size: 2rem; font-weight: 800; color: #ffffff;" id="desktop-timer-display">25:00</div>
          <div style="font-size: 0.6875rem; color: var(--os-text-muted);">Standard Pomodoro Block</div>
        </div>
        <div style="display: flex; justify-content: center; gap: var(--space-2); border-top: 1px solid var(--os-border); padding-top: var(--space-2);">
          <button class="btn btn-primary btn-xs" id="desktop-timer-toggle">Start</button>
          <button class="btn btn-secondary btn-xs" id="desktop-timer-reset">Reset</button>
        </div>
      </div>

      <!-- Next Deadline Widget -->
      <div class="widget-card" data-open="academics" style="cursor: pointer;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: #ec4899; font-weight: 700;">NEXT DEADLINE</span>
          <span style="font-size: 0.6875rem; color: var(--os-text-subtle);">Academics →</span>
        </div>
        <div style="margin: auto 0;">
          ${nextAssignment ? `
            <div style="font-size: 0.6875rem; color: #ec4899; font-family: var(--font-mono); font-weight: 700;">${escapeHtml(nextAssignment.subject)}</div>
            <h4 style="font-size: 0.875rem; font-weight: 700; margin-top: 2px;" class="line-clamp-2">${escapeHtml(nextAssignment.title)}</h4>
            <span class="badge badge-error" style="margin-top: 6px;">Due in ${daysLeft} days</span>
          ` : `
            <div style="color: var(--os-text-subtle); font-size: 0.75rem;">No upcoming assignment deadlines!</div>
          `}
        </div>
        <div style="border-top: 1px solid var(--os-border); padding-top: var(--space-2); font-size: 0.6875rem; color: var(--os-text-subtle);">
          Standing: First Class Track
        </div>
      </div>

      <!-- Today's Habits Widget -->
      <div class="widget-card widget-col-2">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-success); font-weight: 700;">TODAY'S HABIT STANDARDS</span>
          <button class="btn btn-ghost btn-xs" data-open="habits">All Habits →</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-2); margin: var(--space-2) 0;">
          ${(state.habits || []).slice(0, 4).map(h => {
            const isDone = h.completedDates?.includes(todayStr);
            return `
              <div style="padding: 8px 12px; background: var(--os-bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--os-border); display: flex; align-items: center; justify-content: space-between; cursor: pointer;" data-quick-habit="${h.id}">
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  <div class="habit-check-btn ${isDone ? 'checked' : ''}" style="width: 18px; height: 18px;">
                    ${isDone ? getIcon('check', 'w-2.5 h-2.5') : ''}
                  </div>
                  <span style="font-size: 0.75rem; font-weight: 600; text-decoration: ${isDone ? 'line-through' : 'none'}; color: ${isDone ? 'var(--os-text-muted)' : 'var(--os-text)'};" class="truncate">
                    ${escapeHtml(h.name)}
                  </span>
                </div>
                <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: #f59e0b; font-weight: 700;">${h.currentStreak || 0}d</span>
              </div>
            `;
          }).join('')}
        </div>
        <div style="border-top: 1px solid var(--os-border); padding-top: var(--space-2); font-size: 0.6875rem; color: var(--os-text-subtle);">
          Click to mark complete and earn XP
        </div>
      </div>

      <!-- Mindset Quote Widget -->
      <div class="widget-card widget-col-2" style="background: linear-gradient(135deg, rgba(139,92,246,0.12) 0%, var(--os-bg-card) 100%);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: #a855f7; font-weight: 700;">MINDSET STANDARD</span>
          <button class="btn btn-ghost btn-xs" id="btn-shuffle-quote">Shuffle ↻</button>
        </div>
        <div style="margin: auto 0;">
          <blockquote id="desktop-quote-text" style="font-size: 0.875rem; font-style: italic; line-height: 1.5; color: #ffffff;">
            "Build the person you want to become, one small standard at a time."
          </blockquote>
          <div id="desktop-quote-author" style="text-align: right; font-size: 0.6875rem; color: var(--os-text-muted); font-family: var(--font-mono); margin-top: 6px;">
            — College OS Principle
          </div>
        </div>
      </div>
    `;

    // Widget open window handlers
    container.querySelectorAll('[data-open]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          const id = el.getAttribute('data-open');
          windowManager.openWindow(id);
        }
      });
    });

    // Quick habit completion from desktop
    container.querySelectorAll('[data-quick-habit]').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.getAttribute('data-quick-habit');
        store.setHabits(prev => prev.map(h => {
          if (h.id === id) {
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
        renderWidgets();
      });
    });

    // Desktop timer sprint
    let deskTime = 25 * 60;
    let deskRunning = false;
    let deskInterval = null;

    const timerDisplay = container.querySelector('#desktop-timer-display');
    const timerToggle = container.querySelector('#desktop-timer-toggle');
    const timerReset = container.querySelector('#desktop-timer-reset');

    timerToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundService.playClick();
      if (deskRunning) {
        deskRunning = false;
        clearInterval(deskInterval);
        timerToggle.textContent = 'Start';
      } else {
        deskRunning = true;
        timerToggle.textContent = 'Pause';
        deskInterval = setInterval(() => {
          if (deskTime > 0) {
            deskTime--;
            const m = Math.floor(deskTime / 60);
            const s = deskTime % 60;
            if (timerDisplay) timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          } else {
            clearInterval(deskInterval);
            deskRunning = false;
            soundService.playTimerEnd();
            awardXP(50, "Desktop Sprint Complete", e.clientX, e.clientY);
            deskTime = 25 * 60;
            if (timerDisplay) timerDisplay.textContent = '25:00';
            timerToggle.textContent = 'Start';
          }
        }, 1000);
      }
    });

    timerReset?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundService.playClick();
      deskRunning = false;
      clearInterval(deskInterval);
      deskTime = 25 * 60;
      if (timerDisplay) timerDisplay.textContent = '25:00';
      if (timerToggle) timerToggle.textContent = 'Start';
    });

    // Shuffle quotes
    const quotes = [
      { text: "Build the person you want to become, one small standard at a time.", author: "College OS" },
      { text: "You don't need motivation. You need one focused hour.", author: "Deep Work" },
      { text: "One bad day doesn't erase the person you're becoming. Reset and show up.", author: "Marcus Aurelius" },
      { text: "You said you would. Then you did. That is how self-respect is forged.", author: "Identity Protocol" }
    ];

    container.querySelector('#btn-shuffle-quote')?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundService.playClick();
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      const qText = container.querySelector('#desktop-quote-text');
      const qAuth = container.querySelector('#desktop-quote-author');
      if (qText) qText.textContent = `"${q.text}"`;
      if (qAuth) qAuth.textContent = `— ${q.author}`;
    });
  };

  renderWidgets();

  // Re-render desktop widgets when store changes
  store.subscribe(() => {
    // only if window is closed or background
  });

  // Desktop quick capture input
  const quickForm = document.getElementById('hero-quick-form');
  const quickInput = document.getElementById('hero-quick-input');
  quickForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!quickInput || !quickInput.value.trim()) return;
    const title = quickInput.value.trim();

    store.setKanbanCards(prev => [
      {
        id: `kc-${Date.now()}`,
        title: title,
        column: 'To Do',
        priority: 'high',
        deadline: new Date().toISOString().split('T')[0],
        labels: ['Quick Task']
      },
      ...prev
    ]);

    awardXP(20, `Captured task: ${title}`);
    quickInput.value = '';
    renderWidgets();
  });
}

/* ==========================================================================
   DOCK & MOBILE APP DRAWER
   ========================================================================== */
function initDock() {
  const dock = document.getElementById('os-dock');
  if (!dock) return;

  const apps = Object.values(APP_METADATA);
  dock.innerHTML = apps.map(app => `
    <div class="dock-item" data-app-id="${app.id}">
      ${getIcon(app.icon, 'w-6 h-6')}
      <span class="dock-tooltip">${app.title}</span>
      <div class="dock-item-dot"></div>
    </div>
  `).join('');

  // Click on dock item
  dock.querySelectorAll('.dock-item').forEach(item => {
    item.addEventListener('click', () => {
      const appId = item.getAttribute('data-app-id');
      item.classList.add('launching');
      setTimeout(() => item.classList.remove('launching'), 700);
      windowManager.openWindow(appId);
    });
  });

  // Mobile Nav Tab buttons
  document.querySelectorAll('.mobile-tab-btn[data-app]').forEach(btn => {
    btn.addEventListener('click', () => {
      const appId = btn.getAttribute('data-app');
      windowManager.openWindow(appId);
    });
  });

  // Mobile All Apps Drawer Trigger
  const allAppsBtn = document.getElementById('mobile-all-apps-btn');
  const mobileDrawer = document.getElementById('mobile-apps-drawer');
  const closeDrawerBtn = document.getElementById('close-mobile-drawer');

  allAppsBtn?.addEventListener('click', () => {
    soundService.playClick();
    if (mobileDrawer) {
      mobileDrawer.classList.add('open');
      const grid = mobileDrawer.querySelector('#mobile-drawer-grid');
      if (grid) {
        grid.innerHTML = apps.map(app => `
          <div style="background: var(--os-bg-card); border: 1px solid var(--os-border); border-radius: var(--radius-lg); padding: var(--space-4); display: flex; flex-direction: column; align-items: center; gap: var(--space-2); cursor: pointer;" data-mobile-launch="${app.id}">
            <div style="color: ${app.color || 'var(--os-accent)'};">${getIcon(app.icon, 'w-7 h-7')}</div>
            <div style="font-size: 0.75rem; font-weight: 700; text-align: center;">${app.title}</div>
          </div>
        `).join('');

        grid.querySelectorAll('[data-mobile-launch]').forEach(tile => {
          tile.addEventListener('click', () => {
            const id = tile.getAttribute('data-mobile-launch');
            mobileDrawer.classList.remove('open');
            windowManager.openWindow(id);
          });
        });
      }
    }
  });

  closeDrawerBtn?.addEventListener('click', () => {
    mobileDrawer?.classList.remove('open');
  });
}

/* ==========================================================================
   QUICK CAPTURE MODAL
   ========================================================================== */
function initQuickCapture() {
  const modal = document.getElementById('quick-capture-modal');
  if (!modal) return;

  const form = modal.querySelector('#quick-capture-form');
  const closeBtn = modal.querySelector('#close-quick-capture');
  const typeBtns = modal.querySelectorAll('.tab-btn[data-qc-type]');

  let captureType = 'task';

  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      captureType = btn.getAttribute('data-qc-type');
    });
  });

  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleInput = modal.querySelector('#qc-title-input');
    const title = titleInput?.value.trim();
    if (!title) return;

    if (captureType === 'task') {
      store.setKanbanCards(prev => [
        {
          id: `kc-${Date.now()}`,
          title: title,
          column: 'To Do',
          priority: 'high',
          deadline: new Date().toISOString().split('T')[0],
          labels: ['Quick Task']
        },
        ...prev
      ]);
      awardXP(20, `Task captured: ${title}`);
    } else if (captureType === 'habit') {
      store.setHabits(prev => [
        {
          id: `h-${Date.now()}`,
          name: title,
          category: 'Personal',
          type: 'checkbox',
          target: 1,
          unit: 'session',
          xp: 35,
          frequency: 'daily',
          currentStreak: 0,
          longestStreak: 0,
          active: true,
          completedDates: []
        },
        ...prev
      ]);
      awardXP(30, `Habit captured: ${title}`);
    } else if (captureType === 'note') {
      store.setNotes(prev => [
        {
          id: `n-${Date.now()}`,
          title: title,
          subject: 'Quick Note',
          pinned: false,
          tags: ['Quick'],
          content: `# ${title}\n\nCaptured at ${new Date().toLocaleTimeString()}`,
          updatedAt: new Date().toISOString()
        },
        ...prev
      ]);
      awardXP(20, `Note captured: ${title}`);
    }

    titleInput.value = '';
    modal.classList.remove('open');
  });
}

/* ==========================================================================
   BOOT SCREEN
   ========================================================================== */
function initBootScreen() {
  const bootScreen = document.getElementById('boot-screen');
  if (!bootScreen) return;

  const alreadyBooted = sessionStorage.getItem('COLLEGE_OS_BOOTED');
  if (alreadyBooted === 'true') {
    bootScreen.remove();
    return;
  }

  const logsEl = document.getElementById('boot-terminal-logs');
  const messages = [
    "Initializing College OS kernel...",
    "Mounting academic database & habit engine...",
    "Syncing goal milestones and gamification engine...",
    `Loading user profile: ${store.get().profile.name || 'Scholar'}`,
    `Day ${store.get().profile.streak} of your unstoppable streak.`
  ];

  let step = 0;
  const interval = setInterval(() => {
    if (step < messages.length) {
      const line = document.createElement('div');
      line.textContent = `> ${messages[step]}`;
      logsEl.appendChild(line);
      step++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        dismissBoot();
      }, 400);
    }
  }, 280);

  const dismissBoot = () => {
    sessionStorage.setItem('COLLEGE_OS_BOOTED', 'true');
    bootScreen.style.opacity = '0';
    setTimeout(() => bootScreen.remove(), 500);
  };

  bootScreen.addEventListener('click', dismissBoot);
  window.addEventListener('keydown', (e) => {
    if (['Escape', 'Enter', ' '].includes(e.key)) {
      dismissBoot();
    }
  });
}
