// Item detail page, reached by tapping a thumbnail on the home page.
// Not designed yet. Shows every field from the listing, stacked plainly.
// Unstyled on purpose (like dm.js and signup.js) until we design this screen together.

import { useEffect, useState } from 'react';
import { ScrollView, View, Image, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/supabase';
import { label } from '../../src/label';
import type { Listing } from '../../src/types';
import { Text, useTheme } from '../../src/theme';
import { useSession } from '../../src/session/SessionProvider';
import { reportListing } from '../../src/reports/api';
import { ReportModal } from '../../src/reports/ReportsModal';

export default function ItemDetail() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState('');
  const { session } = useSession();
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    supabase
      .from('listings')
      .select('*, seller:profiles(id, display_name, university_domain)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setListing(data);
      });
  }, [id]);

  return (
    <>
      {/* the root Stack hides headers, so turn one on here to get a back button */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {error ? <Text style={{ color: colors.danger, padding: 20 }}>{error}</Text> : null}

      {!listing && !error ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.textMuted} />
      ) : null}

      {listing ? (
        <ScrollView
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={{ padding: 20, gap: 8 }}
        >
          {listing.image_url ? (
            <Image source={{ uri: listing.image_url }} style={{ width: '100%', aspectRatio: 1 }} />
          ) : null}
          <Text style={{ fontSize: 20 }}>{listing.title}</Text>
          <Text>${Number(listing.price).toFixed(2)}</Text>
          {listing.status === 'sold' ? <Text style={{ color: colors.danger }}>SOLD</Text> : null}
          {listing.size ? <Text>Size: {listing.size}</Text> : null}
          {listing.condition ? <Text>Condition: {listing.condition}</Text> : null}
          {listing.category ? <Text>Category: {listing.category}</Text> : null}
          {listing.brand ? <Text>Brand: {listing.brand}</Text> : null}
          {listing.color ? <Text>Color: {listing.color}</Text> : null}
          {listing.description ? <Text>{listing.description}</Text> : null}
          <View style={{ height: 8 }} />
          {listing.seller.id !== session?.user.id ? (
            <Pressable onPress={() => setReporting(true)}>
              <Text style={{ color: colors.textMuted, textDecorationLine: 'underline' }}>Report this listing</Text>
            </Pressable>
          ) : null}
          <ReportModal
            visible={reporting}
            onClose={() => setReporting(false)}
            onSubmit={async (reason) => {
              await reportListing(listing.id, reason);
              router.back();
            }}
          />
        </ScrollView>
      ) : null}
    </>
  );
}