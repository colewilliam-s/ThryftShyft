import { supabase } from '../supabase';

export type ReportReason = 'spam' | 'scam' | 'inappropriate' | 'prohibited' | 'harassment' | 'other';

export async function reportListing(listingId: string, reason: ReportReason, details?: string) {
  const { error } = await supabase.rpc('report_listing', {
    p_listing: listingId,
    p_reason: reason,
    p_details: details ?? null,
  });
  if (error) throw new Error(error.message);
}

// Listings this person has reported, so their feed can hide them right away
export async function fetchMyReportedListingIds(): Promise<Set<string>> {
  const { data, error } = await supabase.from('reports').select('listing_id').not('listing_id', 'is', null);
  if (error) return new Set(); // if this fails, show the feed anyway
  return new Set(data.map((r) => r.listing_id as string));
}