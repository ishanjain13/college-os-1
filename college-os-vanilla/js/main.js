// COLLEGE OS - Main System Bootstrap (ES6 Modules)

import store, { APP_METADATA } from './state.js';
import { initTheme, applyTheme, applyAccent, toggleTheme } from './theme.js';
import soundService from './sound.js';
import windowManager from './windowManager.js';
import commandPalette from './commandPalette.js';
import { calculateLevelInfo, awardXP } from './xpSystem.js';
import { triggerConfetti } from './confetti.js';
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

  // 4. Initialize Wallpaper Engine (with 5 themes)
  initWallpaperEngine();

  // 5. Initialize Top Bar (Clock, Menus, Quick Actions)
  initTopBar();

  // 6. Dynamic Hero Profile & Time-based Greeting
  renderHeroProfile();

  // 7. Desktop App Shortcuts
  initDesktopShortcuts();

  // 8. Desktop Context Menu (Right Click)
  initDesktopContextMenu();

  // 9. Initialize Desktop Widgets
  initDesktopWidgets();

  // 10. Initialize Dock & Mobile Navigation
  initDock();

  // 11. Initialize Quick Capture Modal
  initQuickCapture();

  // 12. First-Run Onboarding Setup
  initOnboarding();

  // 13. Initialize Boot Screen
  initBootScreen();

  // 14. Open Dashboard Window by default on desktop if onboarding was already done
  if (window.innerWidth >= 768 && state.profile.onboardingCompleted) {
    windowManager.openWindow('dashboard');
  }

  // 15. Global state subscriber for hero profile & wallpaper
  store.subscribe(() => {
    renderHeroProfile();
  });

  // 16. Ripple effect on all buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) addRipple(e);
  });
});

/* ==========================================================================
   WALLPAPER PARTICLE ENGINE (60fps Canvas, 5 Dynamic Modes)
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

  let particles = [];
  const initParticles = () => {
    particles = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.4 + 0.1
      });
    }
  };
  initParticles();

  window.refreshWallpaper = () => {
    initParticles();
  };

  let isPaused = document.hidden;
  document.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
  });

  let gridOffset = 0;

  function render() {
    if (!isPaused) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const state = store.get();
      const wpMode = state.appearance?.wallpaper || 'aurora';
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

      if (wpMode === 'cyber_grid') {
        // Perspective Cyber Grid
        gridOffset = (gridOffset + 0.35) % 40;
        ctx.strokeStyle = isDark ? 'rgba(99, 102, 241, 0.14)' : 'rgba(99, 102, 241, 0.09)';
        ctx.lineWidth = 1;

        const horizonY = canvas.height * 0.55;
        for (let y = horizonY; y < canvas.height; y += Math.max(8, (y - horizonY) * 0.25)) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        const vpX = canvas.width / 2;
        for (let x = -canvas.width; x < canvas.width * 2; x += 60) {
          ctx.beginPath();
          ctx.moveTo(vpX, horizonY);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
      } else if (wpMode === 'deep_space') {
        // Starfield particles
        for (let p of particles) {
          p.z -= 0.8;
          if (p.z <= 0) p.z = canvas.width;
          const k = 128.0 / p.z;
          const px = (p.x - canvas.width / 2) * k + canvas.width / 2;
          const py = (p.y - canvas.height / 2) * k + canvas.height / 2;
          const size = Math.max(0.5, (1 - p.z / canvas.width) * 2.8);

          if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, 1 - p.z / canvas.width)})`;
            ctx.fill();
          }
        }
      }

      // Floating particles for aurora, lofi, minimal
      if (wpMode !== 'deep_space') {
        for (let p of particles) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

          if (wpMode === 'lofi_room') {
            ctx.fillStyle = isDark ? `rgba(245, 158, 11, ${p.alpha * 0.8})` : `rgba(245, 158, 11, 0.25)`;
          } else if (wpMode === 'minimal_gradient') {
            ctx.fillStyle = isDark ? `rgba(148, 163, 184, ${p.alpha * 0.5})` : `rgba(100, 116, 139, 0.2)`;
          } else {
            ctx.fillStyle = isDark
              ? `rgba(99, 102, 241, ${p.alpha})`
              : `rgba(99, 102, 241, ${p.alpha * 0.6})`;
          }
          ctx.fill();
        }
      }
    }
    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   DYNAMIC HERO PROFILE & GREETING
   ========================================================================== */
function renderHeroProfile() {
  const state = store.get();
  const collegeCourseEl = document.getElementById('hero-college-course');
  const greetingTextEl = document.getElementById('hero-greeting-text');
  const userNameEl = document.getElementById('hero-user-name');

  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good day';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17 && hour < 22) greeting = 'Good evening';
  else greeting = 'Night grind active';

  if (collegeCourseEl) {
    const college = state.profile.college || 'Stanford University';
    const course = state.profile.course || 'Computer Science & AI';
    const year = state.profile.year || 'Sophomore (Year 2)';
    collegeCourseEl.textContent = `${college} • ${course} (${year})`;
  }

  if (greetingTextEl) {
    greetingTextEl.textContent = greeting;
  }

  if (userNameEl) {
    userNameEl.textContent = state.profile.name || 'Scholar';
  }
}

/* ==========================================================================
   DESKTOP APP SHORTCUTS (Fast Visual Launchers)
   ========================================================================== */
function initDesktopShortcuts() {
  const container = document.getElementById('desktop-shortcuts-grid');
  if (!container) return;

  const shortcuts = [
    { id: 'dashboard', title: 'Command Center', icon: 'layout-dashboard', color: '#6366f1' },
    { id: 'academics', title: 'Academic Hub', icon: 'graduation-cap', color: '#3b82f6' },
    { id: 'planner', title: 'Daily Planner', icon: 'calendar', color: '#8b5cf6' },
    { id: 'habits', title: 'Habit Tracker', icon: 'check-circle', color: '#10b981' },
    { id: 'focus', title: 'Deep Focus', icon: 'timer', color: '#f59e0b' },
    { id: 'notes', title: 'Markdown Notes', icon: 'book-open', color: '#06b6d4' },
    { id: 'career', title: 'Career Hub', icon: 'briefcase', color: '#6366f1' },
    { id: 'money', title: 'Budget Vault', icon: 'wallet', color: '#14b8a6' },
    { id: 'settings', title: 'Settings', icon: 'settings', color: '#94a3b8' }
  ];

  container.innerHTML = shortcuts.map(app => `
    <div class="desktop-shortcut-item" data-shortcut-id="${app.id}" tabindex="0" role="button" aria-label="Open ${app.title}">
      <div class="desktop-shortcut-icon" style="background: linear-gradient(135deg, ${app.color}28 0%, ${app.color}10 100%); border: 1px solid ${app.color}45; color: ${app.color};">
        ${getIcon(app.icon, 'w-6 h-6')}
      </div>
      <span class="desktop-shortcut-label">${app.title}</span>
    </div>
  `).join('');

  container.querySelectorAll('.desktop-shortcut-item').forEach(el => {
    const appId = el.getAttribute('data-shortcut-id');
    const launch = () => {
      soundService.playClick();
      windowManager.openWindow(appId);
    };

    el.addEventListener('click', launch);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        launch();
      }
    });
  });
}

/* ==========================================================================
   DESKTOP RIGHT-CLICK CONTEXT MENU
   ========================================================================== */
function initDesktopContextMenu() {
  const menu = document.getElementById('desktop-context-menu');
  const desktop = document.getElementById('os-desktop');
  if (!menu || !desktop) return;

  const closeMenu = () => {
    menu.classList.remove('open');
  };

  const handleContextMenu = (e) => {
    if (e.target.closest('.os-window') || e.target.closest('.modal-card') || ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      closeMenu();
      return;
    }

    e.preventDefault();
    soundService.playClick();

    const menuW = 230;
    const menuH = 340;
    let posX = e.clientX;
    let posY = e.clientY;

    if (posX + menuW > window.innerWidth) posX = window.innerWidth - menuW - 12;
    if (posY + menuH > window.innerHeight) posY = window.innerHeight - menuH - 12;

    menu.style.left = `${Math.max(12, posX)}px`;
    menu.style.top = `${Math.max(48, posY)}px`;
    menu.classList.add('open');
  };

  desktop.addEventListener('contextmenu', handleContextMenu);
  document.getElementById('wallpaper-canvas')?.addEventListener('contextmenu', handleContextMenu);

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) {
      closeMenu();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
    }
  });

  menu.querySelectorAll('[data-ctx]').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-ctx');
      closeMenu();
      soundService.playClick();

      if (action === 'quick-task') {
        document.getElementById('quick-capture-modal')?.classList.add('open');
      } else if (action === 'quick-note') {
        windowManager.openWindow('notes');
      } else if (action === 'open-dashboard') {
        windowManager.openWindow('dashboard');
      } else if (action === 'toggle-theme') {
        toggleTheme();
      } else if (action === 'open-settings') {
        windowManager.openWindow('settings');
      } else if (action === 'open-onboarding') {
        openOnboardingModal();
      } else if (action === 'refresh-os') {
        initDesktopWidgets();
        initDesktopShortcuts();
        renderHeroProfile();
      }
    });
  });

  menu.querySelectorAll('[data-ctx-wp]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const wp = item.getAttribute('data-ctx-wp');
      store.updateAppearance({ wallpaper: wp });
      if (window.refreshWallpaper) window.refreshWallpaper();
      closeMenu();
      soundService.playClick();
    });
  });

  menu.querySelectorAll('[data-ctx-accent]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const acc = item.getAttribute('data-ctx-accent');
      applyAccent(acc);
      closeMenu();
      soundService.playClick();
    });
  });
}

/* ==========================================================================
   FIRST-RUN ONBOARDING SETUP WIZARD
   ========================================================================== */
let currentOnboardingStep = 1;

function initOnboarding() {
  const state = store.get();
  if (!state.profile.onboardingCompleted) {
    setTimeout(() => {
      openOnboardingModal();
    }, 600);
  }
}

export function openOnboardingModal() {
  const modal = document.getElementById('onboarding-modal');
  if (!modal) return;

  currentOnboardingStep = 1;
  renderOnboardingStep();
  modal.classList.add('open');
}

window.openOnboardingModal = openOnboardingModal;

function renderOnboardingStep() {
  const modal = document.getElementById('onboarding-modal');
  if (!modal) return;

  const container = modal.querySelector('#onboarding-step-container');
  const fill = modal.querySelector('#onboarding-progress-fill');
  const indicator = modal.querySelector('#onboarding-step-indicator');
  const backBtn = modal.querySelector('#onboarding-back-btn');
  const nextBtn = modal.querySelector('#onboarding-next-btn');
  const skipBtn = modal.querySelector('#skip-onboarding-btn');

  const state = store.get();
  if (fill) fill.style.width = `${(currentOnboardingStep / 3) * 100}%`;
  if (indicator) indicator.textContent = `Step ${currentOnboardingStep} of 3`;

  if (backBtn) backBtn.style.display = currentOnboardingStep > 1 ? 'block' : 'none';
  if (nextBtn) nextBtn.textContent = currentOnboardingStep === 3 ? 'Finish & Launch 🚀' : 'Continue →';

  if (!container) return;

  if (currentOnboardingStep === 1) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        <div>
          <h4 style="font-size: 1.125rem; font-weight: 700; color: #ffffff;">Who is stepping into the driver's seat?</h4>
          <p style="font-size: 0.75rem; color: var(--os-text-muted); margin-top: 2px;">Set up your academic identity and university profile.</p>
        </div>

        <div class="form-group" style="margin-top: var(--space-2);">
          <label class="form-label">Full Name / Preferred Name</label>
          <input type="text" id="ob-name" class="form-input" placeholder="e.g. Ishan or Alex" value="${escapeHtml(state.profile.name || '')}" />
        </div>

        <div class="form-group">
          <label class="form-label">College / University</label>
          <input type="text" id="ob-college" class="form-input" placeholder="e.g. Stanford University or JECRC University" value="${escapeHtml(state.profile.college || '')}" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div class="form-group">
            <label class="form-label">Course / Major</label>
            <input type="text" id="ob-course" class="form-input" placeholder="e.g. Computer Science & AI" value="${escapeHtml(state.profile.course || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label">Academic Year</label>
            <input type="text" id="ob-year" class="form-input" placeholder="e.g. Sophomore (Year 2)" value="${escapeHtml(state.profile.year || '')}" />
          </div>
        </div>
      </div>
    `;
  } else if (currentOnboardingStep === 2) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        <div>
          <h4 style="font-size: 1.125rem; font-weight: 700; color: #ffffff;">What is your defining ambition this term?</h4>
          <p style="font-size: 0.75rem; color: var(--os-text-muted); margin-top: 2px;">Anchor your daily standards to an ambitious long-term goal.</p>
        </div>

        <div class="form-group" style="margin-top: var(--space-2);">
          <label class="form-label">Defining Mission / North Star</label>
          <input type="text" id="ob-goal" class="form-input" placeholder="e.g. Master AI Research & Land Top Internship" value="Master Deep Learning & Land AI Internship" />
        </div>

        <div class="form-group">
          <label class="form-label">Daily Deep Work Target (Minutes)</label>
          <select id="ob-focus-target" class="form-input">
            <option value="60">60 Minutes / Day (Solid Baseline)</option>
            <option value="90" selected>90 Minutes / Day (High Output)</option>
            <option value="120">120 Minutes / Day (Machine Mode)</option>
            <option value="180">180+ Minutes / Day (Elite Grind)</option>
          </select>
        </div>
      </div>
    `;
  } else if (currentOnboardingStep === 3) {
    const currentAccent = state.appearance.accentColor || 'indigo';
    const accents = [
      { id: 'indigo', name: 'Indigo', color: '#6366f1' },
      { id: 'violet', name: 'Violet', color: '#8b5cf6' },
      { id: 'cyan', name: 'Cyan Ocean', color: '#06b6d4' },
      { id: 'emerald', name: 'Emerald', color: '#10b981' },
      { id: 'rose', name: 'Rose', color: '#f43f5e' },
      { id: 'amber', name: 'Amber', color: '#f59e0b' }
    ];

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        <div>
          <h4 style="font-size: 1.125rem; font-weight: 700; color: #ffffff;">Choose your visual aesthetic</h4>
          <p style="font-size: 0.75rem; color: var(--os-text-muted); margin-top: 2px;">Select your signature accent color and wallpaper.</p>
        </div>

        <div class="form-group" style="margin-top: var(--space-2);">
          <label class="form-label">Material 3 Accent Theme</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2);">
            ${accents.map(acc => `
              <button type="button" class="btn btn-secondary btn-sm ob-accent-choice ${currentAccent === acc.id ? 'active' : ''}" data-acc="${acc.id}" style="display: flex; align-items: center; gap: 8px; justify-content: flex-start; ${currentAccent === acc.id ? `border-color: ${acc.color}; box-shadow: 0 0 12px ${acc.color}40;` : ''}">
                <span style="width: 12px; height: 12px; border-radius: var(--radius-full); background: ${acc.color};"></span>
                <span style="font-size: 0.75rem;">${acc.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Wallpaper Dynamic Style</label>
          <select id="ob-wp-select" class="form-input">
            <option value="aurora" selected>Aurora Glow (Particle Gradient)</option>
            <option value="cyber_grid">Cyber Grid (Horizon Grid)</option>
            <option value="deep_space">Deep Space (3D Starfield)</option>
            <option value="lofi_room">Lo-Fi Ambient (Warm Bokeh)</option>
            <option value="minimal_gradient">Minimal Slate (Clean Focus)</option>
          </select>
        </div>
      </div>
    `;

    container.querySelectorAll('.ob-accent-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        const acc = btn.getAttribute('data-acc');
        applyAccent(acc);
        container.querySelectorAll('.ob-accent-choice').forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = '';
          b.style.boxShadow = '';
        });
        btn.classList.add('active');
        const color = accents.find(a => a.id === acc)?.color;
        if (color) {
          btn.style.borderColor = color;
          btn.style.boxShadow = `0 0 12px ${color}40`;
        }
      });
    });
  }

  backBtn.onclick = () => {
    soundService.playClick();
    if (currentOnboardingStep > 1) {
      currentOnboardingStep--;
      renderOnboardingStep();
    }
  };

  nextBtn.onclick = () => {
    soundService.playClick();
    if (currentOnboardingStep === 1) {
      const name = modal.querySelector('#ob-name')?.value.trim();
      const college = modal.querySelector('#ob-college')?.value.trim();
      const course = modal.querySelector('#ob-course')?.value.trim();
      const year = modal.querySelector('#ob-year')?.value.trim();

      store.updateProfile({
        name: name || 'Scholar',
        college: college || 'Stanford University / MIT',
        course: course || 'Computer Science & AI',
        year: year || 'Sophomore (Year 2)'
      });

      currentOnboardingStep = 2;
      renderOnboardingStep();
    } else if (currentOnboardingStep === 2) {
      currentOnboardingStep = 3;
      renderOnboardingStep();
    } else if (currentOnboardingStep === 3) {
      const wp = modal.querySelector('#ob-wp-select')?.value || 'aurora';
      store.updateAppearance({ wallpaper: wp });
      store.updateProfile({ onboardingCompleted: true });

      if (window.refreshWallpaper) window.refreshWallpaper();
      renderHeroProfile();

      awardXP(100, "Completed College OS Onboarding Setup");
      triggerConfetti(100);
      modal.classList.remove('open');

      if (window.innerWidth >= 768) {
        windowManager.openWindow('dashboard');
      }
    }
  };

  skipBtn.onclick = () => {
    soundService.playClick();
    store.updateProfile({ onboardingCompleted: true });
    modal.classList.remove('open');
    renderHeroProfile();
    if (window.innerWidth >= 768) {
      windowManager.openWindow('dashboard');
    }
  };
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
   BOOT SCREEN (Session-Based & Instantly Skippable)
   ========================================================================== */
function initBootScreen() {
  const bootScreen = document.getElementById('boot-screen');
  if (!bootScreen) return;

  const state = store.get();
  const alreadyBooted = sessionStorage.getItem('COLLEGE_OS_BOOTED');
  if (alreadyBooted === 'true' || state.profile.bootSequenceEnabled === false) {
    bootScreen.remove();
    return;
  }

  const logsEl = document.getElementById('boot-terminal-logs');
  const messages = [
    "Initializing College OS kernel v2.5...",
    "Mounting academic database & habit engine...",
    "Syncing goal milestones and gamification engine...",
    `Loading student profile: ${state.profile.name || 'Scholar'}`,
    `Day ${state.profile.streak || 0} of your daily momentum streak.`,
    "Ready. Welcome back to College OS."
  ];

  let step = 0;
  let dismissed = false;

  const dismissBoot = () => {
    if (dismissed) return;
    dismissed = true;
    clearInterval(interval);
    sessionStorage.setItem('COLLEGE_OS_BOOTED', 'true');
    bootScreen.style.opacity = '0';
    setTimeout(() => {
      try { bootScreen.remove(); } catch (e) {}
    }, 400);
  };

  const interval = setInterval(() => {
    if (step < messages.length) {
      const line = document.createElement('div');
      line.textContent = `> ${messages[step]}`;
      logsEl?.appendChild(line);
      step++;
    } else {
      clearInterval(interval);
      setTimeout(dismissBoot, 400);
    }
  }, 220);

  bootScreen.addEventListener('click', dismissBoot);
  window.addEventListener('keydown', (e) => {
    if (['Escape', 'Enter', ' '].includes(e.key)) {
      dismissBoot();
    }
  });
}
