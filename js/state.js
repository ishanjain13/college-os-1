// COLLEGE OS - Central Reactive State Store & Persistence

export const STORAGE_KEY = 'COLLEGE_OS_STATE_V1';

export const APP_METADATA = {
  dashboard: { id: 'dashboard', title: 'Command Center', icon: 'layout-dashboard', color: '#6366f1' },
  goals: { id: 'goals', title: 'Goals & Roadmap', icon: 'target', color: '#ec4899' },
  habits: { id: 'habits', title: 'Habit Tracker', icon: 'check-circle', color: '#10b981' },
  academics: { id: 'academics', title: 'Academic Hub', icon: 'graduation-cap', color: '#3b82f6' },
  focus: { id: 'focus', title: 'Focus & Pomodoro', icon: 'timer', color: '#f59e0b' },
  planner: { id: 'planner', title: 'Daily Planner & Kanban', icon: 'calendar', color: '#8b5cf6' },
  notes: { id: 'notes', title: 'Notes & Flashcards', icon: 'book-open', color: '#06b6d4' },
  fitness: { id: 'fitness', title: 'Fitness & Health', icon: 'dumbbell', color: '#ef4444' },
  money: { id: 'money', title: 'Expenses & Budget', icon: 'wallet', color: '#14b8a6' },
  career: { id: 'career', title: 'Career & Projects', icon: 'briefcase', color: '#6366f1' },
  wellbeing: { id: 'wellbeing', title: 'Wellbeing & Breathing', icon: 'heart-pulse', color: '#f43f5e' },
  journal: { id: 'journal', title: 'Personal Journal', icon: 'feather', color: '#a855f7' },
  achievements: { id: 'achievements', title: 'Gamification & Boss', icon: 'trophy', color: '#eab308' },
  vision: { id: 'vision', title: 'Vision Board', icon: 'sparkles', color: '#ec4899' },
  future_me: { id: 'future_me', title: 'Future Me Letters', icon: 'hourglass', color: '#6366f1' },
  campus: { id: 'campus', title: 'Campus Life & Room', icon: 'users', color: '#10b981' },
  ai_buddy: { id: 'ai_buddy', title: 'AI Study Buddy & Coach', icon: 'bot', color: '#06b6d4' },
  settings: { id: 'settings', title: 'Settings & Themes', icon: 'settings', color: '#94a3b8' }
};

export const DEFAULT_LEVEL_TIERS = [
  { level: 1, title: 'Freshman Trainee', minXP: 0 },
  { level: 5, title: 'Getting Serious', minXP: 1000 },
  { level: 10, title: 'Locked In', minXP: 3000 },
  { level: 20, title: 'Machine Mode', minXP: 8000 },
  { level: 30, title: 'Main Character', minXP: 16000 },
  { level: 40, title: 'Elite Scholar', minXP: 28000 },
  { level: 50, title: 'Unstoppable Legend', minXP: 45000 }
];

export const DEFAULT_ACHIEVEMENTS = [
  { id: 'first_step', title: 'First Step', description: 'Completed your very first task or habit on College OS', icon: 'sparkles', xpReward: 100, unlocked: true, unlockedAt: new Date().toISOString() },
  { id: 'streak_7', title: '7-Day Momentum', description: 'Maintained a 7-day active daily streak', icon: 'flame', xpReward: 300, unlocked: false },
  { id: 'streak_30', title: 'Discipline Master', description: 'Maintained a 30-day legendary streak', icon: 'zap', xpReward: 1000, unlocked: false },
  { id: 'deadline_slayer', title: 'Deadline Slayer', description: 'Completed 5 assignments ahead of schedule', icon: 'shield-check', xpReward: 400, unlocked: false },
  { id: 'deep_diver', title: 'Deep Work Pioneer', description: 'Clocked over 10 hours of focused Pomodoro study', icon: 'timer', xpReward: 500, unlocked: false },
  { id: 'boss_slayer', title: 'First Boss Slayed', description: 'Conquered your first Weekly Boss Battle challenge', icon: 'crown', xpReward: 800, unlocked: false },
  { id: 'code_warrior', title: 'Algorithm Apprentice', description: 'Logged 10 solved coding practice problems', icon: 'code', xpReward: 350, unlocked: false },
  { id: 'body_and_mind', title: 'Iron Scholar', description: 'Logged 10 intense workouts and balanced wellness', icon: 'dumbbell', xpReward: 450, unlocked: false }
];

export const INITIAL_USER_PROFILE = {
  name: "Alex",
  college: "Stanford University / MIT",
  course: "Computer Science & Artificial Intelligence",
  year: "Sophomore (Year 2)",
  avatar: "⚡",
  streak: 12,
  longestStreak: 21,
  totalXP: 3420,
  joinedDate: "2026-09-01",
  onboardingCompleted: false,
  bootSequenceEnabled: true,
  examModeEnabled: false,
  soundEnabled: true,
  soundVolume: 0.6
};

export const INITIAL_APPEARANCE = {
  theme: "dark",
  accentColor: "indigo",
  wallpaper: "aurora",
  customWallpaperUrl: "",
  animatedBackground: true,
  blurIntensity: "16px",
  cardTransparency: 0.78,
  uiDensity: "comfortable",
  reducedMotion: false
};

export const INITIAL_TIMETABLE = [
  { id: 'c-1', subject: "CS 229: Machine Learning", teacher: "Prof. Andrew", room: "Turing Hall 101", day: "Monday", startTime: "09:00", endTime: "10:30", color: "#6366f1" },
  { id: 'c-2', subject: "CS 161: Design & Analysis of Algorithms", teacher: "Dr. Tarjan", room: "Gates B03", day: "Monday", startTime: "11:00", endTime: "12:30", color: "#ec4899" },
  { id: 'c-3', subject: "EE 108: Digital Systems Architecture", teacher: "Prof. Horowitz", room: "Packard 204", day: "Monday", startTime: "14:00", endTime: "15:30", color: "#06b6d4" },
  { id: 'c-4', subject: "MATH 104: Linear Algebra & Matrix Analysis", teacher: "Prof. Strang", room: "Math 380", day: "Tuesday", startTime: "10:00", endTime: "11:30", color: "#10b981" },
  { id: 'c-5', subject: "CS 229: ML Discussion Lab", teacher: "TA Marcus", room: "Huang Lab 4", day: "Tuesday", startTime: "13:00", endTime: "14:30", color: "#6366f1" },
  { id: 'c-6', subject: "CS 229: Machine Learning", teacher: "Prof. Andrew", room: "Turing Hall 101", day: "Wednesday", startTime: "09:00", endTime: "10:30", color: "#6366f1" },
  { id: 'c-7', subject: "CS 161: Design & Analysis of Algorithms", teacher: "Dr. Tarjan", room: "Gates B03", day: "Wednesday", startTime: "11:00", endTime: "12:30", color: "#ec4899" },
  { id: 'c-8', subject: "MATH 104: Linear Algebra & Matrix Analysis", teacher: "Prof. Strang", room: "Math 380", day: "Thursday", startTime: "10:00", endTime: "11:30", color: "#10b981" },
  { id: 'c-9', subject: "EE 108: Digital Systems Architecture", teacher: "Prof. Horowitz", room: "Packard 204", day: "Thursday", startTime: "14:00", endTime: "15:30", color: "#06b6d4" },
  { id: 'c-10', subject: "CS 161: Algorithm Problem Workshop", teacher: "TA Elena", room: "Gates B12", day: "Friday", startTime: "10:00", endTime: "12:00", color: "#ec4899" }
];

export const INITIAL_ATTENDANCE = [
  { id: 'att-1', subject: "CS 229: Machine Learning", totalClasses: 24, attended: 22, minimumRequired: 75 },
  { id: 'att-2', subject: "CS 161: Design & Analysis of Algorithms", totalClasses: 22, attended: 20, minimumRequired: 75 },
  { id: 'att-3', subject: "EE 108: Digital Systems Architecture", totalClasses: 20, attended: 16, minimumRequired: 75 },
  { id: 'att-4', subject: "MATH 104: Linear Algebra", totalClasses: 18, attended: 17, minimumRequired: 75 }
];

export const INITIAL_ASSIGNMENTS = [
  { id: 'asg-1', subject: "CS 229: Machine Learning", title: "Problem Set 2: Support Vector Machines & Kernel Ridge Regression", description: "Derive dual formulation and implement radial basis function SVM in NumPy.", deadline: "2026-11-25T23:59:00", priority: "high", status: "In progress", progress: 60, notes: "Part 1 & 2 done." },
  { id: 'asg-2', subject: "CS 161: Algorithms", title: "HW 4: Dynamic Programming & Matrix Chain Multiplication", description: "Write recurrence relation and analyze asymptotic runtime.", deadline: "2026-11-28T17:00:00", priority: "high", status: "Not started", progress: 0, notes: "Review lecture 8 notes." },
  { id: 'asg-3', subject: "EE 108: Digital Systems", title: "Lab 3: Verilog RISC-V 5-Stage Pipelined Datapath", description: "Design hazard forwarding unit and pipeline stall logic.", deadline: "2026-12-02T23:59:00", priority: "medium", status: "Not started", progress: 0, notes: "Team lab with partner Dave." }
];

export const INITIAL_EXAMS = [
  { id: 'ex-1', subject: "CS 229: Machine Learning", title: "Midterm Examination", examDate: "2026-12-05T10:00:00", syllabus: "Convex optimization, Logistic Regression, GDA, Naive Bayes, SVMs, PCA, Kernels", preparationPercent: 55, priority: "high" },
  { id: 'ex-2', subject: "CS 161: Algorithms", title: "Midterm Exam 1", examDate: "2026-12-10T14:00:00", syllabus: "Divide & Conquer, Master Theorem, Heaps, QuickSort, Randomized Selection, DP", preparationPercent: 70, priority: "high" },
  { id: 'ex-3', subject: "MATH 104: Linear Algebra", title: "Midterm Exam", examDate: "2026-12-15T09:00:00", syllabus: "Vector Spaces, Orthogonality, Gram-Schmidt, Eigenvalues, SVD Decomposition", preparationPercent: 40, priority: "medium" }
];

export const INITIAL_HABITS = [
  { id: 'h-1', name: "Morning Deep Work (90 Min)", icon: "sparkles", category: "Academic", type: "duration", target: 90, unit: "mins", xp: 40, frequency: "daily", color: "#6366f1", currentStreak: 12, longestStreak: 21, active: true, completedDates: [new Date().toISOString().split('T')[0]] },
  { id: 'h-2', name: "Solve 1 LeetCode Problem", icon: "code", category: "Skills", type: "number", target: 1, unit: "problem", xp: 35, frequency: "daily", color: "#06b6d4", currentStreak: 9, longestStreak: 15, active: true, completedDates: [new Date().toISOString().split('T')[0]] },
  { id: 'h-3', name: "Gym / Resistance Training", icon: "dumbbell", category: "Fitness", type: "checkbox", target: 1, unit: "session", xp: 45, frequency: "weekdays", color: "#10b981", currentStreak: 4, longestStreak: 14, active: true, completedDates: [] },
  { id: 'h-4', name: "Drink 3.5L Water", icon: "droplets", category: "Health", type: "number", target: 3.5, unit: "L", xp: 25, frequency: "daily", color: "#38bdf8", currentStreak: 12, longestStreak: 25, active: true, completedDates: [new Date().toISOString().split('T')[0]] },
  { id: 'h-5', name: "Nightly Review & Journaling", icon: "book-open", category: "Personal", type: "checkbox", target: 1, unit: "entry", xp: 30, frequency: "daily", color: "#a855f7", currentStreak: 7, longestStreak: 18, active: true, completedDates: [] }
];

export const INITIAL_GOALS = [
  {
    id: 'g-1',
    name: "Master Neural Networks & PyTorch",
    description: "Build 5 complete deep learning projects from scratch and understand backpropagation math.",
    category: "Academic",
    priority: "high",
    startDate: "2026-09-15",
    deadline: "2026-12-20",
    status: "Active",
    currentValue: 3,
    targetValue: 5,
    unit: "projects",
    xpReward: 500,
    color: "#6366f1",
    milestones: [
      { id: 'm-1-1', title: "Mathematical Foundations & Matrix Calculus", completed: true },
      { id: 'm-1-2', title: "Build CNN & Vision Classifier", completed: true },
      { id: 'm-1-3', title: "Transformer & Attention Mechanism", completed: false }
    ]
  },
  {
    id: 'g-2',
    name: "Land Summer 2027 FAANG / AI Internship",
    description: "Complete 150 LeetCode problems, polish portfolio, and network with 20 engineers.",
    category: "Career",
    priority: "high",
    startDate: "2026-09-01",
    deadline: "2026-12-30",
    status: "Active",
    currentValue: 64,
    targetValue: 150,
    unit: "problems",
    xpReward: 750,
    color: "#ec4899",
    milestones: [
      { id: 'm-2-1', title: "Resume & Portfolio Refresh", completed: true },
      { id: 'm-2-2', title: "NeetCode 150 Data Structures Grind", completed: false }
    ]
  }
];

export const INITIAL_KANBAN = [
  { id: 'kc-1', title: "Finalize Midterm Study Guide", column: "In Progress", priority: "high", deadline: "2026-12-05", labels: ["Exams", "CS 229"] },
  { id: 'kc-2', title: "Submit Palantir Referral Form", column: "Done", priority: "high", deadline: "2026-11-20", labels: ["Career"] },
  { id: 'kc-3', title: "Draft Future Me 2027 Letter", column: "Done", priority: "medium", deadline: "2026-11-15", labels: ["Mindset"] },
  { id: 'kc-4', title: "Review Graph Algorithms with TA", column: "To Do", priority: "medium", deadline: "2026-11-28", labels: ["CS 161"] }
];

export const INITIAL_NOTES = [
  {
    id: 'n-1',
    title: "Mastering Dynamic Programming Patterns",
    subject: "CS 161",
    pinned: true,
    tags: ["Algorithms", "LeetCode", "Exams"],
    content: "# Dynamic Programming Core Framework\n\n1. **Identify State**: What variables define a subproblem? (e.g. `dp[i][w]`)\n2. **Formulate Recurrence**: How does `dp[i]` relate to `dp[i-1]`?\n3. **Base Cases**: Boundaries (0, empty string, etc.)\n4. **Optimization**: Space reduction with rolling arrays.\n\n> Key patterns: 0/1 Knapsack, Longest Common Subsequence (LCS), Interval DP.",
    updatedAt: "2026-11-18T14:30:00"
  },
  {
    id: 'n-2',
    title: "Eigenvalues & Singular Value Decomposition (SVD)",
    subject: "MATH 104",
    pinned: false,
    tags: ["Linear Algebra", "Machine Learning"],
    content: "# SVD Decomposition Summary\n\nAny matrix $A \\in \\mathbb{R}^{m \\times n}$ can be factored as:\n$$A = U \\Sigma V^T$$\n\n- $U$: $m \\times m$ orthogonal matrix\n- $\\Sigma$: singular values\n- $V$: right singular vectors",
    updatedAt: "2026-11-16T11:20:00"
  }
];

export const INITIAL_FLASHCARDS = [
  { id: 'fc-1', deck: "CS 229 Machine Learning", front: "Generative vs. Discriminative models?", back: "Discriminative learns P(Y|X) directly (Logistic Regression, SVM). Generative learns P(X|Y) and P(Y) (Naive Bayes, GDA).", difficulty: "medium" },
  { id: 'fc-2', deck: "Algorithms", front: "Master Theorem recurrence T(n) = aT(n/b) + f(n)?", back: "Compare f(n) with n^(log_b a) across 3 cases: polynomial smaller, matching, polynomial larger.", difficulty: "hard" }
];

export const INITIAL_EXPENSES = [
  { id: 'exp-1', title: "Monthly Textbooks & Papers", amount: 48.00, category: "College", type: "expense", date: "2026-11-10" },
  { id: 'exp-2', title: "Campus Grocery & Meal Prep", amount: 62.50, category: "Food", type: "expense", date: "2026-11-14" },
  { id: 'exp-3', title: "Gym Protein & Supplements", amount: 45.00, category: "Fitness", type: "expense", date: "2026-11-15" },
  { id: 'exp-4', title: "Teaching Assistant Stipend", amount: 650.00, category: "Income", type: "income", date: "2026-11-01" }
];

export const INITIAL_BUDGETS = {
  Food: 250,
  Hostel: 500,
  Travel: 60,
  College: 120,
  Shopping: 80,
  Entertainment: 60,
  Fitness: 70,
  Other: 100
};

export const INITIAL_SKILLS = [
  { id: 'sk-1', name: "Python & PyTorch", level: 4, xp: 2400, hours: 140, category: "Software & AI" },
  { id: 'sk-2', name: "C++ & Systems", level: 3, xp: 1600, hours: 90, category: "Software & AI" },
  { id: 'sk-3', name: "Algorithms & Data Structures", level: 4, xp: 2100, hours: 120, category: "Computer Science" },
  { id: 'sk-4', name: "Full-Stack Web (JS/HTML/CSS)", level: 4, xp: 2200, hours: 130, category: "Development" }
];

export const INITIAL_PROJECTS = [
  { id: 'prj-1', name: "College OS", description: "Futuristic personal operating system for ambitious college students.", technology: "Vanilla ES Modules, CSS Tokens, Web Audio", status: "Completed", progress: 100 },
  { id: 'prj-2', name: "Autonomous Drone Path Planner", description: "Real-time 3D collision avoidance using voxel grids.", technology: "C++, ROS2, OpenCV", status: "In Progress", progress: 65 }
];

export const INITIAL_INTERNSHIPS = [
  { id: 'int-1', company: "Anthropic / OpenAI", role: "AI Research Engineering Intern", appliedDate: "2026-10-20", status: "Interview", stipend: "$65/hr", notes: "Technical round on kernels." },
  { id: 'int-2', company: "Google DeepMind", role: "Software Engineer Intern", appliedDate: "2026-10-18", status: "Assessment", stipend: "$60/hr", notes: "Passed 100% test cases." }
];

export const INITIAL_CODING = [
  { id: 'cp-1', platform: "LeetCode", problem: "Course Schedule II", difficulty: "Medium", topic: "Topological Sort", date: "2026-11-18", solved: true },
  { id: 'cp-2', platform: "LeetCode", problem: "Coin Change", difficulty: "Medium", topic: "Dynamic Programming", date: "2026-11-17", solved: true }
];

export const INITIAL_WEEKLY_BOSS = {
  name: "Gorgon of Procrastination",
  subtitle: "Semester Momentum Gatekeeper",
  hpTotal: 100,
  hpCurrent: 35,
  requirements: [
    { id: 'br-1', text: "Hit 80% Habit Completion this week", completed: true },
    { id: 'br-2', text: "Log 8 Hours of Deep Work Study", completed: true },
    { id: 'br-3', text: "Complete 4 Gym / Fitness Sessions", completed: false },
    { id: 'br-4', text: "Finish CS 229 Assignment Milestone", completed: true }
  ],
  bonusXP: 800
};

export const INITIAL_REWARD_SHOP = [
  { id: 'rew-1', name: "Guilt-Free Movie Night + Popcorn", xpCost: 500, icon: "film", description: "Enjoy a weekend cinema movie with zero guilt." },
  { id: 'rew-2', name: "Favorite Restaurant Cheat Meal", xpCost: 1000, icon: "utensils", description: "Order your favorite sushi or burger dinner." },
  { id: 'rew-3', name: "New Tech / Desk Accessory", xpCost: 2000, icon: "headphones", description: "Upgrade keyboard, mousepad, or book." },
  { id: 'rew-4', name: "Uninterrupted Gaming Session", xpCost: 1500, icon: "gamepad", description: "4 hours of gaming with squad." }
];

export const INITIAL_FUTURE_LETTERS = [
  {
    id: 'fl-1',
    title: "To Future Alex at the End of Sophomore Year",
    writeDate: "2026-09-15",
    unlockDate: "2027-06-01",
    letter: "Dear Future Me,\n\nIf you are reading this, sophomore year is over. Remember how much grit it took during those October nights in the library? Did you stick to the plan? Did you lift consistently? I hope you are proud of how hard we fought.\n\nNever forget why we started.",
    unlocked: false
  }
];

export const INITIAL_VISION_ITEMS = [
  { id: 'vi-1', text: "Deliver Keynote on AI Systems", type: "goal", emoji: "🎙️", color: "#6366f1" },
  { id: 'vi-2', text: "Dream Workspace with triple OLED & plants", type: "affirmation", emoji: "🌿", color: "#10b981" },
  { id: 'vi-3', text: "Full Financial Freedom & High Agency", type: "affirmation", emoji: "🚀", color: "#f59e0b" },
  { id: 'vi-4', text: "Health is the multiplier for everything else", type: "quote", emoji: "⚡", color: "#ec4899" }
];

export const INITIAL_JOURNAL = [
  { id: 'j-1', date: "2026-11-18", mood: "Focused", title: "Compounding Daily Grit", content: "Great morning deep work block. Solved topological sort problem in one pass. Feeling momentum build." },
  { id: 'j-2', date: "2026-11-17", mood: "Energized", title: "Progressive Overload", content: "Hit 87.5kg on bench press today. Sleep was solid at 7.8 hours." }
];

export const INITIAL_FITNESS_LOGS = [
  { date: "2026-11-18", weight: 74.2, steps: 10450, workout: "Upper Body Hypertrophy", volume: 6400, protein: 165, sleep: 7.8, water: 3.5 },
  { date: "2026-11-17", weight: 74.4, steps: 9200, workout: "Legs & Core", volume: 7200, protein: 155, sleep: 7.2, water: 3.2 }
];

class StateStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          profile: { ...INITIAL_USER_PROFILE, ...parsed.profile },
          appearance: { ...INITIAL_APPEARANCE, ...parsed.appearance },
          timetable: parsed.timetable || INITIAL_TIMETABLE,
          attendance: parsed.attendance || INITIAL_ATTENDANCE,
          assignments: parsed.assignments || INITIAL_ASSIGNMENTS,
          exams: parsed.exams || INITIAL_EXAMS,
          habits: parsed.habits || INITIAL_HABITS,
          goals: parsed.goals || INITIAL_GOALS,
          kanbanCards: parsed.kanbanCards || INITIAL_KANBAN,
          notes: parsed.notes || INITIAL_NOTES,
          flashcards: parsed.flashcards || INITIAL_FLASHCARDS,
          expenses: parsed.expenses || INITIAL_EXPENSES,
          budgets: parsed.budgets || INITIAL_BUDGETS,
          skills: parsed.skills || INITIAL_SKILLS,
          projects: parsed.projects || INITIAL_PROJECTS,
          internships: parsed.internships || INITIAL_INTERNSHIPS,
          codingPractice: parsed.codingPractice || INITIAL_CODING,
          weeklyBoss: parsed.weeklyBoss || INITIAL_WEEKLY_BOSS,
          rewards: parsed.rewards || INITIAL_REWARD_SHOP,
          futureLetters: parsed.futureLetters || INITIAL_FUTURE_LETTERS,
          visionItems: parsed.visionItems || INITIAL_VISION_ITEMS,
          journal: parsed.journal || INITIAL_JOURNAL,
          fitnessLogs: parsed.fitnessLogs || INITIAL_FITNESS_LOGS,
          achievements: parsed.achievements || DEFAULT_ACHIEVEMENTS,
          levelTiers: parsed.levelTiers || DEFAULT_LEVEL_TIERS
        };
      }
    } catch (e) {
      console.warn("Failed loading storage:", e);
    }

    return {
      profile: INITIAL_USER_PROFILE,
      appearance: INITIAL_APPEARANCE,
      timetable: INITIAL_TIMETABLE,
      attendance: INITIAL_ATTENDANCE,
      assignments: INITIAL_ASSIGNMENTS,
      exams: INITIAL_EXAMS,
      habits: INITIAL_HABITS,
      goals: INITIAL_GOALS,
      kanbanCards: INITIAL_KANBAN,
      notes: INITIAL_NOTES,
      flashcards: INITIAL_FLASHCARDS,
      expenses: INITIAL_EXPENSES,
      budgets: INITIAL_BUDGETS,
      skills: INITIAL_SKILLS,
      projects: INITIAL_PROJECTS,
      internships: INITIAL_INTERNSHIPS,
      codingPractice: INITIAL_CODING,
      weeklyBoss: INITIAL_WEEKLY_BOSS,
      rewards: INITIAL_REWARD_SHOP,
      futureLetters: INITIAL_FUTURE_LETTERS,
      visionItems: INITIAL_VISION_ITEMS,
      journal: INITIAL_JOURNAL,
      fitnessLogs: INITIAL_FITNESS_LOGS,
      achievements: DEFAULT_ACHIEVEMENTS,
      levelTiers: DEFAULT_LEVEL_TIERS
    };
  }

  save(immediate = false) {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }

    const doSave = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error("Storage save error:", e);
      }
    };

    this.notify(); // Immediately update all UI listeners for 60fps responsiveness

    if (immediate) {
      doSave();
    } else {
      this._saveTimer = setTimeout(doSave, 120);
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    for (const fn of this.listeners) {
      fn(this.state);
    }
  }

  get() {
    return this.state;
  }

  updateProfile(updates) {
    this.state.profile = { ...this.state.profile, ...updates };
    this.save();
  }

  updateAppearance(updates) {
    this.state.appearance = { ...this.state.appearance, ...updates };
    this.save();
  }

  setHabits(updater) {
    this.state.habits = typeof updater === 'function' ? updater(this.state.habits) : updater;
    this.save();
  }

  setGoals(updater) {
    this.state.goals = typeof updater === 'function' ? updater(this.state.goals) : updater;
    this.save();
  }

  setAssignments(updater) {
    this.state.assignments = typeof updater === 'function' ? updater(this.state.assignments) : updater;
    this.save();
  }

  setKanbanCards(updater) {
    this.state.kanbanCards = typeof updater === 'function' ? updater(this.state.kanbanCards) : updater;
    this.save();
  }

  setNotes(updater) {
    this.state.notes = typeof updater === 'function' ? updater(this.state.notes) : updater;
    this.save();
  }

  setExpenses(updater) {
    this.state.expenses = typeof updater === 'function' ? updater(this.state.expenses) : updater;
    this.save();
  }

  setJournal(updater) {
    this.state.journal = typeof updater === 'function' ? updater(this.state.journal) : updater;
    this.save();
  }

  setFitnessLogs(updater) {
    this.state.fitnessLogs = typeof updater === 'function' ? updater(this.state.fitnessLogs) : updater;
    this.save();
  }

  setWeeklyBoss(updater) {
    this.state.weeklyBoss = typeof updater === 'function' ? updater(this.state.weeklyBoss) : updater;
    this.save();
  }

  exportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `college_os_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  }

  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        this.state = { ...this.state, ...parsed };
        this.save();
        return true;
      }
    } catch (e) {
      console.error("Invalid backup file:", e);
    }
    return false;
  }
}

export const store = new StateStore();
export default store;
