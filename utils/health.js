import { getTranslation } from './i18n.js';

const healthText = (key) => getTranslation(typeof document !== 'undefined' ? document.documentElement.lang || 'ar' : 'ar', key);

export function evaluateHealth({ trip = {}, activities = [], weatherDaily = [] }) {
  const checks = [];
  let score = 100;

  // 1. Budget check
  const budget = Number(trip.budget || 0);
  const totalSpent = activities.reduce((sum, a) => sum + Number(a.cost || 0), 0);
  if (budget > 0 && totalSpent > budget) {
    score -= 25;
    checks.push({ type: 'red', message: healthText('health_budget_over') });
  } else {
    checks.push({ type: 'green', message: healthText('health_budget_ok') });
  }

  // 2. Hotel check
  const hasHotel = activities.some(a => (a.category || '').toLowerCase() === 'accommodation' || /فندق|إقامة|رياض/.test(a.title || ''));
  if (!hasHotel && (trip.days || 1) > 1) {
    score -= 20;
    checks.push({ type: 'yellow', message: healthText('health_no_lodging') });
  } else {
    checks.push({ type: 'green', message: healthText('health_lodging_ok') });
  }

  // 3. Meals check
  const mealsCount = activities.filter(a => /مطعم|مقهى|غداء|عشاء|أكل/.test(a.title || '')).length;
  if (mealsCount < (trip.days || 1)) {
    score -= 15;
    checks.push({ type: 'yellow', message: healthText('health_meals_low') });
  } else {
    checks.push({ type: 'green', message: healthText('health_meals_ok') });
  }

  // 4. Pace check
  if (activities.length > (trip.days || 1) * 5) {
    score -= 20;
    checks.push({ type: 'red', message: healthText('health_pace_busy') });
  } else {
    checks.push({ type: 'green', message: healthText('health_pace_ok') });
  }

  // 5. Weather check
  const badWeather = weatherDaily.some(w => (w.pop || 0) >= 70);
  if (badWeather) {
    score -= 20;
    checks.push({ type: 'yellow', message: healthText('health_weather_bad') });
  } else {
    checks.push({ type: 'green', message: healthText('health_weather_ok') });
  }

  score = Math.max(0, score);
  const badge = score >= 80 ? '🟢' : score >= 50 ? '🟡' : '🔴';

  return { score, badge, checks };
}
