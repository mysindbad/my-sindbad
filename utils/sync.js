export function mergeTrips(localTrip, remoteTrip) {
  if (!remoteTrip) return localTrip;
  if (!localTrip) return remoteTrip;
  const localTime = new Date(localTrip.updatedAt || 0).getTime();
  const remoteTime = new Date(remoteTrip.updatedAt || 0).getTime();
  return remoteTime > localTime ? remoteTrip : localTrip;
}

export async function pushTrip(supabase, trip, userId) {
  if (!supabase || !userId || !trip) return false;
  try {
    const payload = {
      user_id: userId,
      trip_data: trip,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase
      .from('user_trips')
      .upsert(payload, { onConflict: 'user_id' });
    return !error;
  } catch {
    return false;
  }
}

export async function pullTrips(supabase, userId) {
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_trips')
      .select('trip_data')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data.trip_data;
  } catch {
    return null;
  }
}
