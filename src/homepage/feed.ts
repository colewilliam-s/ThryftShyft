
// Loads the home feed from Supabase

import { supabase } from '../supabase';
import type { FeedProfile } from '../types';
import { fetchMyReportedListingIds } from '../reports/api';

/*
  each post shows up to 4 listings plus the "see all" page. We fetch a few extra per user
  so the feed can show more later without another query change.
*/
export const ROW_SLOTS = 5;

type RawName = { first_name: string | null; show_full_name: boolean };

/*
  everyone with at least one listing, each with their newest listings first.
  (later: filter by the viewer's size preference here.)
*/
export async function fetchFeed(): Promise<FeedProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `id, display_name, university_domain, avatar_url,
       profile_names(first_name, show_full_name),
       listings!inner(id, image_url, status, title, price, created_at)`,
    )
    .order('created_at', { referencedTable: 'listings', ascending: false })
    .limit(ROW_SLOTS + 1, { referencedTable: 'listings' });

  if (error) throw error;

  // Get listing IDs that the current viewer has reported
  const hidden = await fetchMyReportedListingIds();

  /*
    Normalize profile_names and remove reported listings from each profile.
    Profiles with no remaining listings are removed from the feed.
  */
  return (data as any[])
    .map((p) => {
      const raw = p.profile_names as RawName | RawName[] | null;

      return {
        ...p,
        profile_names: Array.isArray(raw) ? raw[0] ?? null : raw,
        listings: p.listings.filter((l: { id: string }) => !hidden.has(l.id)),
      } as FeedProfile;
    })
    .filter((p) => p.listings.length > 0);
}

export type Profile = {
  id: string;
  display_name: string | null;
  university_domain: string | null;
};
