# COLLEGE OS (Vanilla Web App)

A standalone, Google Material 3-inspired **personal operating system** built specifically for ambitious college students.

Designed with **zero build steps, zero external npm packages, and zero frameworks**. Built purely with standard **vanilla HTML5, CSS3, and ES6+ modules**.

---

## 🌟 Highlights & Architecture

- **Desktop Window Manager**: Draggable, resizable, edge-snapping (snap left/right/top), minimizable, maximizable floating OS windows with stacked z-index focus.
- **18 Built-in Applications**:
  1. **Command Center** (`dashboard.js`): Executive overview, streak progress, next deadlines, today's lecture schedule.
  2. **Academic Hub** (`academics.js`): Weekly timetable, minimum 75% attendance tracker, assignment pipeline, exam readiness counters, cumulative GPA projection.
  3. **Habit Tracker** (`habits.js`): Daily standards, streak counters, 7-day completion history matrix, freeze days, category filters.
  4. **Goals & Roadmap** (`goals.js`): Strategic quarterly goals, milestone checklists, incremental progress counters.
  5. **Focus & Pomodoro** (`focus.js`): 25/5 and 50/10 focus sprints, Web Audio ambient soundscapes (Rain, Cafe, Forest, White Noise).
  6. **Daily Planner & Kanban** (`planner.js`): 3-column kanban board (To Do, In Progress, Done) with priority tags.
  7. **Notes & Flashcards** (`notes.js`): Markdown notes library with tag filtering and spaced repetition flip flashcard quizzes.
  8. **Expenses & Budget** (`money.js`): Expense ledger, monthly inflow vs outflow metrics, and category limit warnings.
  9. **Fitness & Health** (`fitness.js`): Step counts, bodyweight trend, sleep duration, protein goals, and workout volume logs.
  10. **Career & Projects** (`career.js`): 5-level skill trees, project portfolio proof-of-work, internship pipeline tracker, and LeetCode problem log.
  11. **Wellbeing & Breathing** (`wellbeing.js`): Guided 4×4 Navy SEAL box breathing visualizer and daily emotional check-ins.
  12. **Personal Journal** (`journal.js`): Nightly review prompts, cognitive clarity entries, and mood tags.
  13. **Gamification & Boss** (`gamification.js`): Weekly Boss Battle health bar, level rank titles, achievement trophy grid, and reward shop.
  14. **Vision Board** (`vision.js`): Visual affirmation tiles and north-star goal aspirations.
  15. **Future Me Letters** (`futureMe.js`): Sealed time-capsule letters with countdown unlocks.
  16. **Campus Life & Room** (`campus.js`): Virtual peer accountability study room and campus events directory.
  17. **AI Study Buddy** (`aiBuddy.js`): On-device academic AI tutor for proof breakdowns, interview questions, and study schedules.
  18. **Settings & Themes** (`settings.js`): 8 color themes, 6 Material 3 accent palettes, sound FX volume, and complete JSON export/import.
- **Gamification Engine**: XP calculation (`calculateLevelInfo`), floating "+XP" feedback, level-up celebrations, and dependency-free canvas confetti.
- **Command Palette**: `Ctrl+K` or `Cmd+K` fuzzy search across all 18 apps, tasks, notes, and system actions.
- **Procedural Audio FX**: Zero-asset sound synthesizer using the native Web Audio API (clicks, completion fanfares, ambient rain).
- **Responsive Layout**: Seamless transition between desktop windowed mode and mobile full-screen app launcher (< 768px).

---

## 🚀 Running the App

### Option 1: Double-click `index.html` or Open Directly
Since modern browsers enforce ES6 module CORS policies for `file:///` URLs in some environments, it is recommended to open via any local static server.

### Option 2: Simple Local Server (Recommended)
Using Python:
```bash
python -m http.server 3000
```
Or using Node's `npx serve`:
```bash
npx serve .
```
Then navigate to `http://localhost:3000` in your browser.

---

## 🛠️ Adding a New Application

Each application is a self-contained ES module inside `js/apps/`. To add a 19th application:

1. Create `js/apps/myApp.js`:
```js
import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';

export const myApp = {
  id: 'my_app',
  title: 'My Custom App',
  icon: 'sparkles',

  render() {
    return `
      <div class="app-container">
        <div class="app-header">
          <h2>My Custom App</h2>
        </div>
        <div class="app-body">
          <p>Application content goes here...</p>
        </div>
      </div>
    `;
  },

  init(container) {
    // Attach event listeners to container elements
  },

  destroy() {
    // Clean up timers or audio when window is closed
  }
};

export default myApp;
```

2. Register the app in `js/state.js` (`APP_METADATA`) and `js/main.js` (`appsList`).
3. That's it! It automatically integrates with the Window Manager, Dock, Command Palette, and Mobile App Drawer.

---

## 💾 Data & Backup Compatibility

All data is automatically synchronized to `localStorage` under the key:
```
COLLEGE_OS_STATE_V1
```
Existing backups from the React version of College OS can be imported seamlessly via **Settings → Backup & Data → Import Backup**.
