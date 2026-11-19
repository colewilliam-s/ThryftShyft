
// The save/clear/prompted calls go through database functions (rpc) so the rules
// live on the server: rounding, clearing the unused source, rate limiting.
// Those functions come from the location migration. Until it has been applied,
// the calls below fail at runtime with "function ... does not exist".

import { supabase } from '../supabase';

export type LocationVisibility = 'off' | 'community' | 'public';
export type LocationSource = 'device' | 'campus_spot';

export type MyLocation = {
  visibility: LocationVisibility;
  source: LocationSource | null;
  spot_id: string | null;
  updated_at: string | null;
};

export type CampusSpot = {
  id: string;
  name: string;
  zone: string | null;
};

// The signed-in user's own saved setting. Coordinates are deliberately not selected:
// they stay on the server and never come back to the phone.
export async function fetchMyLocation(userId: string): Promise<MyLocation | null> {
  const { data: prof, error: profError } = await supabase
    .from('location_settings')
    .select('visibility')
    .eq('user_id', userId)
    .maybeSingle();
  if (profError) throw new Error(profError.message);

  const { data: loc, error: locError } = await supabase
    .from('profile_locations')
    .select('source, spot_id, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (locError) throw new Error(locError.message);

  const visibility = (prof?.visibility ?? 'off') as LocationVisibility;
  if (visibility === 'off' && !loc) return null;

  return {
    visibility,
    source: (loc?.source ?? null) as LocationSource | null,
    spot_id: loc?.spot_id ?? null,
    updated_at: loc?.updated_at ?? null,
  };
}

// Spots for the campus that matches the user's email domain (profiles.university_domain)
export async function fetchCampusSpots(domain: string): Promise<CampusSpot[]> {
  const { data: campus, error: campusError } = await supabase
    .from('campuses')
    .select('id')
    .eq('university_domain', domain)
    .maybeSingle();
  if (campusError) throw new Error(campusError.message);
  if (!campus) return []; // no spots set up for this school yet

  const { data, error } = await supabase
    .from('campus_spots')
    .select('id, name, zone')
    .eq('campus_id', campus.id)
    .order('name');
  if (error) throw new Error(error.message);

  return (data ?? []) as CampusSpot[];
}

type SaveArgs = {
  visibility: 'community' | 'public';
  source: LocationSource;
  spotId: string | null; // null with source 'campus_spot' = "prefer not to say"
  lat: number | null; // null with source 'device' = keep the existing saved area
  lng: number | null;
};

export async function saveMyLocation(args: SaveArgs): Promise<void> {
  const { error } = await supabase.rpc('save_my_location', {
    p_visibility: args.visibility,
    p_source: args.source,
    p_spot_id: args.spotId,
    p_lat: args.lat,
    p_lng: args.lng,
  });
  if (error) throw new Error(error.message);
}

// Deletes the saved location and sets visibility to off, in one server call
export async function clearMyLocation(): Promise<void> {
  const { error } = await supabase.rpc('clear_my_location');
  if (error) throw new Error(error.message);
}

// Records that the setup screen was shown, so it only appears once
export async function markLocationPrompted(): Promise<void> {
  const { error } = await supabase.rpc('mark_location_prompted');
  if (error) throw new Error(error.message);
}