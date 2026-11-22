// One user's post in the feed: a header (photo + name), a swipeable full-width carousel
// of their listings, page dots, and a caption. The last page opens their profile.

import { useState } from 'react';
import {
  View, Pressable, ScrollView, Image, useWindowDimensions,
  type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { label } from '../label';
import { Avatar } from '../profile/Avatar';
import { Text, makeStyles, useTheme } from '../theme';
import type { FeedProfile } from '../types';
import { ReportModal } from '../reports/ReportsModal';
import { reportListing } from '../reports/api';

const SIDE_PADDING = 16;  // matches paddingHorizontal in the feed's content style
const MAX_LISTINGS = 4;   // listings before the "see all" page
const ASPECT = 5 / 4;     // height / width. Listing photos are cropped 4:5 in the form, so they fit exactly

// avatar_url, title and price need to be added to the feed query (see below).
// Until then they're simply missing and the post still renders.
type PostListing = FeedProfile['listings'][number] & {
  title?: string | null;
  price?: number | string | null;
};
type PostProfile = FeedProfile & { avatar_url?: string | null };

export function UserRow({ profile, onReported }: { profile: PostProfile, onReported?: () => void }) {
  const s = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  const listings = (profile.listings as PostListing[]).slice(0, MAX_LISTINGS);
  const pageCount = listings.length + 1; // the extra page is "see all"
  const height = Math.round(width * ASPECT);
  const openProfile = () => router.push(`/user/${profile.id}`);
  const current = listings[page]; // undefined while on the "see all" page
  const [reporting, setReporting] = useState(false);

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  return (
    <View style={s.post}>
      {/* Header: photo and name */}
      <View style={s.header}>
        <Pressable onPress={openProfile} hitSlop={8} style={s.headerMain}>
          <Avatar uri={profile.avatar_url ?? null} size={32} />
          <Text style={s.name}>{label(profile)}</Text>
        </Pressable>
        {current ? (
          <Pressable onPress={() => setReporting(true)} hitSlop={12}>
            <Ionicons name='ellipsis-horizontal' size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* Carousel: one full-width image per swipe */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        // run edge to edge, past the feed's side padding
        style={{ marginHorizontal: -SIDE_PADDING }}
      >
        {listings.map((l) => (
          <Pressable key={l.id} onPress={() => router.push(`/item/${l.id}`)} style={{ width, height }}>
            {l.image_url ? (
              <Image source={{ uri: l.image_url }} style={{ width, height }} resizeMode='cover' />
            ) : (
              <View style={[s.noPhoto, { width, height }]} />
            )}
            {l.status === 'sold' ? (
              <View style={s.soldOverlay}>
                <Text style={s.soldText}>SOLD</Text>
              </View>
            ) : null}
          </Pressable>
        ))}

        {/* Last page: opens the profile */}
        <Pressable onPress={openProfile} style={[s.seeAll, { width, height }]}>
          <Ionicons name='arrow-forward-circle-outline' size={44} color={colors.textMuted} />
          <Text style={s.seeAllText}>See all of {label(profile)}'s listings</Text>
        </Pressable>
      </ScrollView>

      {/* Page dots */}
      {pageCount > 1 ? (
        <View style={s.dots}>
          {Array.from({ length: pageCount }).map((_, i) => (
            <View key={i} style={[s.dot, i === page && s.dotActive]} />
          ))}
        </View>
      ) : null}

      {/* Caption for the listing on screen */}
      {current?.title ? (
        <View style={s.caption}>
          <Text style={s.captionTitle} numberOfLines={1}>{current.title}</Text>
          {current.price != null ? (
            <Text style={s.captionPrice}>${Number(current.price).toFixed(2)}</Text>
          ) : null}
        </View>
      ) : null}
      {current ? (
        <ReportModal
          visible={reporting}
          onClose={() => setReporting(false)}
          onSubmit={async (reason) => {
            await reportListing(current.id, reason);
            onReported?.();
          }}
        />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  post: { marginBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 10 },
  headerMain: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  name: { fontSize: 15, color: c.text, fontFamily: 'DMSans_700Bold' },

  noPhoto: { backgroundColor: c.surface },
  soldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldText: { color: '#fff', fontSize: 16, letterSpacing: 2, fontFamily: 'DMSans_700Bold' },

  seeAll: { backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', gap: 12 },
  seeAllText: { fontSize: 15, color: c.textMuted, fontFamily: 'DMSans_500Medium' },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.textMuted, opacity: 0.4 },
  dotActive: { backgroundColor: c.text, opacity: 1 },

  caption: { marginTop: 10, gap: 2 },
  captionTitle: { fontSize: 15, color: c.text, fontFamily: 'DMSans_500Medium' },
  captionPrice: { fontSize: 14, color: c.textMuted, fontFamily: 'DMSans_400Regular' },
}));