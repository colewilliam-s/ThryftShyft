import { useCallback, useEffect, useState } from 'react';
import { FlatList, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '../../src/supabase';
import { Avatar } from '../../src/profile/Avatar';
import { useSession } from '../../src/session/SessionProvider';
import { fetchInbox, type InboxItem } from '../../src/messages/api';
import { styles, useStyles } from '../../src/messages/styles';

let inboxChannelCount = 0;

export default function Connect() {
  const router = useRouter();
  const { session } = useSession();
  const myId = session?.user.id;

  const [chats, setChats] = useState<InboxItem[]>([]);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const style = useStyles();

  const load = useCallback(async () => {
    if (!myId) return;

    try {
      const inbox = await fetchInbox(myId);
      setChats(inbox);

      const conversationIds = inbox.map((chat) => chat.id);

      if (conversationIds.length === 0) {
        setUnreadIds(new Set());
        setError('');
        return;
      }

      // fetch the read timestamps for our conversations.
      const { data: reads, error: readError } = await supabase
        .from('conversation_reads')
        .select('conversation_id, last_read_at')
        .eq('user_id', myId)
        .in('conversation_id', conversationIds);

      if (readError) throw readError;

      const readMap = new Map(
        (reads ?? []).map((r) => [r.conversation_id, r.last_read_at]),
      );

      const unread = new Set<string>();

      for (const chat of inbox) {
        const message = chat.last_message;

        // skip empty chats and messages sent by ourselves.
        if (!message || message.sender_id === myId) continue;

        const lastReadAt = readMap.get(chat.id);

        // no read record means this incoming message is unread.
        if (
          !lastReadAt ||
          new Date(message.created_at).getTime() >
          new Date(lastReadAt).getTime()
        ) {
          unread.add(chat.id);
        }
      }

      setUnreadIds(unread);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your messages.');
    } finally {
      setLoading(false);
    }
  }, [myId]);

  // reload whenever the tab comes into view.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // reload when a new message arrives.
  useEffect(() => {
    if (!myId) return;

    const channel = supabase
      .channel(`inbox:${myId}:${++inboxChannelCount}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          load();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [myId, load]);

  // pull down to reload.
  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={style.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      style={style.container}
      contentContainerStyle={styles.content}
      data={chats}
      keyExtractor={(c) => c.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={({ item }) => {
        const preview = item.last_message
          ? `${item.last_message.sender_id === myId ? 'You: ' : ''}${item.last_message.body}`
          : '';

        const hasUnread = unreadIds.has(item.id);

        return (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            disabled={!item.other}
            onPress={() =>
              item.other &&
              router.push({
                pathname: '/dm',
                params: { otherId: item.other.id },
              })
            }
          >
            <Avatar uri={item.other?.avatar_url ?? null} size={48} />

            <View style={styles.rowText}>
              <Text style={style.name}>
                @{item.other?.display_name?.toLowerCase() ?? 'unknown'}
              </Text>

              <Text style={styles.preview} numberOfLines={1}>
                {preview}
              </Text>
            </View>

            {hasUnread && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#3B82F6',
                  marginLeft: 10,
                }}
              />
            )}
          </Pressable>
        );
      }}
      ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : undefined}
      ListEmptyComponent={
        !error ? (
          <Text style={styles.empty}>
            No messages yet. Open someone's profile and tap the message button to start a chat!
          </Text>
        ) : undefined
      }
    />
  );
}