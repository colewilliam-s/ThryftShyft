// Direct Messages file
// Reached from the message button on a profile, or by tapping a chat in the Connect inbox.

import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { label } from '../src/label';
import { Redirect, Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Profile, Message } from '../src/types';
import { supabase } from '../src/supabase';
import { useStyles } from '../src/homepage/styles';
import { useTheme } from '../src/theme';
import { Avatar } from '../src/profile/Avatar';
import { loadCachedMessages, saveCachedMessages, mergeMessages } from '../src/messages/cache';

export default function DM() {
  const [userId, setUserId] = useState<string | null>(null);
  const { otherId } = useLocalSearchParams<{ otherId?: string }>();
  const [convId, setConvId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]); // newest first
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null);
  const router = useRouter();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // load the signed-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) setError('Not signed in.');
      else setUserId(user.id);
    });
  }, []);

  // open the chat with the person we arrived for
  useEffect(() => {
    if (!otherId) return;
    async function openFromParam() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, university_domain, avatar_url')
        .eq('id', otherId)
        .single();
      if (error) return setError(error.message);
      setOtherAvatar(data.avatar_url ?? null);
      openChat(data);
    }
    openFromParam();
  }, [otherId]);

  // load messages and subscribe to new ones when a chat is open
  // load messages and subscribe to new ones when a chat is open
  useEffect(() => {
    if (!convId || !userId) return;

    const currentConvId = convId;
    const currentUserId = userId;

    let cancelled = false;
    setMessages([]);

    const channel = supabase
      .channel(`dm-${convId}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          if (cancelled) return;

          const incoming = payload.new as Message;

          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id)
              ? prev
              : [incoming, ...prev],
          );
        },
      );

    // Subscribe only after registering all listeners.
    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        if (!cancelled) {
          setError('Unable to connect to live messages.');
        }
      }
    });

    async function loadMessages() {
      const cached = await loadCachedMessages(currentUserId, currentConvId);
      if (cancelled) return;

      if (cached.length) {
        setMessages(cached);
      }

      let query = supabase
        .from('messages')
        .select('id, sender_id, body, created_at')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (cached.length) {
        query = query.gt('created_at', cached[0].created_at);
      }

      const { data, error } = await query;

      if (cancelled) return;

      if (error) {
        setError(error.message);
        return;
      }

      const fresh = data ?? [];
      const cachedIds = new Set(cached.map((m) => m.id));

      setMessages((prev) => {
        const liveOnes = prev.filter((m) => !cachedIds.has(m.id));
        const base =
          fresh.length === 50
            ? fresh
            : mergeMessages(cached, fresh);

        return mergeMessages(base, liveOnes);
      });
    }

    loadMessages();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [convId, userId]);

  // keep the phone's copy up to date whenever the list changes
  useEffect(() => {
    if (!convId || !userId || messages.length === 0) return;
    saveCachedMessages(userId, convId, messages);
  }, [messages, convId, userId]);

  async function openChat(person: Profile) {
    setError('');
    const { data, error } = await supabase.rpc('get_or_create_conversation', { other: person.id });
    if (error) return setError(error.message);
    setOtherName(label(person));
    setConvId(data);
  }

  async function send() {
    const body = text.trim();
    if (!body || !userId || !convId) return;
    setText('');
    const { error } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, sender_id: userId, body });
    if (error) {
      setText(body);
      setError(error.message);
    }
  }

  // chats start from a profile's message button, so there's nobody to open here
  if (!otherId) return <Redirect href='/connect' />;

  // opening the chat
  if (!convId && !error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  // couldn't open it
  if (!convId) {
    return (
      <View style={styles.dm_screen}>
        <Text style={styles.dm_error}>{error}</Text>
      </View>
    );
  }

  // the chat
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Pressable
              onPress={() => router.push(`/user/${otherId}`)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Avatar uri={otherAvatar} size={32} />
              <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>{otherName}</Text>
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.dm_screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 44 : 0}
      >
        {/* Error message */}
        {error ? <Text style={styles.dm_error}>{error}</Text> : null}

        {/* Messages */}
        <FlatList
          inverted
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.dm_listContent}
          renderItem={({ item }) => {
            const mine = item.sender_id === userId;

            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  gap: 6,
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                {!mine ? <Avatar uri={otherAvatar} size={28} /> : null}
                <View
                  style={[
                    mine ? styles.dm_bubbleMine : styles.dm_bubbleTheirs,
                    { alignSelf: 'auto', maxWidth: '100%', flexShrink: 1 },
                  ]}
                >
                  <Text style={mine ? styles.dm_bubbleMineText : styles.dm_bubbleTheirsText}>
                    {item.body}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Message input */}
        <View style={styles.dm_inputRow}>
          <TextInput
            style={styles.dm_input}
            value={text}
            onChangeText={setText}
            placeholder="Message"
            placeholderTextColor={colors.textMuted}
          />

          <Pressable style={styles.dm_sendButton} onPress={send}>
            <Text style={styles.dm_sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}