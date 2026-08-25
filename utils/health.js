export function evaluateHealth({ trip = {}, activities = [], weatherDaily = [] }) {
  const checks = [];
  let score = 100;

  // 1. Budget check
  const budget = Number(trip.budget || 0);
  const totalSpent = activities.reduce((sum, a) => sum + Number(a.cost || 0), 0);
  if (budget > 0 && totalSpent > budget) {
    score -= 25;
    checks.push({ type: 'red', message: 'الميزانية متجاوزة' });
  } else {
    checks.push({ type: 'green', message: 'الميزانية متوازنة' });
  }

  // 2. Hotel check
  const hasHotel = activities.some(a => (a.category || '').toLowerCase() === 'accommodation' || /فندق|إقامة|رياض/.test(a.title || ''));
  if (!hasHotel && (trip.days || 1) > 1) {
    score -= 20;
    checks.push({ type: 'yellow', message: 'لم يتم حجز أو تحديد مكان الإقامة' });
  } else {
    checks.push({ type: 'green', message: 'مكان الإقامة محدد' });
  }

  // 3. Meals check
  const mealsCount = activities.filter(a => /مطعم|مقهى|غداء|عشاء|أكل/.test(a.title || '')).length;
  if (mealsCount < (trip.days || 1)) {
    score -= 15;
    checks.push({ type: 'yellow', message: 'توصيات وجبات الطعام غير كافية' });
  } else {
    checks.push({ type: 'green', message: 'الوجبات موزعة بشكل جيد' });
  }

  // 4. Pace check
  if (activities.length > (trip.days || 1) * 5) {
    score -= 20;
    checks.push({ type: 'red', message: 'جدول الرحلة مزدحم جداً' });
  } else {
    checks.push({ type: 'green', message: 'وتيرة الرحلة مريحة' });
  }

  // 5. Weather check
  const badWeather = weatherDaily.some(w => (w.pop || 0) >= 70);
  if (badWeather) {
    score -= 20;
    checks.push({ type: 'yellow', message: 'توقعات بطقس ممطر فبعض الأيام' });
  } else {
    checks.push({ type: 'green', message: 'الطقس مناسب للأنشطة' });
  }

  score = Math.max(0, score);
  const badge = score >= 80 ? '🟢' : score >= 50 ? '🟡' : '🔴';

  return { score, badge, checks };
}
