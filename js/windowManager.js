// COLLEGE OS - Complete Desktop Window Manager

import { APP_METADATA } from './state.js';
import { getIcon } from './icons.js';
import soundService from './sound.js';

class WindowManager {
  constructor() {
    this.windows = new Map(); // id -> { data, element, appInstance }
    this.apps = new Map(); // id -> App Object { id, title, icon, render, init, destroy }
    this.topZ = 100;
    this.activeWindowId = null;
    this.container = null;
    this.snapPreview = null;
  }

  init(containerEl) {
    this.container = containerEl;
    this.snapPreview = document.getElementById('snap-preview');

    window.addEventListener('resize', () => {
      this.handleGlobalResize();
    });
  }

  registerApp(app) {
    this.apps.set(app.id, app);
  }

  openWindow(appId) {
    soundService.playClick();
    const app = this.apps.get(appId) || APP_METADATA[appId];
    if (!app) {
      console.warn(`App not registered: ${appId}`);
      return;
    }

    // If window already open, un-minimize & focus it
    if (this.windows.has(appId)) {
      const winObj = this.windows.get(appId);
      winObj.element.classList.remove('minimized');
      this.focusWindow(appId);
      return;
    }

    const meta = APP_METADATA[appId] || { title: appId, icon: 'sparkles' };
    const isMobile = window.innerWidth < 768;

    // Window dimensions & initial staggered coordinates
    const offset = (this.windows.size % 5) * 28;
    const defaultW = Math.min(1040, Math.max(760, window.innerWidth - 120));
    const defaultH = Math.min(680, Math.max(520, window.innerHeight - 150));
    const defaultX = Math.max(40, (window.innerWidth - defaultW) / 2 + offset);
    const defaultY = Math.max(54, (window.innerHeight - defaultH) / 2 - 20 + offset);

    const winData = {
      id: appId,
      title: meta.title,
      icon: meta.icon,
      x: defaultX,
      y: defaultY,
      w: defaultW,
      h: defaultH,
      isMaximized: false,
      isMinimized: false,
      zIndex: ++this.topZ
    };

    const winEl = document.createElement('div');
    winEl.className = 'os-window';
    winEl.id = `window-${appId}`;
    winEl.style.zIndex = winData.zIndex;
    winEl.style.left = `${winData.x}px`;
    winEl.style.top = `${winData.y}px`;
    winEl.style.width = `${winData.w}px`;
    winEl.style.height = `${winData.h}px`;

    // Render Window Shell
    winEl.innerHTML = `
      <div class="window-titlebar" id="titlebar-${appId}">
        <div class="window-controls">
          <button class="win-btn win-btn-close" title="Close" data-action="close">${getIcon('x')}</button>
          <button class="win-btn win-btn-min" title="Minimize" data-action="minimize">${getIcon('minus')}</button>
          <button class="win-btn win-btn-max" title="Maximize" data-action="maximize">${getIcon('square')}</button>
        </div>
        <div class="window-title-content">
          <div class="window-app-icon">${getIcon(meta.icon, 'w-4 h-4')}</div>
          <span>${meta.title}</span>
        </div>
        <div class="window-actions"></div>
      </div>
      <div class="window-body" id="winbody-${appId}">
        <!-- App content will be injected here -->
      </div>
      <div class="window-resizer resizer-r" data-resize="r"></div>
      <div class="window-resizer resizer-b" data-resize="b"></div>
      <div class="window-resizer resizer-br" data-resize="br"></div>
    `;

    this.container.appendChild(winEl);

    // Setup drag and controls
    this.setupWindowInteractions(winEl, winData);

    // Mount App
    const registeredApp = this.apps.get(appId);
    let appInstance = null;
    if (registeredApp) {
      const bodyEl = winEl.querySelector(`#winbody-${appId}`);
      bodyEl.innerHTML = registeredApp.render();
      if (registeredApp.init) {
        registeredApp.init(bodyEl);
      }
      appInstance = registeredApp;
    }

    this.windows.set(appId, { data: winData, element: winEl, appInstance });
    this.focusWindow(appId);
    this.updateDockState();
  }

  closeWindow(appId) {
    soundService.playClick();
    if (!this.windows.has(appId)) return;
    const winObj = this.windows.get(appId);

    // Call app destroy if exists
    if (winObj.appInstance && winObj.appInstance.destroy) {
      try {
        winObj.appInstance.destroy();
      } catch (e) {
        console.warn('Destroy error:', e);
      }
    }

    winObj.element.remove();
    this.windows.delete(appId);
    this.updateDockState();

    // Focus top remaining window
    const remaining = Array.from(this.windows.values());
    if (remaining.length > 0) {
      remaining.sort((a, b) => b.data.zIndex - a.data.zIndex);
      this.focusWindow(remaining[0].data.id);
    } else {
      this.activeWindowId = null;
    }
  }

  minimizeWindow(appId) {
    soundService.playClick();
    if (!this.windows.has(appId)) return;
    const winObj = this.windows.get(appId);
    winObj.element.classList.add('minimized');
    winObj.data.isMinimized = true;

    if (this.activeWindowId === appId) {
      const remaining = Array.from(this.windows.values()).filter(w => !w.data.isMinimized);
      if (remaining.length > 0) {
        remaining.sort((a, b) => b.data.zIndex - a.data.zIndex);
        this.focusWindow(remaining[0].data.id);
      } else {
        this.activeWindowId = null;
      }
    }
  }

  toggleMaximizeWindow(appId) {
    soundService.playClick();
    if (!this.windows.has(appId)) return;
    const winObj = this.windows.get(appId);
    winObj.data.isMaximized = !winObj.data.isMaximized;

    if (winObj.data.isMaximized) {
      winObj.element.classList.add('maximized');
    } else {
      winObj.element.classList.remove('maximized');
      winObj.element.style.left = `${winObj.data.x}px`;
      winObj.element.style.top = `${winObj.data.y}px`;
      winObj.element.style.width = `${winObj.data.w}px`;
      winObj.element.style.height = `${winObj.data.h}px`;
    }
  }

  focusWindow(appId) {
    if (!this.windows.has(appId)) return;
    this.topZ += 1;
    this.activeWindowId = appId;

    for (let [id, winObj] of this.windows.entries()) {
      if (id === appId) {
        winObj.data.zIndex = this.topZ;
        winObj.element.style.zIndex = this.topZ;
        winObj.element.classList.add('focused');
        winObj.element.classList.remove('minimized');
        winObj.data.isMinimized = false;
      } else {
        winObj.element.classList.remove('focused');
      }
    }
  }

  setupWindowInteractions(winEl, winData) {
    const titlebar = winEl.querySelector('.window-titlebar');

    // Focus on click anywhere on the window
    winEl.addEventListener('mousedown', () => {
      this.focusWindow(winData.id);
    });

    // Titlebar buttons
    titlebar.addEventListener('click', (e) => {
      const btn = e.target.closest('.win-btn');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (action === 'close') this.closeWindow(winData.id);
      else if (action === 'minimize') this.minimizeWindow(winData.id);
      else if (action === 'maximize') this.toggleMaximizeWindow(winData.id);
    });

    // Double-click titlebar to maximize/restore
    titlebar.addEventListener('dblclick', (e) => {
      if (!e.target.closest('.win-btn')) {
        this.toggleMaximizeWindow(winData.id);
      }
    });

    // Drag-to-move with Edge Snapping
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let initialX = 0;
    let initialY = 0;
    let snapType = null; // 'left' | 'right' | 'top' | null

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.win-btn') || winData.isMaximized || window.innerWidth < 768) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      initialX = winData.x;
      initialY = winData.y;
      document.body.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;

      let newX = initialX + dx;
      let newY = Math.max(44, initialY + dy); // Don't go above topbar

      winData.x = newX;
      winData.y = newY;
      winEl.style.left = `${newX}px`;
      winEl.style.top = `${newY}px`;

      // Edge snapping detection
      const snapThreshold = 30;
      if (e.clientX <= snapThreshold) {
        snapType = 'left';
        this.showSnapPreview(0, 44, window.innerWidth / 2, window.innerHeight - 44);
      } else if (e.clientX >= window.innerWidth - snapThreshold) {
        snapType = 'right';
        this.showSnapPreview(window.innerWidth / 2, 44, window.innerWidth / 2, window.innerHeight - 44);
      } else if (e.clientY <= 44 + snapThreshold) {
        snapType = 'top';
        this.showSnapPreview(0, 44, window.innerWidth, window.innerHeight - 44);
      } else {
        snapType = null;
        this.hideSnapPreview();
      }
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.cursor = '';
      this.hideSnapPreview();

      if (snapType === 'top') {
        this.toggleMaximizeWindow(winData.id);
      } else if (snapType === 'left') {
        winData.x = 0;
        winData.y = 44;
        winData.w = window.innerWidth / 2;
        winData.h = window.innerHeight - 44;
        winEl.style.left = '0px';
        winEl.style.top = '44px';
        winEl.style.width = `${winData.w}px`;
        winEl.style.height = `${winData.h}px`;
      } else if (snapType === 'right') {
        winData.x = window.innerWidth / 2;
        winData.y = 44;
        winData.w = window.innerWidth / 2;
        winData.h = window.innerHeight - 44;
        winEl.style.left = `${winData.x}px`;
        winEl.style.top = '44px';
        winEl.style.width = `${winData.w}px`;
        winEl.style.height = `${winData.h}px`;
      }
      snapType = null;
    });

    // Resize Handles
    const resizers = winEl.querySelectorAll('.window-resizer');
    resizers.forEach((handle) => {
      let isResizing = false;
      let startW = 0;
      let startH = 0;
      let startMouseX = 0;
      let startMouseY = 0;
      const type = handle.getAttribute('data-resize');

      handle.addEventListener('mousedown', (e) => {
        if (winData.isMaximized || window.innerWidth < 768) return;
        isResizing = true;
        startW = winData.w;
        startH = winData.h;
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        e.stopPropagation();
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        if (type === 'r' || type === 'br') {
          const newW = Math.max(480, startW + (e.clientX - startMouseX));
          winData.w = newW;
          winEl.style.width = `${newW}px`;
        }
        if (type === 'b' || type === 'br') {
          const newH = Math.max(360, startH + (e.clientY - startMouseY));
          winData.h = newH;
          winEl.style.height = `${newH}px`;
        }
      });

      window.addEventListener('mouseup', () => {
        if (isResizing) {
          isResizing = false;
        }
      });
    });
  }

  showSnapPreview(x, y, w, h) {
    if (!this.snapPreview) return;
    this.snapPreview.style.left = `${x}px`;
    this.snapPreview.style.top = `${y}px`;
    this.snapPreview.style.width = `${w}px`;
    this.snapPreview.style.height = `${h}px`;
    this.snapPreview.classList.add('active');
  }

  hideSnapPreview() {
    if (this.snapPreview) {
      this.snapPreview.classList.remove('active');
    }
  }

  handleGlobalResize() {
    const isMobile = window.innerWidth < 768;
    this.windows.forEach((winObj) => {
      if (isMobile) {
        winObj.element.classList.add('maximized');
      } else if (!winObj.data.isMaximized) {
        winObj.element.classList.remove('maximized');
      }
    });
  }

  updateDockState() {
    document.querySelectorAll('.dock-item').forEach((item) => {
      const appId = item.getAttribute('data-app-id');
      if (this.windows.has(appId)) {
        item.classList.add('has-window');
      } else {
        item.classList.remove('has-window');
      }
    });
  }
}

export const windowManager = new WindowManager();
export default windowManager;
