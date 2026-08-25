export function removeActivity(trip, day, activityIndex) {
  if (!trip || !Array.isArray(trip.days)) return trip;
  const newDays = trip.days.map((d) => {
    if (Number(d.day) === Number(day)) {
      const newActs = [...(d.activities || [])];
      newActs.splice(activityIndex, 1);
      return { ...d, activities: newActs };
    }
    return d;
  });
  return { ...trip, days: newDays };
}

export function moveActivity(trip, fromDay, activityIndex, toDay) {
  if (!trip || !Array.isArray(trip.days)) return trip;
  let targetActivity = null;
  const daysAfterRemove = trip.days.map((d) => {
    if (Number(d.day) === Number(fromDay)) {
      const newActs = [...(d.activities || [])];
      targetActivity = newActs.splice(activityIndex, 1)[0];
      return { ...d, activities: newActs };
    }
    return d;
  });

  if (!targetActivity) return trip;

  const finalDays = daysAfterRemove.map((d) => {
    if (Number(d.day) === Number(toDay)) {
      return { ...d, activities: [...(d.activities || []), targetActivity] };
    }
    return d;
  });

  return { ...trip, days: finalDays };
}

export function delayDay(trip, hours = 2) {
  if (!trip || !Array.isArray(trip.days)) return trip;
  return {
    ...trip,
    delayedHours: (trip.delayedHours || 0) + hours
  };
}
