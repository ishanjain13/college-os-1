// COLLEGE OS - Central Activity Logger & Unified Event Stream

import store from './state.js';
import { awardXP } from './xpSystem.js';

/**
 * Log an activity to the central activity stream.
 * Every app in College OS writes to this unified stream for real dashboard stats,
 * heatmap generation, XP awards, and audit trails.
 */
export function logActivity({ appId, action, title, details = '', xpEarned = 0, metadata = {} }) {
  const entry = {
    id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    appId: appId || 'system',
    action: action || 'complete',
    title: title || 'Activity Logged',
    details: details || '',
    xpEarned: Number(xpEarned) || 0,
    metadata: metadata || {}
  };

  store.addActivityLog(entry);

  if (entry.xpEarned > 0) {
    awardXP(entry.xpEarned, entry.title);
  }

  return entry;
}

/**
 * Get recent activity items
 */
export function getActivities(limit = 50) {
  const logs = store.get().activityLog || [];
  return logs.slice(0, limit);
}

/**
 * Get activities logged today
 */
export function getTodayActivities() {
  const todayStr = new Date().toISOString().split('T')[0];
  const logs = store.get().activityLog || [];
  return logs.filter(log => log.timestamp && log.timestamp.startsWith(todayStr));
}

/**
 * Get activities logged in the last N days
 */
export function getPastDaysActivities(days = 7) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const logs = store.get().activityLog || [];
  return logs.filter(log => log.timestamp && log.timestamp >= cutoff);
}

/**
 * Get activities by app id
 */
export function getActivitiesByApp(appId, days = 30) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const logs = store.get().activityLog || [];
  return logs.filter(log => log.appId === appId && log.timestamp && log.timestamp >= cutoff);
}

/**
 * Get daily activity counts for the last N days (for GitHub-style heatmap)
 */
export function getDailyActivityCounts(days = 90) {
  const counts = {};
  const today = new Date();
  
  // Pre-fill last N days with 0
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    counts[dateKey] = 0;
  }

  const logs = store.get().activityLog || [];
  logs.forEach(log => {
    if (log.timestamp) {
      const dateKey = log.timestamp.split('T')[0];
      if (counts[dateKey] !== undefined) {
        counts[dateKey]++;
      }
    }
  });

  // Also include completed habits for those days so habit completions reflect accurately
  const habits = store.get().habits || [];
  habits.forEach(h => {
    if (h.completedLogs) {
      Object.keys(h.completedLogs).forEach(dateKey => {
        if (counts[dateKey] !== undefined && h.completedLogs[dateKey] > 0) {
          counts[dateKey]++;
        }
      });
    }
  });

  return counts;
}

/**
 * Get total weekly focus study minutes from real logs
 */
export function getWeeklyFocusMinutes() {
  const logs = getPastDaysActivities(7);
  let totalMinutes = 0;
  logs.forEach(l => {
    if (l.appId === 'focus' && l.metadata && l.metadata.durationMinutes) {
      totalMinutes += Number(l.metadata.durationMinutes) || 0;
    }
  });
  return totalMinutes;
}

export default {
  logActivity,
  getActivities,
  getTodayActivities,
  getPastDaysActivities,
  getActivitiesByApp,
  getDailyActivityCounts,
  getWeeklyFocusMinutes
};
