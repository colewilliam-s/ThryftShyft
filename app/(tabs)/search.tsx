import { useEffect, useState } from 'react';
import { FlatList, View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../src/profile/Avatar';
import { useSession } from '../../src/session/SessionProvider';
import { searchProfiles, type SearchProfile } from '../../src/search/api';
import {
  addRecent, clearRecents, loadRecents, removeRecent, type RecentProfile,
} from '../../src/search/recents';
import { Text, makeStyles, useTheme } from '../../src/theme';

type Row = RecentProfile & { fullName?: string; major?: string | null };

export default function SearchScreen() {
  const s = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { session } = useSession();
  const myId = session?.user.id;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchProfile[]>([]);
  const [recents, setRecents] = useState<RecentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // load the saved list once we know who is logged in
  useEffect(() => {
    if (myId) loadRecents(myId).then(setRecents);
  }, [myId]);

  // search 300ms after the user stops typing. The cleanup ignores stale responses.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setError('');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchProfiles(q);
        if (!cancelled) {
          setResults(found);
          setError('');
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Search failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const hasQuery = query.trim().length > 0;

  async function openProfile(p: RecentProfile) {
    router.push(`/user/${p.id}`);
    if (myId) setRecents(await addRecent(myId, p)); // goes to the top of the list
  }

  async function remove(personId: string) {
    setRecents((prev) => prev.filter((p) => p.id !== personId)); // update the screen right away
    if (myId) await removeRecent(myId, personId);
  }

  async function clearAll() {
    setRecents([]);
    if (myId) await clearRecents(myId);
  }

  const rows: Row[] = hasQuery
    ? results.map((r) => {
      const n = r.profile_names;
      return {
        id: r.id,
        display_name: r.display_name,
        avatar_url: r.avatar_url,
        major: r.major,
        fullName: n?.show_full_name
          ? [n.first_name, n.last_name].filter(Boolean).join(' ')
          : '',
      };
    })
    : recents;

  return (
    <View style={s.container}>
      <TextInput
        style={s.input}
        placeholder='Search people by username'
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize='none'
        autoCorrect={false}
        clearButtonMode='while-editing'
      />

      {loading ? <ActivityIndicator style={s.spinner} color={colors.textMuted} /> : null}
      {error ? <Text style={s.error}>{error}</Text> : null}

      <FlatList
        data={rows}
        keyExtractor={(p) => p.id}
        keyboardShouldPersistTaps='handled'
        ListHeaderComponent={
          !hasQuery && recents.length > 0 ? (
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Recents</Text>
              <Pressable onPress={clearAll} hitSlop={8}>
                <Text style={s.clearAll}>Clear all</Text>
              </Pressable>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View style={s.row}>
            <Pressable
              style={({ pressed }) => [s.rowMain, pressed && s.pressed]}
              onPress={() =>
                openProfile({ id: item.id, display_name: item.display_name, avatar_url: item.avatar_url })
              }
            >
              <Avatar uri={item.avatar_url} size={48} />
              <View style={s.rowText}>
                <Text style={s.name}>@{item.display_name?.toLowerCase()}</Text>
                {item.fullName ? <Text style={s.detail}>{item.fullName}</Text> : null}
                {item.major ? <Text style={s.detail}>{item.major}</Text> : null}
              </View>
            </Pressable>

            {!hasQuery ? (
              <Pressable onPress={() => remove(item.id)} hitSlop={12} style={s.removeButton}>
                <Ionicons name='close' size={20} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          hasQuery ? (
            !loading && !error ? <Text style={s.empty}>No people found.</Text> : undefined
          ) : (
            <Text style={s.empty}>Search for people by their username.</Text>
          )
        }
      />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.background, paddingHorizontal: 16, paddingTop: 12 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: c.text,
    fontFamily: 'DMSans_400Regular',
  },
  spinner: { marginTop: 12 },
  error: { color: c.danger, marginTop: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 15, color: c.text, fontFamily: 'DMSans_700Bold' },
  clearAll: { fontSize: 14, color: c.link, fontFamily: 'DMSans_500Medium' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressed: { opacity: 0.7 },
  rowText: { flex: 1 },
  name: { fontSize: 15, color: c.text, fontFamily: 'DMSans_500Medium' },
  detail: { fontSize: 13, color: c.textMuted, fontFamily: 'DMSans_400Regular' },
  removeButton: { paddingLeft: 12 },
  empty: { color: c.textMuted, textAlign: 'center', marginTop: 40, fontFamily: 'DMSans_400Regular' },
}));