import { getTranslation } from './i18n.js';

const alertText = (key) => getTranslation(typeof document !== 'undefined' ? document.documentElement.lang || 'ar' : 'ar', key);

export function evaluateAlerts({ weatherDaily = [], daysActivities = [], budget = 0, currentSpent = 0 }) {
  const alerts = [];

  // Rain Alert
  weatherDaily.forEach((w, idx) => {
    const rainProb = w.pop ?? w.rain_probability ?? 0;
    if (rainProb >= 60) {
      alerts.push({
        id: `rain-day-${idx + 1}`,
        type: 'warning',
        category: 'weather',
        message: `${alertText('alert_rain_prefix')} ${rainProb}% ${alertText('alert_rain_middle')} ${idx + 1}`,
        action: 'REPLACE_OUTDOOR',
        day: idx + 1
      });
    }
  });

  // Density Alert
  daysActivities.forEach((dayGroup, idx) => {
    const count = dayGroup.activities ? dayGroup.activities.length : 0;
    const hours = dayGroup.totalHours || count * 2;
    if (count > 5 || hours > 9) {
      alerts.push({
        id: `density-day-${idx + 1}`,
        type: 'warning',
        category: 'density',
        message: `${alertText('day_label')} ${idx + 1} ${alertText('alert_busy_suffix')} (${count} ${alertText('activity_count')})`,
        action: 'REDUCE_PACE',
        day: idx + 1
      });
    }
  });

  // Budget Alert
  if (budget > 0 && currentSpent >= budget * 0.9) {
    alerts.push({
      id: 'budget-warning',
      type: 'danger',
      category: 'budget',
      message: alertText('alert_budget_90'),
      action: 'SHOW_CHEAP_ALT'
    });
  }

  return alerts;
}
