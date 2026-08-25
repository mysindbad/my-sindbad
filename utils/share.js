export function buildTripText(trip) {
  if (!trip) return '';
  return `رحلتي إلى ${trip.destination || 'المغرب'} لمدة ${trip.days || 1} أيام عبر "سندباد - رفيق السفر"! 🗺️✨`;
}

export function buildTripLink(trip) {
  try {
    const json = JSON.stringify(trip || {});
    const hash = btoa(encodeURIComponent(json));
    return `https://my-sindbad.vercel.app/view.html#${hash}`;
  } catch {
    return 'https://my-sindbad.vercel.app/view.html';
  }
}

export async function shareTrip(trip) {
  const text = buildTripText(trip);
  const url = buildTripLink(trip);
  if (navigator.share) {
    try {
      await navigator.share({ title: 'My Sindbad Trip', text, url });
      return true;
    } catch {
      return false;
    }
  }
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return true;
  }
  return false;
}
